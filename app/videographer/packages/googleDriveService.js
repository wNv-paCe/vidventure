import axios from "axios";

// 上传文件功能
export const uploadFiles = async (files) => {
    const formData = new FormData();
    files.forEach(({ file }) => {
        formData.append("file", file);  // 将每个文件附加到 FormData
    });

    try {
        const response = await axios.post("http://localhost:5000/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Files uploaded:", response.data);
        return response.data.fileUrls;  // 返回文件的 URL 列表
    } catch (error) {
        console.error("Error uploading files:", error);
        throw new Error("Error uploading files.");
    }
};

// 删除文件功能
export const deleteFile = async (fileId) => {
    try {
        const response = await axios.delete(`http://localhost:5000/delete/${fileId}`);
        console.log("File deleted:", response.data);
        return response.data;  // 返回删除后的结果
    } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Error deleting file.");
    }
};

// 获取文件预览 URL
export const getFilePreviewUrl = (fileId) => {
    // 假设这是从数据库获取的文件 ID，通过 ID 生成文件的 URL
    return `https://drive.google.com/file/d/${fileId}/preview`;
};
