"use client";

import { useGetUserQuery, useUpdateUserMutation } from "@/redux/api/profile/profileApi";
import { useState, useEffect } from "react";

export default function AccountPage() {
  const { data: user, isLoading } = useGetUserQuery();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    contact_number: "",
    birthday: "",
    bio: "",
    profile_image: null as File | null,
  });

  // Load user data when fetch completes
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        address: user.address || "",
        contact_number: user.contact_number || "",
        birthday: user.birthday || "",
        bio: user.bio || "",
        profile_image: null,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(form).unwrap();
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err?.data?.detail || "Something went wrong");
      console.error("Update Error:", err);
    }
  };

  if (isLoading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-semibold mb-6">My Account</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Profile Image Preview */}
        <div className="flex items-center gap-4">
          <img
            src={
              form.profile_image
                ? URL.createObjectURL(form.profile_image)
                : user?.profile_image || "/default-avatar.png"
            }
            alt="profile"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm({
                ...form,
                profile_image: e.target.files?.[0] || null,
              })
            }
          />
        </div>

        {/* First Name */}
        <div>
          <label className="text-sm">First Name</label>
          <input
            className="w-full border p-2 rounded"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="text-sm">Last Name</label>
          <input
            className="w-full border p-2 rounded"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm">Address</label>
          <input
            className="w-full border p-2 rounded"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="text-sm">Contact Number</label>
          <input
            className="w-full border p-2 rounded"
            value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="text-sm">Birthday</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.birthday || ""}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm">Bio</label>
          <textarea
            className="w-full border p-2 rounded"
            value={form.bio || ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <button
          className="bg-blue-600 text-white py-2 px-4 rounded w-full"
          type="submit"
          disabled={updating}
        >
          {updating ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
