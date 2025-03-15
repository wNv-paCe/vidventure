//require：commonJS模块,服务端
//import：es6 模块,客户端

//创建http服务器，web application framework

//No.1
const express = require("express");

//处理文件上传,middleware, middleware是一个函数，接受req, res, next三个参数,它可以将文件临时保存在硬盘或者内存中
const multer = require("multer");

//处理跨域请求，cross-origin resource sharing，例如，前端页面是3000，后端是5000，前端请求后端，就是跨域请求
const cors = require('cors');
//digital ocean

//引入googleapis模块，用于访问Google Drive API
const { google } = require("googleapis");

//引入path模块，用于处理文件路径，例如获取文件名，文件扩展名等
const path = require("path");
//引入fs模块，用于读写文件
const fs = require("fs");


//const { url } = require("inspector");
//配置express
const app = express();
const port = 5000;

// 配置 multer 用于处理文件上传
const upload = multer({ dest: "uploads/" });

//支持跨域请求
app.use(cors());

// 加载服务账号的凭据
const KEY_PATH = "./keys/mediastorage-448505-1427128a001f.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Google API 身份验证
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: SCOPES,
});
//创建一个Google Drive客户端
const drive = google.drive({ version: "v3", auth });

//No.2

//define root route
app.get('/', (req, res) => {
    res.send('Hello Cutie!');
});

// 上传文件的 API 路由

//app.post：表示该路由只处理 HTTP POST 请求
//"/upload"：这是请求的路径，表示当客户端向服务器的 /upload 路径发送 POST 请求时，该路由处理函数将会被触发
//upload.array("file")：表示使用 upload 中间件处理名为 file 的文件上传，这个名字对应前端上传文件的字段名
//req：表示请求对象，包含了客户端发送过来的所有数据
//res：表示响应对象，用于向客户端发送响应数据
//async (req, res)：表示这是一个异步函数，可以使用 await 关键字等待异步操作的结果
//=>：箭头函数，表示函数的定义
//{}：函数体，包含了函数的具体实现
//try...catch：用于捕获异常，try 中的代码出现异常时，会跳转到 catch 中执行异常处理逻辑
//await：用于等待异步操作的结果，可以在异步函数中使用
//同步函数：按顺序执行，必须等待上一个函数执行完毕才能执行下一个函数
//异步函数：不按顺序执行，可以在等待的过程中执行其他函数
app.post("/upload", upload.array("file"), async (req, res) => {
    // 保存上传文件的 Google Drive URL
    const fileUrls = [];


    try {
        // 使用for of... 遍历所有上传的文件

        for (let file of req.files) {
            // 获取文件的路径和名称
            const filePath = file.path;
            const fileName = file.originalname;

            // 读取文件并上传到 Google Drive
            //javascript object，可以有多个键值对
            const fileMetadata = {
                name: fileName,
                parents: ["1PNFD8IMp_X08L8-IgRICHKnNk9GmL9uM"], // 选择上传的文件夹
            };
            //创建一个可读流，用于读取文件

            const media = {
                body: fs.createReadStream(filePath),
            };
            //使用 Google Drive API 上传文件，返回数据保存在 driveResponse 中

            const driveResponse = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: "id, name, webViewLink, webContentLink", // 返回的数据
            });
            console.log(driveResponse);  // 检查返回的完整数据

            // 设置文件的权限，使其可以被任何人访问
            await drive.permissions.create({
                fileId: driveResponse.data.id,
                requestBody: {
                    role: "reader",         // 只读权限
                    type: "anyone",         // 任何人都可以访问
                    allowFileDiscovery: false, // 防止文件被 Google 搜索到
                },
            });


            // 删除临时上传的文件
            fs.unlinkSync(filePath);

            // 保存每个文件的 Google Drive URL
            fileUrls.push({
                id: driveResponse.data.id,
                name: driveResponse.data.name,
                //url: driveResponse.data.webContentLink, // 修改为正确的图片 URL 格式
                //url: `https://lh3.googleusercontent.com/d/${driveResponse.data.id}`, // 修改为正确的图片 URL 格式
                url: `https://drive.google.com/file/d/${driveResponse.data.id}/preview`, // 根据id去derive新的preview链接
                type: file.mimetype.startsWith("video") ? "video" : "image", // ✅ 标记文件类型
            });
        }

        // 返回文件的 Google Drive URL
        // res.json({
        //     message: "File uploaded successfully",
        //     fileUrls: fileUrls,  // 返回多个文件的 URL
        // });
        //构造一个http响应，返回给客户端，状态码200表示成功，json格式数据包，包含了上传成功的消息和文件详细信息，
        // 返回文件的 Google Drive URL，包括文件的 ID，name，URL

        //No.3
        // res.status(200).json({
        //     message: "File uploaded successfully",
        //     // fileUrls: fileUrls,  // 返回多个文件的 ID 和 URL
        //     fileUrls: fileUrls.map(file => ({
        //         id: file.id,
        //         name: file.name,
        //         url: file.url  // 修改为正确的图片 URL 格式
        //     })),
        // });

        res.status(200).json({
            message: "File uploaded successfully",
            fileUrls: fileUrls,  // 直接返回原数组
        });

        //错误处理，如果上传文件失败，返回错误信息
        //500 是 HTTP 状态码，代表 服务器内部错误
    } catch (error) {
        console.error("Error uploading file:", error);
        //no.4
        res.status(500).send("Error uploading file");
    }
});

// 删除文件的 API 路由
app.delete("/delete/:fileId", async (req, res) => {
    // 从请求参数中获取文件 ID
    const fileId = req.params.fileId;

    try {
        // 使用 Google Drive API 删除文件
        await drive.files.delete({
            fileId: fileId,
        });

        // 返回删除成功的消息
        res.json({
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ message: "Error deleting file", error: error.message });
    }
});

// 获取文件的预览 URL
app.get("/preview/:fileId", async (req, res) => {
    const fileId = req.params.fileId;

    try {
        // 先检查文件是否存在
        await drive.files.get({ fileId });

        // 文件存在，返回预览 URL
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        res.json({ previewUrl });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`File ${fileId} not found.`);
            return res.status(404).json({ message: "File not found." });
        }

        console.error("Error fetching file preview:", error);
        res.status(500).json({ message: "Error fetching file preview", error: error.message });
    }
});


// 启动服务器
//监听端口，启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
