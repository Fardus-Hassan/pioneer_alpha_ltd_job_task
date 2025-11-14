"use client";

import { useSignupMutation } from "@/redux/api/auth/authApi";
import { useState } from "react";


export default function RegisterPage() {
const [signup, { isLoading, error }] = useSignupMutation();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await signup(formData).unwrap();
      console.log("Signup Success:", res);
      alert("Signup successful!");
    } catch (error: any) {
      console.log("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
      <input
        type="text"
        placeholder="First Name"
        className="border p-2"
        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Last Name"
        className="border p-2"
        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {(error as any).detail || "SignUP failed"}
          </p>
        )}

      <button
        disabled={isLoading}
        className="bg-black text-white py-2 rounded"
      >
        {isLoading ? "Loading..." : "Sign Up"}
      </button>
    </form>
  );
}
