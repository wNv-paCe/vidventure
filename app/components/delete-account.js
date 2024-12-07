"use client";

import React, { useState } from "react";
import { auth, db } from "@/app/_utils/firebase";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function DeleteAccount({ onAccountDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [password, setPassword] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setMessage("");

    try {
      if (!auth.currentUser) {
        throw new Error("User is not authenticated. Please log in again.");
      }

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete Firestore data
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await deleteDoc(userDocRef);

      // Delete Firebase Authentication user
      await deleteUser(auth.currentUser);

      setMessage("Your account has been deleted successfully.");
      setIsDeleting(false);

      // Notify parent component about the deletion
      if (onAccountDeleted) {
        onAccountDeleted();
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setMessage(err.message || "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="my-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-red-600">
            Delete Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Once you delete your account, there is no going back. Please confirm
            your password to proceed.
          </p>
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.includes("successfully")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => setConfirmModal(true)}
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isDeleting}
          >
            Delete Account
          </Button>
        </CardFooter>
      </Card>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4 w-[400px]">
            <h3 className="text-lg font-bold">Are you sure?</h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. Do you really want to delete your
              account?
            </p>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setConfirmModal(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
