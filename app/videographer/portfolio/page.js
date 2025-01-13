"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/app/_utils/firebase";
import PortfolioList from "./portfolio-list";
import AddPortfolioItem from "./add-portfolio-item";
import { Button } from "@/components/ui/button";

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load Portfolio from Firestore
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.error("User not authenticated");
          return;
        }

        const q = query(
          collection(db, "portfolios"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPortfolioItems(items);
      } catch (err) {
        console.error("Error fetching portfolio items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  // Delete Portfolio Item
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteDoc(doc(db, "portfolios", itemToDelete.id));
      setPortfolioItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemToDelete.id)
      );
      setItemToDelete(null);
      setShowConfirm(false);
    } catch (err) {
      console.error("Error deleting portfolio item:", err);
    }
  };

  // Open confirm delete dialog
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirm(true);
  };

  // Close confirm delete dialog
  const handleCancelDelete = () => {
    setItemToDelete(null);
    setShowConfirm(false);
  };

  // Edit Portfolio Item
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>
      <Button
        className="mb-6"
        onClick={() => setEditingItem({})} // Open modal to add new item
      >
        Add New Item
      </Button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <PortfolioList
          items={portfolioItems}
          onEdit={handleEdit}
          onDelete={handleDeleteClick} // Trigger delete confirmation dialog
        />
      )}
      {editingItem && (
        <AddPortfolioItem
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(newItem) => {
            if (!editingItem.id) {
              // Add new item
              setPortfolioItems((prevItems) => [...prevItems, newItem]);
            } else {
              // Update existing item
              setPortfolioItems((prevItems) =>
                prevItems.map((item) =>
                  item.id === newItem.id ? newItem : item
                )
              );
            }
            setEditingItem(null);
          }}
        />
      )}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[400px]">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this portfolio item? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
