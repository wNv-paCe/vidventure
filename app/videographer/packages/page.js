"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, doc, addDoc, getDocs, where, updateDoc, query} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/app/_utils/firebase"; 

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

  const [editPackage, setEditPackage] = useState(null); // 当前正在编辑的套餐



  const [isAdding, setIsAdding] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: 0,
  });

  const handleEdit = (pkg) => {
    setEditPackage(pkg); // 设置要编辑的套餐
  };

  const savePackage = async (updatedPackage) => {
    if (!updatedPackage || !updatedPackage.id) return;
  
    try {
      const packageRef = doc(db, "servicePackage", updatedPackage.id);
      await updateDoc(packageRef, {
        title: updatedPackage.title,
        description: updatedPackage.description,
        price: updatedPackage.price,
      });
  
      // 更新本地状态
      setPackages((prevPackages) =>
        prevPackages.map((pkg) =>
          pkg.id === updatedPackage.id ? updatedPackage : pkg
        )
      );
  
      setEditPackage(null); // 关闭编辑表单
      console.log("Package updated successfully!");
    } catch (error) {
      console.error("Error updating package:", error);
    }
  };
  
  

  // const handleEdit = (id) => {
  //   // Implement edit functionality
  //   console.log(`Editing package with id: ${id}`);
  // };

  const handleDelete = (id) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  const addPackage = async (packageData) => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    if (userId) {
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

      setNewPackage({ title: "", description: "", price: 0 }); // 清空输入框
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
              <p className="mb-2">{pkg.description}</p>
              <p className="mb-4 font-bold">Price: ${pkg.price}</p>
              <img src={pkg.media?.[0]?.viewUrl || "/default-image.png"} alt={pkg.title} className="w-full h-32 object-cover mb-4" />

              <div className="flex justify-between">
              <Button variant="outline" onClick={() => handleEdit(pkg)}>Edit</Button>

                <Button
                  variant="destructive"
                  onClick={() => handleDelete(pkg.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>


          </Card>
        ))}

{editPackage && (
                <div className="mb-6 p-4 border rounded-md">
                  <h2 className="text-xl font-bold mb-4">Edit Package</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editPackage.title}
                        onChange={(e) =>
                          setEditPackage({ ...editPackage, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editPackage.description}
                        onChange={(e) =>
                          setEditPackage({ ...editPackage, description: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editPackage.price}
                        onChange={(e) =>
                          setEditPackage({ ...editPackage, price: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => savePackage(editPackage)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditPackage(null)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}


      </div>
    </div>
  );
}
