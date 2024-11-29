"use client";

import { useUserAuth } from "../_utils/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({ children }) {
  const { user, userType } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // if user is not logged in, redirect to login page
      router.push("../login/videographer");
    } else if (userType !== "videographer") {
      // if user is not a videographer, redirect to login
      router.push("../login/videographer");
    }
  }, [user, userType, router]);

  if (!user || userType !== "videographer") {
    return <div>Loading...</div>;
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
