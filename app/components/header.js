import React from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/app/_utils/auth-context";
import { Button } from "@/components/ui/button";

const Header = ({ userType }) => {
  const { user, firebaseSignOut } = useUserAuth();
  const router = useRouter();

  // Handle logout
  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      // Redirect to home page after logout
      router.push("/login/${userType}");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    router.push("/");
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1
          onClick={handleBackToHome}
          className="text-2xl font-semibold hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          {userType === "client"
            ? "Client Dashboard"
            : "Videographer Dashboard"}
        </h1>
        <div className="flex items-center">
          {/* User Info and Log out */}
          <span className="mr-4">Welcome, {user?.email}</span>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground hover:text-primary font-semibold"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
