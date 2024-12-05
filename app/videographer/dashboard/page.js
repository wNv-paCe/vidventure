"use client";

import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/app/_utils/auth-context";
import { useRouter } from "next/navigation";
import DashboardLayout from "./DashboardLayout";

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
    <div>
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Videographer Dashboard</h1>
        {user && <p>{user.email}</p>}
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded text-white"
        >
          Logout
        </button>
      </header>
      <DashboardLayout />
    </div>
  );
}
