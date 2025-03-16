"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/_utils/firebase";
import { auth } from "@/app/_utils/firebase"; // 确保引入 auth

export default function ServicePackageDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [servicePackage, setServicePackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // 新增状态

  useEffect(() => {
    if (!id) return;
    async function fetchServicePackage() {
      try {
        const docRef = doc(db, "servicePackage", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setServicePackage(docSnap.data());
        } else {
          console.error("Service package not found.");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching service package:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServicePackage();
  }, [id]);

  const handlePayment = async () => {
    if (isProcessing) return; // 防止重复点击
    setIsProcessing(true); // 设置为正在处理状态

    const user = auth.currentUser; // 直接获取当前用户
    console.log("Current id:", id);
    if (!user) {
      router.push(
        `/signup?userType=client&redirect=${encodeURIComponent(
          window.location.pathname
        )}`
      );
      setIsProcessing(false); // 处理完成
      return;
    }

    if (!user.emailVerified) {
      alert("Please verify your email before proceeding with the payment.");
      setIsProcessing(false); // 处理完成
      return;
    }

    const videographerId = servicePackage.ownerId; // Ensure ownerId exists
    if (!videographerId) {
      alert(
        "This service package is missing owner information. Please contact support."
      );
      setIsProcessing(false); // 处理完成
      return;
    }

    try {
      // Fetch userType from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userType = userSnap.exists() ? userSnap.data().type : "client"; // Default to 'client' if not found

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userType: userType,
          packageId: id,
          amount: servicePackage.price,
          videographerId: videographerId,
          serviceTitle: servicePackage.title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      console.log("Redirecting to:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to start payment. Please try again.");
    } finally {
      setIsProcessing(false); // 处理完成
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!servicePackage) {
    return <p>Service Package not found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button
        onClick={() => router.push("/")}
        className="mb-4 text-blue-500 hover:text-blue-700 font-semibold"
      >
        Back to Home
      </button>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{servicePackage.title}</h1>

        {servicePackage.media && servicePackage.media.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {servicePackage.media.map((mediaItem, index) => (
              <iframe
                key={index}
                src={mediaItem.url}
                title={mediaItem.name}
                width="100%"
                height="300"
                className="rounded-lg shadow-md"
                allowFullScreen
              ></iframe>
            ))}
          </div>
        )}

        <p className="text-xl font-bold text-blue-600 mb-4">
          Price: ${servicePackage.price}
        </p>

        <p className="text-gray-700">{servicePackage.description}</p>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t p-4 flex justify-between items-center">
        <div></div>
        <button
          onClick={handlePayment}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 flex flex-col items-center ml-auto"
        >
          <span className="text-lg font-bold">${servicePackage.price}</span>
          <span className="text-sm">Proceed to Payment</span>
        </button>
      </div>
    </div>
  );
}
