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
        // return response.data.fileUrls.map((url, index) => ({
        //     url,
        //     //type: files[index].file.type.startsWith("video") ? "video" : "image", // ✅ 标记文件类型
        // }));
    } catch (error) {
        console.error("Error uploading files:", error);
        throw new Error("Error uploading files.");
    }
};

// 删除文件功能
export const deleteFile = async (fileId) => {
    try {
        await axios.get(`http://localhost:5000/preview/${fileId}`);
        const response = await axios.delete(`http://localhost:5000/delete/${fileId}`);
        console.log("File deleted:", response.data);
        return response.data;  // 返回删除后的结果
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`File ${fileId} not found, skipping deletion.`);
            return { message: "File not found, skipping deletion." };
        }
        console.error("Error deleting file:", error);
        throw new Error("Error deleting file.");
    }
};

// 获取文件预览 URL
export const getFilePreviewUrl = async (fileId) => {
    try {
        const response = await axios.get(`http://localhost:5000/preview/${fileId}`);
        return response.data.previewUrl; // 确保返回的是 previewUrl
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.warn(`File ${fileId} not found.`);
            return null; // 或者返回一个默认图片 URL，比如 "/default-preview.png"
        }
        console.error("Error fetching file preview URL:", error);
        throw new Error("Error fetching file preview URL.");
    }
};

