"use client";

import { useUserAuth } from "@/app/_utils/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/app/components/dashboard-layout";
import StripeProvider from "./wallet/StripeProvider";

export default function VideographerLayout({ children }) {
  const { user, userType } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || userType !== "videographer") {
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

  return <StripeProvider>
    <DashboardLayout userType="videographer">{children}</DashboardLayout>
  </StripeProvider>;
}
