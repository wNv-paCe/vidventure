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
      router.push("../login/client");
    } else if (userType !== "client") {
      // if user is not a client, redirect to login
      router.push("../login/client");
    }
  }, [user, userType, router]);

  if (!user || userType !== "client") {
    return <div>Loading...</div>;
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
