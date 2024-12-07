"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/app/_utils/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditUserField({
  userId,
  field,
  label,
  currentValue = "",
  type = "text",
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // Check if user is authenticated with Google
  const isGoogleUser = auth.currentUser?.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  // Send password reset email
  const handleSendResetEmail = async () => {
    setLoading(true);
    setMessage("");

    try {
      const email = auth.currentUser.email;
      if (!email) {
        throw new Error("Email not found.");
      }

      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent successfully!");
      setShowPasswordModal(false); // Close modal after success
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setMessage(err.message || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("User is not authenticated. Please log in again.");
      }

      // Check if user is authenticated with Google
      if (isGoogleUser) {
        throw new Error("Cannot update password for Google users.");
      }

      // Check if current password is provided
      if (!currentPassword) {
        setMessage("Please enter your current password.");
        setLoading(false);
        return;
      }

      // Create credential
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      // Reauthenticate user
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, newPassword);

      setMessage("Password updated successfully!");
      setShowPasswordModal(false); // Close modal after success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      setMessage(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!userId) return;

    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        [field]: value,
      });

      setMessage("Updated successfully!");
      setIsEditing(false);

      if (onUpdate) {
        onUpdate(field, value);
      }
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setMessage(err.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center space-y-6">
        <div className="text-sm space-y-1">
          <h3 className="font-medium">{label}</h3>
          {!isEditing ? (
            <p>
              {field === "password" ? "••••••••" : currentValue || "Not set"}
            </p>
          ) : (
            <Input
              id={field}
              type={type}
              value={value}
              onChange={handleChange}
              placeholder={`Enter new ${label.toLowerCase()}`}
            />
          )}
        </div>
        {!isEditing ? (
          <Button
            onClick={() => {
              if (field === "password") {
                setShowPasswordModal(true);
              } else {
                setIsEditing(true);
                setValue("");
              }
            }}
          >
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {field === "password" && showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6 w-[400px]">
            <h2 className="text-lg font-bold">Change Password</h2>
            {!isGoogleUser ? (
              // Regular users password change form
              <div className="space-y-4">
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            ) : (
              // Google users password reset email form
              <p className="text-sm text-gray-600">
                Since you logged in with Google, you cannot change your password
                directly. Please use the button below to receive a password
                reset email.
              </p>
            )}
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
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </Button>
              {!isGoogleUser ? (
                <Button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              ) : (
                <Button
                  onClick={handleSendResetEmail}
                  disabled={loading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
