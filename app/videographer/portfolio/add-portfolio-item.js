"use client";

import React, { useState, useEffect } from "react";
import { addDoc, updateDoc, collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/app/_utils/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddPortfolioItem({ item = {}, onClose, onSave }) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item.thumbnailUrl || "");
  const [url, setUrl] = useState(item.url || "");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(item.id);

  // Capitalize the first letter of each word
  const capitalizeWords = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Fetch the current user's fullname
  useEffect(() => {
    async function fetchUsername() {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("User not authenticated");
        return;
      }

      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          let username = userSnap.data().username || "Unknown User";
          const capitalizedUsername = capitalizeWords(username);

          setFullName(capitalizedUsername);
        } else {
          console.error("User data not found in Firestore");
        }
      } catch (error) {
        console.error("Error fetching username:", error.message);
      }
    }

    fetchUsername();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      let newItem;

      if (isEditing) {
        const itemRef = doc(db, "portfolios", item.id);
        await updateDoc(itemRef, {
          title,
          description,
          thumbnailUrl,
          url,
          fullName,
        });
        newItem = {
          ...item,
          title,
          description,
          thumbnailUrl,
          url,
          fullName,
        };
      } else {
        const collectionRef = collection(db, "portfolios");
        const docRef = await addDoc(collectionRef, {
          title,
          description,
          thumbnailUrl,
          url,
          fullName,
          userId,
          createdAt: new Date().toISOString(),
        });
        newItem = {
          id: docRef.id,
          title,
          description,
          thumbnailUrl,
          url,
          fullName,
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
            <p className="text-sm font-medium">
              Author: {fullName || "Loading..."}
            </p>
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
