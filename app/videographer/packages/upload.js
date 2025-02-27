import React, { useState } from "react";
import axios from "axios";

function FileUpload({ onUploadComplete }) {
    const [files, setFiles] = useState([]); // 用于存储多个文件
    const [fileUrls, setFileUrls] = useState([]); // 用于存储多个文件的 URL

    const handleFileChange = (event) => {
        // 获取选择的文件并更新状态
        setFiles(event.target.files);
    };

    const handleFileUpload = async () => {
        const formData = new FormData();
        // 遍历所有文件并将其附加到 FormData
        Array.from(files).forEach(file => {
            formData.append("file", file);
        });

        try {
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
            <h1>Upload File to Google Drive</h1>
            <input type="file" onChange={handleFileChange} multiple />
            <button onClick={handleFileUpload}>Upload</button>

            {/* 显示所有上传的文件链接 */}
            {fileUrls.length > 0 && (
                <div>
                    <h2>Uploaded Files:</h2>
                    
                    <ul>
                        {fileUrls.map((file, index) => (
                            <li key={index}>
                                
                                <iframe src= {file.url} width="200" ></iframe>

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
