"use client";

import { useLoginMutation } from "@/redux/api/auth/authApi";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { showSuccess } from "@/utils/alerts";
import { isAuthenticated, getReturnRoute } from "@/utils/auth";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [login, { isLoading, error, reset }] = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      Swal.fire({
        title: "Already Logged In",
        text: "You are already logged in. Please logout first to login with a different account.",
        icon: "info",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        router.push("/");
      });
      return;
    }
    setIsChecking(false);

    const rememberedEmail = localStorage.getItem("remembered_email");
    const rememberedPassword = localStorage.getItem("remembered_password");
    
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, [router]);

  // Removed duplicate error handling from useEffect
  // Error will be handled only in catch block to prevent page reload

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default form submission and page reload
    e.preventDefault();
    e.stopPropagation();
    
    // Reset error state
    setErrorMessage("");
    reset();

    // Input validation
    if (!email || !password) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please enter both email and password",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();

      // Store tokens
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remembered_password", password);
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remembered_password");
      }

      await showSuccess({
        title: "Success!",
        html: `
          <div style="padding: 10px 0;">
            <p style="font-size: 16px; color: #374151;">Login Successful!</p>
            <p style="font-size: 14px; color: #6B7280; margin-top: 8px;">Redirecting you now...</p>
          </div>
        `,
        timer: 2000,
      });

      // Get the return route (where user was before logout or intended route)
      const returnUrl = searchParams.get('return');
      const storedRoute = getReturnRoute();
      const returnRoute = returnUrl || storedRoute || '/';
      
      // Redirect to intended route after successful login
      router.push(returnRoute);

    } catch (err: any) {
      console.log("Login Error:", err);
      
      // Extract error message immediately from catch block
      let message = "Login failed! Wrong email or password.";
      
      if (err?.detail) {
        message = err.detail;
      } else if (err?.data?.non_field_errors) {
        message = Array.isArray(err.data.non_field_errors) 
          ? err.data.non_field_errors[0] 
          : err.data.non_field_errors;
      } else if (typeof err?.data === 'string') {
        message = err.data;
      } else if (err?.data?.message) {
        message = err.data.message;
      }

      setErrorMessage(message);
      
      // Beautiful SweetAlert for error - stay on login page, no redirect, no reload
      await Swal.fire({
        title: "Login Failed!",
        html: `
          <div style="padding: 10px 0;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">${message}</p>
            <p style="font-size: 14px; color: #6B7280;">Please check your email and password and try again.</p>
          </div>
        `,
        icon: "error",
        iconColor: "#ef4444",
        confirmButtonColor: "#5272FF",
        confirmButtonText: "Try Again",
        buttonsStyling: true,
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          confirmButton: 'swal2-confirm-custom'
        },
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
      });

      // Reset the error state after showing alert
      reset();
      
      // No redirect, no reload - user stays on login page
      // Form fields remain filled, user can try again
      return;
    }
  };

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:flex-1 relative max-w-[606px]">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat max-w-[606px]"
          style={{
            backgroundImage: "url('/login.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0D224A] mb-2">Log in to your account</h2>
              <p className="text-[#4B5563] mt-2">
                Start managing your tasks efficiently
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="space-y-4" 
              noValidate
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) {
                      setErrorMessage("");
                      reset();
                    }
                  }}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) {
                      setErrorMessage("");
                      reset();
                    }
                  }}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                
                <button
                  type="button"
                  className="text-sm text-[#5272FF] hover:text-blue-800 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Error Message (Still showing in form too) */}
              {errorMessage && (
                <div 
                  data-error-message
                  className="bg-red-50 border-2 border-red-300 rounded-xl p-4 animate-fade-in"
                  role="alert"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg 
                      className="w-5 h-5 text-red-600 shrink-0" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <p className="text-red-700 text-sm font-medium text-center">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                onClick={(e) => {
                  // Additional safety to prevent form submission
                  if (isLoading) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                className="w-full bg-[#5272FF] hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "Log In"
                )}
              </button>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-[#4B5563]">
                  Don't have an account?{" "}
                  <Link 
                    href="/register" 
                    className="text-[#5272FF] hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    Register now
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 