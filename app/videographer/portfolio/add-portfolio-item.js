"use client";

import React, { useState } from "react";
import { addDoc, updateDoc, collection, doc } from "firebase/firestore";
import { db, auth } from "@/app/_utils/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddPortfolioItem({ item = {}, onClose, onSave }) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item.thumbnailUrl || "");
  const [url, setUrl] = useState(item.url || "");
  const [fullName, setFullName] = useState(item.fullName || "");
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(item.id);

  function capitalizeWords(name) {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newItem;
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const formattedFullName = capitalizeWords(fullName);

      if (isEditing) {
        const itemRef = doc(db, "portfolios", item.id);
        await updateDoc(itemRef, {
          title,
          description,
          thumbnailUrl,
          url,
          fullName: formattedFullName,
        });
        newItem = {
          ...item,
          title,
          description,
          thumbnailUrl,
          url,
          fullName: formattedFullName,
        };
      } else {
        const collectionRef = collection(db, "portfolios");
        const docRef = await addDoc(collectionRef, {
          title,
          description,
          thumbnailUrl,
          url,
          fullName: formattedFullName,
          userId,
          createdAt: new Date().toISOString(),
        });
        newItem = {
          id: docRef.id,
          title,
          description,
          thumbnailUrl,
          url,
          fullName: formattedFullName,
        };
      }

      onSave(newItem);
    } catch (err) {
      console.error("Error:", err.message);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-[400px]">
        <h2 className="text-lg font-bold mb-4">
          {isEditing ? "Edit Portfolio Item" : "Add New Portfolio Item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium">
              Thumbnail URL
            </label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium">
              Portfolio URL
            </label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              Author Full Name
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
