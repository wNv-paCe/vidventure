// /pages/api/googleDriveHandler.js

import { google } from "googleapis";
import multer from "multer";
import fs from "fs";
import { promisify } from "util";

export const config = {
  api: {
    bodyParser: false,
  },
};

const unlinkAsync = promisify(fs.unlink);
const upload = multer({ dest: "/tmp" });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// Google Drive 认证
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

export default async function handler(req, res) {
  try {
    // POST: 上传文件
    if (req.method === "POST") {
      await runMiddleware(req, res, upload.array("file"));
      const fileUrls = [];

      for (const file of req.files) {
        const metadata = {
          name: file.originalname,
          parents: ["1PNFD8IMp_X08L8-IgRICHKnNk9GmL9uM"],
        };
        const media = { body: fs.createReadStream(file.path) };

        const driveRes = await drive.files.create({
          resource: metadata,
          media,
          fields: "id, name",
        });

        await drive.permissions.create({
          fileId: driveRes.data.id,
          requestBody: {
            role: "reader",
            type: "anyone",
            allowFileDiscovery: false,
          },
        });

        fileUrls.push({
          id: driveRes.data.id,
          name: driveRes.data.name,
          url: `https://drive.google.com/file/d/${driveRes.data.id}/preview`,
          type: file.mimetype.startsWith("video") ? "video" : "image",
        });

        await unlinkAsync(file.path);
      }

      return res.status(200).json({ message: "Uploaded", fileUrls });
    }

    // DELETE: 删除文件
    if (req.method === "DELETE") {
      const fileId = req.query.fileId;
      if (!fileId) return res.status(400).json({ message: "Missing fileId" });

      await drive.files.delete({ fileId });
      return res.status(200).json({ message: "File deleted successfully" });
    }

    // GET: 获取预览链接
    if (req.method === "GET") {
      const fileId = req.query.fileId;
      if (!fileId) return res.status(400).json({ message: "Missing fileId" });

      await drive.files.get({ fileId }); // 确保文件存在
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      return res.status(200).json({ previewUrl });
    }

    // 其他方法不支持
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("Google Drive handler error:", error);
    return res.status(500).json({ message: "Error processing request", error: error.message });
  }
}
