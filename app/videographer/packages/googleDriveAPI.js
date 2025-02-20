const express = require("express");
const multer = require("multer");
const cors = require('cors');
//digital ocean

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const { url } = require("inspector");

const app = express();
const port = 5000;

// 配置 multer 用于处理文件上传
const upload = multer({ dest: "uploads/" });

app.use(cors());

// 加载服务账号的凭据
const KEY_PATH = "./keys/mediastorage-448505-1427128a001f.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// Google API 身份验证
const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });

//define root route
app.get('/', (req, res) => {
    res.send('Hello Cutie!');
});

// 上传文件的 API 路由
app.post("/upload", upload.array("file"), async (req, res) => {
    const fileUrls = [];


    try {

        for (let file of req.files) {
            const filePath = file.path;
            const fileName = file.originalname;

            // 读取文件并上传到 Google Drive
            const fileMetadata = {
                name: fileName,
                parents: ["1PNFD8IMp_X08L8-IgRICHKnNk9GmL9uM"], // 选择上传的文件夹
            };

            const media = {
                body: fs.createReadStream(filePath),
            };

            const driveResponse = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: "id, name, webViewLink",
            });
            console.log(driveResponse);  // 检查返回的完整数据

            // 删除临时上传的文件
            fs.unlinkSync(filePath);

            // 保存每个文件的 Google Drive URL
            fileUrls.push({
                id: driveResponse.data.id,
                url: `https://lh3.googleusercontent.com/d/${driveResponse.data.id}=w1920-h1080`, // 修改为正确的图片 URL 格式
              });
        }

        // 返回文件的 Google Drive URL
        // res.json({
        //     message: "File uploaded successfully",
        //     fileUrls: fileUrls,  // 返回多个文件的 URL
        // });

        res.status(200).json({
            message: "File uploaded successfully",
            // fileUrls: fileUrls,  // 返回多个文件的 ID 和 URL
            fileUrls: fileUrls.map(file => ({
              id: file.id,
              url: `https://lh3.googleusercontent.com/d/${file.id}=w1920-h1080`  // 修改为正确的图片 URL 格式
            })),
          });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Error uploading file");
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
