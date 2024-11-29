"use client";

import { useUserAuth } from "../_utils/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({ children }) {
  const { user, userType } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || userType !== "client") {
      // if user is not logged in and not a client, redirect to client login
      router.push("/login/client");
    }
  }, [user, userType, router]);

  // if user is not logged in or not a client, show loading message
  if (!user || userType !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-gray-800 text-white p-4">
        <h1>Client Portal</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
