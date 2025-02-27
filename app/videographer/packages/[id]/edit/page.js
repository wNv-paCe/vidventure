"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FileUpload from "../../upload";

export default function EditPackage() {
    const router = useRouter();
    const { id } = useParams();
    const [packageData, setPackageData] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);

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

    const handleSave = async () => {
        if (!packageData) return;
        const packageRef = doc(db, "servicePackage", id);
        await updateDoc(packageRef, {
            ...packageData,
            media: uploadedFiles.length ? uploadedFiles : packageData.media,
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
                    <Input
                        value={packageData.title}
                        onChange={(e) => setPackageData({ ...packageData, title: e.target.value })}
                    />
                    <Textarea
                        value={packageData.description}
                        onChange={(e) => setPackageData({ ...packageData, description: e.target.value })}
                    />
                    <FileUpload onUploadComplete={setUploadedFiles} />
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
