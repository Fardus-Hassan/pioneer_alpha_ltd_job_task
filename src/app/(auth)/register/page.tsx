"use client";

import { useSignupMutation } from "@/redux/api/auth/authApi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { showSuccess } from "@/utils/alerts";

export default function RegisterPage() {
  const [signup, { isLoading, error }] = useSignupMutation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const validateForm = () => {
    const newErrors = {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    };

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Please enter your first name";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.first_name)) {
      newErrors.first_name = "Please enter a valid name format";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Please enter your last name";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.last_name)) {
      newErrors.last_name = "Please enter a valid name format";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Please enter a password";
    } else if (formData.password.length < 4) {
      newErrors.password = "4 characters minimum";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const res = await signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      }).unwrap();

            router.push("/login");

      await showSuccess({ text: "Signup successful!" });
    } catch (error: any) {
      console.log("Error:", error);
      await Swal.fire({
        title: "Error!",
        text: error?.data?.detail || "Signup failed!",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:flex-1 relative max-w-[606px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat max-w-[606px]"
          style={{
            backgroundImage: "url('/signUp.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0D224A] mb-2">
                Create your account
              </h2>
              <p className="text-[#4B5563] mt-2">
                Start managing your tasks efficiently
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.first_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.last_name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 cursor-pointer right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.11958 9.82668L13.1464 13.8536C13.3417 14.0488 13.6583 14.0488 13.8536 13.8536C14.0488 13.6583 14.0488 13.3417 13.8536 13.1464L0.853553 0.146447C0.658291 -0.0488155 0.341709 -0.0488155 0.146447 0.146446C-0.0488156 0.341709 -0.0488155 0.658291 0.146447 0.853553L3.37624 4.08334C2.90117 4.4183 2.5126 4.80026 2.19877 5.18295C1.75443 5.72477 1.46154 6.26493 1.27931 6.66977C1.18795 6.87274 1.12369 7.04329 1.08166 7.1653C1.06063 7.22636 1.03453 7.31047 1.03453 7.31047L1.01687 7.37186C1.01687 7.37186 0.940979 7.86907 1.37202 7.9833C1.63879 8.05404 1.91251 7.8948 1.98346 7.62815L1.98444 7.62471L1.99179 7.5997C1.9989 7.57616 2.01051 7.53927 2.02715 7.49095C2.06047 7.39421 2.11375 7.25227 2.19119 7.08023C2.34655 6.73507 2.59627 6.27523 2.97201 5.81706C3.26363 5.46146 3.63213 5.10494 4.09595 4.80306L5.67356 6.38067C4.9688 6.82277 4.50024 7.60667 4.50024 8.5C4.50024 9.88071 5.61953 11 7.00024 11C7.89358 11 8.67747 10.5314 9.11958 9.82668ZM8.3807 9.0878C8.15205 9.62408 7.62005 10 7.00024 10C6.17182 10 5.50024 9.32843 5.50024 8.5C5.50024 7.88019 5.87616 7.34819 6.41244 7.11955L8.3807 9.0878ZM5.31962 3.19853L6.174 4.05291C6.43366 4.01852 6.70875 4 7.00017 4C9.0445 4 10.2857 4.9115 11.0283 5.81706C11.4041 6.27523 11.6538 6.73507 11.8091 7.08023C11.8866 7.25227 11.9399 7.39421 11.9732 7.49095C11.9898 7.53927 12.0014 7.57616 12.0085 7.5997L12.0159 7.62471L12.0169 7.62815L12.0172 7.62937C12.0885 7.89555 12.3618 8.05397 12.6283 7.9833C12.8952 7.91253 13.0542 7.63878 12.9835 7.37186L12.9832 7.37069L12.9827 7.36916L12.9816 7.365L12.9781 7.35236C12.9752 7.34204 12.9711 7.328 12.9658 7.31047C12.9552 7.27541 12.9397 7.22636 12.9187 7.1653C12.8766 7.04329 12.8124 6.87274 12.721 6.66977C12.5388 6.26493 12.2459 5.72477 11.8016 5.18295C10.904 4.0885 9.39524 3 7.00017 3C6.38264 3 5.82403 3.07236 5.31962 3.19853Z"
                          fill="#5272FF"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-[18px] h-[18px]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${
                      errors.confirm_password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      handleInputChange("confirm_password", e.target.value)
                    }
                  />
                </div>
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirm_password}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm text-center">
                    {(error as any).detail || "Signup failed"}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5272FF] cursor-pointer hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>

              <div className="text-center">
                <p className="text-[#4B5563]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#5272FF] hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
