"use client";

import { useUserAuth } from "../_utils/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({ children }) {
  const { user, userType } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || userType !== "videographer") {
      // if user is not logged in and not a videographer, redirect to videographer login
      router.push("/login/videographer");
    }
  }, [user, userType, router]);

  if (!user || userType !== "videographer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-gray-800 text-white p-4">
        <h1>Videographer Portal</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
