"use client";

import SignupForm from "@/app/components/signup-form";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get("userType") || "client";

  return <SignupForm userType={userType} />;
}
