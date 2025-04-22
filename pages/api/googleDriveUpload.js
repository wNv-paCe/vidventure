import { google } from "googleapis";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

// 处理 multipart form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// multer 配置
const upload = multer({ dest: "/tmp" }); // Vercel 的临时路径

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// 初始化 Google Drive API
const auth = new google.auth.GoogleAuth({
  keyFile: "app/videographer/packages/keys/mediastorage-448505-1427128a001f.json",
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = google.drive({ version: "v3", auth });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await runMiddleware(req, res, upload.array("file"));

  const fileUrls = [];

  try {
    for (const file of req.files) {
      const fileMetadata = {
        name: file.originalname,
        parents: ["1PNFD8IMp_X08L8-IgRICHKnNk9GmL9uM"],
      };
      const media = { body: fs.createReadStream(file.path) };

      const driveResponse = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, name",
      });

      await drive.permissions.create({
        fileId: driveResponse.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
          allowFileDiscovery: false,
        },
      });

      fileUrls.push({
        id: driveResponse.data.id,
        name: driveResponse.data.name,
        url: `https://drive.google.com/file/d/${driveResponse.data.id}/preview`,
        type: file.mimetype.startsWith("video") ? "video" : "image",
      });

      await unlinkAsync(file.path);
    }

    res.status(200).json({ message: "Uploaded", fileUrls });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
}
