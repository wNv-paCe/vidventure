import React, { useState, useEffect } from "react";
import GoogleDriveService from "./googleDriveService";
import axios from "axios";

//onUploadComplete 是一个回调函数，用于接收上传文件的 URL, 传递给父组件, 保存在 uploadedFiles 中,callback function

function MediaManagement({ onFilesChange, initialFiles = [] }) {
    const [selectedFiles, setSelectedFiles] = useState(initialFiles); // 存储本地选中的文件
    const [mediaFiles, setMediaFiles] = useState([]);


    // 确保 `onFilesChange` 只在 `mediaFiles` 变化后更新 `uploadedFiles`
    useEffect(() => {
        onFilesChange(mediaFiles);
    }, [mediaFiles, onFilesChange]);  // 依赖 `mediaFiles`，它更新时才调用


    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file), // 创建本地预览 URL
            type: file.type.startsWith("video") ? "video" : "image",
        }));
        setMediaFiles([...mediaFiles, ...newFiles]);
        if (onFilesChange) onFilesChange(mediaFiles);  // 更新父组件
    };


    const handleRemoveFile = async (index, fileId) => {
        try {
            if (fileId) {
                await GoogleDriveService.deleteFile(fileId);
            }
            setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Failed to delete file:", error);
        }
    };
    

    useEffect(() => {
        setMediaFiles(initialFiles);
    }, [initialFiles.length]);  // 只依赖 initialFiles 的长度






    return (
        <div className="flex flex-wrap gap-2">
            {/* 上传文件按钮（加号按钮） */}
            <label className="flex items-center justify-center w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                <input type="file" className="hidden" onChange={handleFileChange} multiple accept="image/*,video/*" />
                <span className="text-2xl font-bold">+</span>
            </label>

            {/* 预览已选择的文件 */}
            {mediaFiles.map((media, index) => (
                <div key={index} className="relative w-48 h-48">
                    {/* 图片预览 */}
                    {media.type === "image" ? (
                        <img src={media.previewUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <video src={media.previewUrl} className="w-full h-full rounded-lg" controls />
                    )}

                    {/* 删除按钮（鼠标悬停时显示） */}
                    <button
                        onClick={() => handleRemoveFile(index, media.id)}
                        className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded p-1"
                    >
                        ❌
                    </button>
                </div>
            ))}
        </div>
    );
}

export default MediaManagement;
