"use client";

import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/app/_utils/auth-context";
import { useRouter } from "next/navigation";

export default function VideographerDashboard() {
  const { user, firebaseSignOut } = useUserAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      router.push("/login/videographer");
    } catch (error) {
      console.error("Failed to logout:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome, videographer</h1>
        {user && <p className="mb-4">Logged in as: {user.email}</p>}
        <Button onClick={handleLogout} className="bg-red-500 text-white">
          Logout
        </Button>
      </div>
    </div>
  );
}
