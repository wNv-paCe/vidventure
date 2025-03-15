import React, { useState, useEffect } from "react";
import GoogleDriveService from "./googleDriveService";
import { deleteFile } from "./googleDriveService";
import axios from "axios";

//onUploadComplete 是一个回调函数，用于接收上传文件的 URL, 传递给父组件, 保存在 uploadedFiles 中,callback function

function MediaManagement({ onFilesChange, initialFiles = [] }) {
    const [selectedFiles, setSelectedFiles] = useState(initialFiles); // 存储本地选中的文件
    const [mediaFiles, setMediaFiles] = useState([]); //管理所有文件（本地上传 + Firebase 获取）
    const [deletedFiles, setDeletedFiles] = useState([]);  // 记录需要从google drive中删除的文件 ID


    // 确保 `onFilesChange` 只在 `mediaFiles` 变化后更新 `uploadedFiles`
    useEffect(() => {
        onFilesChange(mediaFiles, deletedFiles);  // 更新父组件
    }, [mediaFiles, deletedFiles, onFilesChange]);  // 依赖 `mediaFiles` 和 `deletedFiles`, `onFilesChange`, 任何一个变化都会触发



    // 初始化 `mediaFiles`，确保 `initialFiles` 正确处理
    useEffect(() => {
        if (initialFiles.length > 0) {
            console.log("initialFiles", initialFiles);
            const formattedFiles = initialFiles.map(file => ({
                id: file.id || null, // Firebase 文件有 ID，本地上传文件没有
                name: file.name, // 文件名
                type: file.type, // 已存储类型
                url: file.url, // Firebase 文件使用 URL                
            }));
            setMediaFiles(formattedFiles);
        }

    }, [initialFiles]);


    // const handleFileChange = (event) => {
    //     const files = Array.from(event.target.files);
    //     const newFiles = files.map((file) => ({
    //         file,
    //         previewUrl: URL.createObjectURL(file), // 创建本地预览 URL
    //         type: file.type.startsWith("video") ? "video" : "image",
    //     }));
    //     setMediaFiles([...mediaFiles, ...newFiles]);
    //     if (onFilesChange) onFilesChange(mediaFiles);  // 更新父组件
    // };

    // 处理文件上传
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map((file) => ({
            file,
            url: URL.createObjectURL(file), // 本地文件需要创建 URL
            type: file.type.startsWith("video") ? "video" : "image",
        }));
        setMediaFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };


    const handleRemoveFile = async (index, fileId) => {
        try {
            if (fileId) {
                setDeletedFiles((prev) => [...prev, fileId]);  // 记录删除的文件 ID
            }
            setMediaFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        } catch (error) {
            console.error("Failed to delete file:", error);
        }
    };


    // useEffect(() => {
    //     setMediaFiles(initialFiles);
    // }, [initialFiles.length]);  // 只依赖 initialFiles 的长度

    // useEffect(() => {
    //     setMediaFiles(initialFiles);
    // }, [initialFiles]);  // 直接监听 `initialFiles`







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
                    {/* 媒体预览 */}
                    {media.url.includes("drive.google.com") ? (
                        <iframe
                            src={media.url}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                        ></iframe>
                    ) : media.type === "image" ? (
                        <img src={media.url} alt="preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <video src={media.url} className="w-full h-full rounded-lg" controls />
                    )}

                    {/* 删除按钮（鼠标悬停时显示） */}
                    <button
                        onClick={() => handleRemoveFile(index, media.id)}
                        className="absolute top-1.5 left-1.5 bg-red-500 text-white rounded p-1"
                    >
                        ❌
                    </button>
                </div>
            ))}
        </div>
    );
}

export default MediaManagement;
