"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserAuth } from "../_utils/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

export default function SignupForm({ userType }) {
  const { registerWithEmail } = useUserAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  // Capitalize each word in a string
  const capitalizeWords = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    // Validate password
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const capitalizedUsername = capitalizeWords(username);

    try {
      const result = await registerWithEmail(
        email,
        password,
        capitalizedUsername,
        userType
      );

      if (result.success) {
        setSuccessMessage(result.message);
        // Based on the user type, redirect to the respective dashboard
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  }

  if (successMessage) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold">
              Verify Your Email
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>{successMessage}</p>
            <p>
              Please check your inbox and verify your email before logging in.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              onClick={() =>
                router.push(
                  `/login/${userType}?redirect=${encodeURIComponent(redirect)}`
                )
              }
              className="w-full"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Sign Up
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                required
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm your password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
            <div className="text-center text-sm">
              <Link
                href={`/login/${userType}?redirect=${encodeURIComponent(
                  redirect
                )}`}
                className="text-primary hover:underline"
              >
                Already have an account? Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
