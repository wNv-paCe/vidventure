"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../_utils/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordForm({ onCancel }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    // From the form data, get the email
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");

    try {
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send password reset email.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-[400px] mx-auto mt-10">
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
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && (
        <p className="text-green-500 text-center">
          Password reset instructions have been sent to your email.
        </p>
      )}
      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Reset Password</Button>
      </div>
    </form>
  );
}
