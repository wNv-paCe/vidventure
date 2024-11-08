"use client";

import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, ArrowRight, Camera } from "lucide-react";

const VideographerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // 这里添加登录逻辑
    console.log("Videographer login attempt:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Camera className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Videographer Login
          </h1>
          <p className="text-gray-600 mt-2">
            Showcase your work and take reservations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-10"
                placeholder="Please enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                placeholder="Please enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Forget your password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 flex items-center justify-center gap-2"
          >
            Login
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">
              Still not a certified photographer?{" "}
            </span>
            <a
              href="#"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Apply to join
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideographerLogin;
