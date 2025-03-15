"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { deleteFile, uploadFiles, getFilePreviewUrl } from "../../googleDriveService";
import MediaManagement from "../../mediaManagement";


export default function EditPackage() {
    const router = useRouter();
    const { id } = useParams();
    const [packageData, setPackageData] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [deletedFiles, setDeletedFiles] = useState([]);  // 记录被删除的文件 ID

    useEffect(() => {
        const fetchPackage = async () => {
            const docRef = doc(db, "servicePackage", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPackageData(docSnap.data());
            } else {
                console.error("Package not found");
                router.push("/videographer/packages");
            }
        };
        fetchPackage();
    }, [id]);

    const handleFilesChange = (newFiles, deleted) => {
        setUploadedFiles(newFiles);
        setDeletedFiles(deleted);  // 记录删除的文件
    };

    const handleSave = async () => {
        if (!packageData) return;

        if (!packageData.title || !packageData.description) {
            alert("Title and description cannot be empty");
            return;
          }
      
          if (packageData.price <= 0) {
            alert("Price must be a positive number");
            return;
          }

        // 过滤出仍然存在的文件
        const validFiles = await Promise.all(
            packageData.media.map(async (file) => {
                try {
                    await getFilePreviewUrl(file.id);
                    return file;  // 文件存在，保留
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        console.warn(`File ${file.id} not found, removing from Firebase.`);
                        return null; // 文件不存在，移除
                    }
                    throw error;  // 其他错误，抛出
                }
            })
        );

        const updatedMedia = validFiles.filter((file) => file !== null);

        // 1️⃣ 先删除被移除的文件（从 Google Drive）
        await Promise.all(
            deletedFiles.map(async (fileId) => {
                try {
                    await deleteFile(fileId);
                } catch (error) {
                    console.error("删除文件失败:", error);
                }
            })
        );

        // 2️⃣ 过滤出本地未上传的文件（它们有 `file` 属性）
        const newFiles = uploadedFiles.filter(file => file.file);
        const existingFiles = uploadedFiles.filter(file => !file.file);
        console.log("uploadedFileData", newFiles);
        console.log("existingFiles", existingFiles);

        // 3️⃣ 上传新文件到 Google Drive
        const uploadedFileData = await Promise.all(
            newFiles.map(async (file) => {
                try {
                    const response = await uploadFiles([file]);
                    return response[0];
                } catch (error) {
                    console.error("文件上传失败:", error);
                    return null;
                }
            })
        );
        console.log("uploadedFileData", uploadedFileData);

        const packageRef = doc(db, "servicePackage", id);
        await updateDoc(packageRef, {
            ...packageData,
            //media: uploadedFiles.length ? uploadedFiles : packageData.media,
            media: [...existingFiles, ...uploadedFileData],  // 旧文件 + 新上传文件
        });
        router.push("/videographer/packages");

    };

    const handleCancel = () => {
        router.push("/videographer/packages");
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Edit Package</h1>
            {packageData ? (
                <div className="space-y-4">
                    <Label htmlFor="title">Title</Label>
                    <Label></Label>
                    <Input
                        id="title"
                        value={packageData.title}
                        onChange={(e) => setPackageData({ ...packageData, title: e.target.value })}
                    />
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={packageData.description}
                        onChange={(e) => setPackageData({ ...packageData, description: e.target.value })}
                    />
                    <Label htmlFor="price">Price</Label>
                    <Input
                        id="price"
                        value={packageData.price}
                        onChange={(e) => setPackageData({ ...packageData, price: e.target.value })}
                    />
                    <MediaManagement onFilesChange={handleFilesChange} initialFiles={packageData.media || []} />
                    <div className="flex gap-4">
                        <Button onClick={handleSave}>Save</Button>
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
