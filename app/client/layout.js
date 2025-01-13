"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard-layout";

export default function ClientLayout({ children }) {
  const { user, userType } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || userType !== "client") {
      router.push("/login/client");
    }
  }, [user, userType, router]);

  if (!user || userType !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  return <DashboardLayout userType="client">{children}</DashboardLayout>;
}
