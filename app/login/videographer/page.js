import LoginForm from "@/app/components/login-form";

export default function VideographerLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginForm userType="videographer" />
    </div>
  );
}
