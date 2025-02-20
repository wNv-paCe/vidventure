"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, doc, deleteDoc, addDoc, getDocs, where, updateDoc, query} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/app/_utils/firebase"; 
import FileUpload from "./upload";

export default function Packages() {
  
  const fetchUserPackages = async (userId) => {
    const q = query(collection(db, "servicePackage"), where("ownerId", "==", userId));
    const querySnapshot = await getDocs(q);
    const fetchedPackages = [];
    
    querySnapshot.forEach((doc) => {
      fetchedPackages.push({ id: doc.id, ...doc.data() });
    });
    setPackages(fetchedPackages);
  };
  

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      fetchUserPackages(user.uid);  // 调用 API 获取套餐数据
    }
  }, []);

  
  const [packages, setPackages] = useState([]);

  const [uploadedFiles, setUploadedFiles] = useState([]);  // 存储上传的文件信息

  const [editPackageId, setEditPackageId] = useState(null); // 记录正在编辑的 package ID
  const [editPackageData, setEditPackageData] = useState(null); // 记录当前编辑的数据

  const [isAdding, setIsAdding] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: "",
    media: [],  // 添加 media 字段
  });

  const handleUploadComplete = (files) => {
    setUploadedFiles(files); // 这里的 files 是 [{ name, id, url }]
    //setNewPackage(prev => ({ ...prev, media: files }));  // 确保 media 也更新
    //console.log("Files received from upload component:", files);
  };

  const handleEdit = (pkg) => {
    setEditPackageId(pkg.id);
    setEditPackageData({ ...pkg }); // 复制套餐数据
  };

  const handleCancelEdit = () => {
    setEditPackageId(null);
    setEditPackageData(null);
  };


  const savePackage = async (updatedPackage) => {
    if (!editPackageData || !editPackageId) return;

    if (!editPackageData.title || !editPackageData.description) {
      alert("Title and description cannot be empty");
      return;
    }

    if (editPackageData.price < 0) {
      alert("Price must be 0 or a positive number");
      return;
    }
  
    try {
      const packageRef = doc(db, "servicePackage", editPackageId);
      await updateDoc(packageRef, {
        title: editPackageData.title,
        description: editPackageData.description,
        price: editPackageData.price,
      });
  
      // 更新本地状态
      setPackages((prevPackages) =>
        prevPackages.map((pkg) =>
          pkg.id === editPackageId ? editPackageData : pkg
        )
      );
  
      setEditPackageId(null); // 退出编辑模式
      setEditPackageData(null);
      console.log("Package updated successfully!");
    } catch (error) {
      console.error("Error updating package:", error);
    }
  };
  


  const handleDelete = async (id) => {
    try {
      // 获取要删除的文档引用
      const packageRef = doc(db, "servicePackage", id);
  
      // 删除 Firestore 中的套餐
      await deleteDoc(packageRef);
  
      // 更新本地状态，移除被删除的套餐
      setPackages((prevPackages) => prevPackages.filter((pkg) => pkg.id !== id));
  
      console.log("Package deleted successfully!");
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const addPackage = async (packageData) => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!packageData.title || !packageData.description) {
      alert("Title and description cannot be empty");
      return;
    }

    if (packageData.price < 0) {
      alert("Price must be 0 or a positive number");
      return;
    }

    
    if (userId) {

      const packageData = {
        ...newPackage,
        ownerId: userId,
        media: uploadedFiles,  // 存入 Firestore
      };
      const docRef = await addDoc(collection(db, "servicePackage"), {
        ...packageData,
        ownerId: userId, // 关联当前用户
      });
      console.log("Package added with ID:", docRef.id);
      // 更新本地状态，立即显示新套餐
      setPackages((prevPackages) => [
        ...prevPackages,
        { id: docRef.id, ...packageData, ownerId: userId },
      ]);

      setNewPackage({ title: "", description: "", price: "", media: []}); // 清空输入框
      setUploadedFiles([]);  // 清空已上传文件
      setIsAdding(false);
      
    } else {
      console.error("User not authenticated");
    }

  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Packages</h1>
      
      <Button onClick={() => setIsAdding(true)} className="mb-6">
        Add New Package
      </Button>

      {isAdding && (
        <div className="mb-6 p-4 border rounded-md">
          <h2 className="text-xl font-bold mb-4">Add New Package</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPackage.title}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newPackage.description}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, description: e.target.value })
                }
              />
            </div>
            <FileUpload onUploadComplete={handleUploadComplete}/>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={newPackage.price}
                onChange={(e) =>
                  setNewPackage({
                    ...newPackage,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>
            <Button onClick={() => addPackage(newPackage)}>Add Package</Button>
          </div>
        </div>
      )}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle>{pkg.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {editPackageId === pkg.id ? (
                // **编辑模式**
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editPackageData.title}
                      onChange={(e) =>
                        setEditPackageData({ ...editPackageData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editPackageData.description}
                      onChange={(e) =>
                        setEditPackageData({ ...editPackageData, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editPackageData.price}
                      onChange={(e) =>
                        setEditPackageData({ ...editPackageData, price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={savePackage}>Save</Button>
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // **正常显示模式**
                <>
                  <p className="mb-2">{pkg.description}</p>
                  <p className="mb-4 font-bold">Price: ${pkg.price}</p>
                  <iframe src={pkg.media?.[0]?.url || "/default-image.png"} alt={pkg.media?.[0]?.name} className="w-full h-32 object-cover mb-4" />

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => handleEdit(pkg)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(pkg.id)}>Delete</Button>
                  </div>
                </>
              )}
            </CardContent>


          </Card>
        ))}


      </div>
    </div>
  );
}
