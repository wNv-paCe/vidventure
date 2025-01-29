"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/app/_utils/auth-context";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  query,
  collection,
  where,
} from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EditUserField from "@/app/components/edit-user-field";
import DeleteAccount from "@/app/components/delete-account";

export default function Profile() {
  const { user } = useUserAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    specialization: "",
  });
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({
            fullName: data.fullName || "",
            bio: data.bio || "",
            specialization: data.specialization || "",
          });
          setUsername(data.username || "Not set");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          fullName: formData.fullName,
          bio: formData.bio,
          specialization: formData.specialization,
        },
        { merge: true }
      );

      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeleted = () => {
    // Redirect to home page after account deletion
    router.push("/");
  };

  //
  const capitalizeWords = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Update username in Firestore and update portfolios fullNames
  const handleFieldUpdate = async (field, newValue) => {
    const userRef = doc(db, "users", user.uid);

    try {
      if (field === "username") {
        // Capitalize username
        const capitalizedUsername = capitalizeWords(newValue);
        setUsername(capitalizedUsername);

        // Update username in Firestore
        await setDoc(
          userRef,
          { username: capitalizedUsername },
          { merge: true }
        );

        // Check if user is a videographer
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().type === "videographer") {
          console.log("User is a videographer, checking portfolios...");

          // Query all portfolios by user
          const portfoliosQuery = query(
            collection(db, "portfolios"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(portfoliosQuery);

          if (querySnapshot.empty) {
            console.log("No portfolios found for this videographer.");
            return;
          }

          // Batch update fullName in portfolios
          const batch = writeBatch(db);
          querySnapshot.forEach((doc) => {
            const portfolioRef = doc.ref;
            batch.update(portfolioRef, { fullName: capitalizedUsername });
          });

          await batch.commit();
          console.log("Full names updated in portfolios.");
        }
      } else {
        // Update other fields
        await setDoc(userRef, { [field]: newValue }, { merge: true });
      }
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EditUserField
            userId={user?.uid}
            field="username"
            label="Username"
            currentValue={username}
            onUpdate={handleFieldUpdate}
          />
          <EditUserField userId={user?.uid} field="password" label="Password" />
          <form onSubmit={handleUpdate} className="space-y-4 mt-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                type="text"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself"
              />
            </div>
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Input
                id="specialization"
                type="text"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                placeholder="e.g., Wedding, Corporate Events"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
          {message && (
            <p
              className={`mt-4 ${
                message.includes("successfully")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </CardContent>
      </Card>
      <DeleteAccount onAccountDeleted={handleAccountDeleted} />
    </div>
  );
}
