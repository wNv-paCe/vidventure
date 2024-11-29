"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useUserAuth } from "../_utils/auth-context";

export default function LoginForm({ userType }) {
  const { googleSignIn, loginWithEmail } = useUserAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password); // Login with email and password
      console.log(`${userType} login successfully`);
      router.push(`/${userType}/dashboard`); // Redirect to dashboard
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn(userType); // Google login
      console.log(`${userType} login successfully`);
      router.push(`/${userType}/dashboard`); // Redirect to dashboard
    } catch (err) {
      setError("Google login failed: " + err.message);
    }
  };

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>
          {userType === "client" ? "Client" : "Videographer"} Login
        </CardTitle>
        <CardDescription>
          {userType === "client"
            ? "Enter your credentials to access your account as a Client."
            : "Enter your credentials to access your account as a Videographer."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
        {/* Display error message */}
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardContent className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          Login
        </Button>
      </CardContent>
      <CardContent className="flex justify-between text-sm mt-4">
        <Link href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot Password?
        </Link>
        <Link href="/signup" className="text-blue-600 hover:underline">
          Don&apos;t have an account? Sign up
        </Link>
      </CardContent>
      <CardContent className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleGoogleLogin} variant="outline">
          Login with Google
        </Button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </CardFooter>
    </Card>
  );
}
