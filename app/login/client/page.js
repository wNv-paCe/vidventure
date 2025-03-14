import LoginForm from "@/app/components/login-form";

export default function ClientLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginForm userType="client" />
    </div>
  );
}
