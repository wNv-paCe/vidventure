"use client";

import SignupForm from "@/app/components/signup-form";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("userType") || "client";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignupForm userType={userType} />
    </div>
  );
}
