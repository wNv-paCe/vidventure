"use client";

import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/app/_utils/auth-context";
import { useRouter } from "next/navigation";

export default function ClientDashboard() {
  const { user, firebaseSignOut } = useUserAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      router.push("../../login/client");
    } catch (err) {
      console.error("Logout failed: ", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome, Client</h1>
        {user && <p className="mb-4">Logged in as: {user.email}</p>}
        <Button onClick={handleLogout} className="bg-red-500 text-white">
          Logout
        </Button>
      </div>
    </div>
  );
}
