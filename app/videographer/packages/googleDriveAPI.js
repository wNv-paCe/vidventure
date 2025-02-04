const express = require("express");
const multer = require("multer");
const cors = require('cors');

const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

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

// 上传文件的 API 路由
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  const fileName = req.file.originalname;

  try {
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
      fields: "id, webViewLink",
    });

    // 删除临时上传的文件
    fs.unlinkSync(filePath);

    // 返回文件的 Google Drive URL
    res.json({
      message: "File uploaded successfully",
      fileUrl: `https://drive.google.com/file/d/${driveResponse.data.id}/view`,
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
