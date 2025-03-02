import React, { useState } from "react";
import axios from "axios";

//onUploadComplete 是一个回调函数，用于接收上传文件的 URL, 传递给父组件, 保存在 uploadedFiles 中,callback function

function FileUpload({ onUploadComplete }) {
    const [selectedFiles, setSelectedFiles] = useState([]); // 存储本地选中的文件
    const [fileUrls, setFileUrls] = useState([]); // 用于存储多个文件的 URL

    // 处理文件选择
    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files); // 将 FileList 转换为数组
        setSelectedFiles([...selectedFiles, ...newFiles]); // 追加到本地文件列表
    };

    // 删除本地列表中的某个文件
    const handleRemoveFile = (index) => {
        const newFileList = [...selectedFiles];
        newFileList.splice(index, 1); // 移除对应索引的文件
        setSelectedFiles(newFileList);
    };

    // 最终点击 "Add Package" 时，上传所有选定文件
    const handleUploadFiles = async () => {
        if (selectedFiles.length === 0) {
            alert("No files to upload!");
            return;
        }
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append("file", file);
        });

        try {
            // 使用 axios 发送 POST 请求上传文件
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("File uploaded:", response.data);
            alert("Files uploaded successfully!");
            // 更新状态保存所有上传文件的 URL
            setFileUrls(response.data.fileUrls);
            // 传递文件信息给父组件
            if (onUploadComplete) {
                //console.log("Calling onUploadComplete with:", response.data.fileUrls);
                onUploadComplete(response.data.fileUrls);  // fileUrls 是一个数组 [{ name, id, url }]
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file");
        }
    }

    const handleFileUpload = async () => {
        const formData = new FormData();
        // 遍历所有文件并将其附加到 FormData
        Array.from(files).forEach(file => {
            formData.append("file", file);
        });

        try {
            // 使用 axios 发送 POST 请求上传文件
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("File uploaded:", response.data);
            alert("Files uploaded successfully!");
            // 更新状态保存所有上传文件的 URL
            setFileUrls(response.data.fileUrls);
            // 传递文件信息给父组件
            if (onUploadComplete) {
                //console.log("Calling onUploadComplete with:", response.data.fileUrls);
                onUploadComplete(response.data.fileUrls);  // fileUrls 是一个数组 [{ name, id, url }]
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file");
        }
    };

    return (
        <div>
            <h1>Add Some Media Files</h1>
            {/* 选择文件 */}
            <input type="file" onChange={handleFileChange} multiple />
            
            {/* 显示本地已选的文件 */}
            {selectedFiles.length > 0 && (
                <div>
                    <h2>Selected Files:</h2>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>
                                {file.name}
                                <button onClick={() => handleRemoveFile(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 只有在最终点击 "Add Package" 时才上传 */}
            <button onClick={handleUploadFiles}>Save</button>

            {/* 上传后显示文件链接 */}
            {fileUrls.length > 0 && (
                <div>
                    <h2>Uploaded Files:</h2>
                    <ul>
                        {fileUrls.map((file, index) => (
                            <li key={index}>
                                <iframe src={file.url} width="200"></iframe>
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                    View File {file.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
