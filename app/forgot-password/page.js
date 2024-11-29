"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ForgotPasswordForm from "@/app/components/forgot-password-form";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userType = searchParams.get("userType") || "client";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ForgotPasswordForm onCancel={() => router.push(`/login/${userType}`)} />
    </div>
  );
}
