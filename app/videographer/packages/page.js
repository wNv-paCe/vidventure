"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Packages() {
  const [packages, setPackages] = useState([
    {
      id: "1",
      title: "Basic Package",
      description: "2 hours of video shooting and basic editing",
      price: 500,
    },
    {
      id: "2",
      title: "Standard Package",
      description:
        "4 hours of video shooting, advanced editing, and highlight reel",
      price: 1000,
    },
    {
      id: "3",
      title: "Premium Package",
      description:
        "Full day coverage, professional editing, highlight reel, and raw footage",
      price: 2000,
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newPackage, setNewPackage] = useState({
    title: "",
    description: "",
    price: 0,
  });

  const handleEdit = (id) => {
    // Implement edit functionality
    console.log(`Editing package with id: ${id}`);
  };

  const handleDelete = (id) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  const handleAddNew = () => {
    setPackages([...packages, { ...newPackage, id: Date.now().toString() }]);
    setNewPackage({ title: "", description: "", price: 0 });
    setIsAdding(false);
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
            <Button onClick={handleAddNew}>Add Package</Button>
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
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => handleEdit(pkg.id)}>
                  Edit
                </Button>
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
      </div>
    </div>
  );
}
