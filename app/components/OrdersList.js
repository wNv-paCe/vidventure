"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/app/_utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import ContactButton from "@/app/components/contact-button";
import { onAuthStateChanged } from "firebase/auth";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [otherUserNames, setOtherUserNames] = useState({});
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError("You must be logged in to view your orders.");
        setLoading(false);
        return;
      }

      // Fetch userType from Firestore after auth is ready
      const userRef = doc(db, "users", user.uid);
      const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
        const userData = snapshot.data();
        if (userData) {
          setUserType(userData.type);
        }
      });

      return () => unsubscribeUser();
    });

    return () => unsubscribe();
  }, []);

  const fetchOtherUserName = async (userId) => {
    if (!userId || otherUserNames[userId]) return;

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setOtherUserNames((prev) => ({
          ...prev,
          [userId]: userSnap.data().username || "Unknown User",
        }));
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  useEffect(() => {
    orders.forEach((order) => {
      const otherUserId =
        userType === "client" ? order.receiverId : order.payerId;
      fetchOtherUserName(otherUserId);
    });
  }, [orders, userType]);

  useEffect(() => {
    if (!userType) return;

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Determine query based on user type
    const q =
      userType === "client"
        ? query(collection(db, "transactions"), where("payerId", "==", userId))
        : query(
            collection(db, "transactions"),
            where("receiverId", "==", userId)
          );

    const unsubscribeOrders = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching orders:", err.message);
        setError("Failed to load orders.");
        setLoading(false);
      }
    );

    return () => unsubscribeOrders();
  }, [userType]);

  const handleConfirmCompletion = async (orderId) => {
    const confirmCompletion = window.confirm(
      "Are you sure you want to mark this order as completed?"
    );
    if (!confirmCompletion) return;

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be logged in");
      const token = await user.getIdToken();
      console.log("User Token:", token);

      const response = await fetch(
        "https://us-central1-vidventure-83846.cloudfunctions.net/completeOrder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactionId: orderId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert("Order completed and funds unlocked.");
    } catch (err) {
      console.error("Error completing order via cloud function:", err.message);
      alert("Failed to complete order.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {userType === "client" ? "My Orders" : "Received Orders"}
      </h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders available.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border rounded-lg shadow">
              <CardHeader>
                <CardTitle>
                  {order.serviceTitle || "Untitled Service"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">
                  <strong>
                    {userType === "client"
                      ? "Videographer Name:"
                      : "Client Name:"}
                  </strong>{" "}
                  {otherUserNames[
                    userType === "client" ? order.receiverId : order.payerId
                  ] || "Unknown User"}
                </p>
                <p className="mb-2">
                  <strong>Amount:</strong> ${order.amount}
                </p>
                <p className="mb-4">
                  <strong>Status:</strong> {order.status}
                </p>
                <div className="flex w-1/2 justify-start space-x-4">
                  <ContactButton
                    otherUserId={
                      userType === "client" ? order.receiverId : order.payerId
                    }
                    otherUserName={
                      otherUserNames[
                        userType === "client" ? order.receiverId : order.payerId
                      ] || "Unknown User"
                    }
                    userType={userType}
                    onSuccess={() =>
                      router.push(
                        `/${userType}/messages?${
                          userType === "client"
                            ? `videographerId=${order.receiverId}`
                            : `clientId=${order.payerId}`
                        }`
                      )
                    }
                  />
                  {order.status === "pending" && userType === "client" && (
                    <Button
                      onClick={() => handleConfirmCompletion(order.id)}
                      className="w-28 bg-green-500 text-white rounded-md py-2 hover:bg-green-600"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
