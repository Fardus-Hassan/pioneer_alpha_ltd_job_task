"use client";

import { useState } from "react";
import { Home, CheckSquare, User, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/utils/auth";
import Swal from "sweetalert2";
import { useGetUserQuery } from "@/redux/api/profile/profileApi";

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: user, isLoading, error } = useGetUserQuery();

  const isActive = (href: string) => pathname === href;

  // Get user full name
  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User"
    : "";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      logout(pathname);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-screen bg-[#0D224A] text-white w-[340px]">
      {/* Profile */}
      <div className="mt-[60px]">
        <div className="flex flex-col items-center">
          {/* Profile Image with Skeleton */}
          {isLoading ? (
            <div className="relative w-20 h-20 mb-3">
              <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-gray-700 animate-pulse"></div>
            </div>
          ) : (
            <div className="relative w-[86px] h-[86px] mb-[13px]">
              <Image
                src={user?.profile_image || "/profile.jpg"}
                alt="Profile"
                fill
                unoptimized
                className="rounded-full object-cover border border-white"
                onError={(e) => {
                  e.currentTarget.src = "/profile.jpg";
                }}
              />
            </div>
          )}

          {/* Name with Skeleton */}
          {isLoading ? (
            <div className="w-32 h-6 mb-2 rounded bg-gray-700 animate-pulse"></div>
          ) : (
            <h3 className="font-semibold text-center">{fullName || "User"}</h3>
          )}

          {/* Email with Skeleton */}
          {isLoading ? (
            <div className="w-40 h-4 rounded bg-gray-700 animate-pulse"></div>
          ) : (
            <p className="text-xs text-center mt-[2px]">
              {user?.email || "No email"}
            </p>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-[46px]">
      {/* Dashboard */}
      <Link
        href="/"
        className={`flex items-center gap-3 py-4 transition-all duration-300 ease-in-out pl-[56px] ${
          isActive("/")
            ? "[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] text-white"
            : "text-[#8CA3CD] hover:[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] hover:text-white"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <svg
          width="24"
          height="22"
          viewBox="0 0 24 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M23.9937 10.9785C23.9937 11.752 23.3687 12.3578 22.6603 12.3578H21.3268L21.356 19.2414C21.356 19.3574 21.3476 19.4734 21.3351 19.5895V20.2812C21.3351 21.2309 20.5893 22 19.6683 22H19.0016C18.9558 22 18.9099 22 18.8641 21.9957C18.8058 22 18.7474 22 18.6891 22H17.3348H16.3347C15.4138 22 14.6679 21.2309 14.6679 20.2812V19.25V16.5C14.6679 15.7395 14.072 15.125 13.3345 15.125H10.6676C9.93001 15.125 9.33413 15.7395 9.33413 16.5V19.25V20.2812C9.33413 21.2309 8.58823 22 7.66732 22H6.66723H5.33795C5.27545 22 5.21294 21.9957 5.15044 21.9914C5.10043 21.9957 5.05043 22 5.00043 22H4.3337C3.41279 22 2.66689 21.2309 2.66689 20.2812V15.4688C2.66689 15.4301 2.66689 15.3871 2.67106 15.3484V12.3578H1.33345C0.583383 12.3578 0 11.7563 0 10.9785C0 10.5918 0.125011 10.248 0.416702 9.94727L11.1009 0.34375C11.3926 0.0429688 11.726 0 12.0177 0C12.3094 0 12.6427 0.0859375 12.8928 0.300781L23.5353 9.94727C23.8687 10.248 24.0354 10.5918 23.9937 10.9785Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-medium">Dashboard</span>
      </Link>

      {/* Todos */}
      <Link
        href="/todos"
        className={`flex items-center gap-3 pl-[56px] py-4 transition-all duration-500 ease-in-out ${
          isActive("/todos")
            ? "[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] text-white"
            : "text-[#8CA3CD] hover:[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] hover:text-white"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.22222 23.5H19.7778C21.0033 23.5 22 22.4685 22 21.2V3.95C22 2.68155 21.0033 1.65 19.7778 1.65H17.5556C17.5556 1.345 17.4385 1.05249 17.2301 0.836827C17.0217 0.62116 16.7391 0.5 16.4444 0.5H7.55556C7.26087 0.5 6.97826 0.62116 6.76988 0.836827C6.56151 1.05249 6.44444 1.345 6.44444 1.65H4.22222C2.99667 1.65 2 2.68155 2 3.95V21.2C2 22.4685 2.99667 23.5 4.22222 23.5ZM4.22222 3.95H6.44444V6.25H17.5556V3.95H19.7778V21.2H4.22222V3.95Z"
            fill="currentColor"
          />
          <path
            d="M10.8115 14.083L8.68053 11.9166L7 13.6251L10.8115 17.5L17 11.2085L15.3195 9.5L10.8115 14.083Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-medium">Todos</span>
      </Link>

      {/* Account Information */}
      <Link
        href="/account"
        className={`flex items-center gap-3 pl-[56px] py-4 transition-all duration-500 ease-in-out ${
          isActive("/account")
            ? "[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] text-white"
            : "text-[#8CA3CD] hover:[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] hover:text-white"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        <svg
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 12.5C13.6671 12.5 15.2659 11.8679 16.4447 10.7426C17.6235 9.61742 18.2857 8.0913 18.2857 6.5C18.2857 4.9087 17.6235 3.38258 16.4447 2.25736C15.2659 1.13214 13.6671 0.5 12 0.5C10.3329 0.5 8.73413 1.13214 7.55533 2.25736C6.37653 3.38258 5.71429 4.9087 5.71429 6.5C5.71429 8.0913 6.37653 9.61742 7.55533 10.7426C8.73413 11.8679 10.3329 12.5 12 12.5ZM9.7558 14.75C4.91875 14.75 1 18.4906 1 23.1078C1 23.8766 1.65313 24.5 2.45848 24.5H21.5415C22.3469 24.5 23 23.8766 23 23.1078C23 18.4906 19.0813 14.75 14.2442 14.75H9.7558Z"
            fill="currentColor"
          />
        </svg>
        <span className="font-medium">Account Information</span>
      </Link>
    </nav>

      {/* Logout */}
      <div className="mb-[30px]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 pl-[56px] py-4 text-[#8CA3CD] hover:[background:linear-gradient(to_right,#1E3677_0%,#1E3677_0%,#1E3677_0%,#0D224A_80%)] hover:text-white rounded-lg transition-colors"
        >
          <svg
            viewBox="0 0 21.6666 24"
            xmlns="http://www.w3.org/2000/svg"
            width="21.666626"
            height="24.000000"
            fill="none"
          >
            <path
              id="Vector"
              d="M16.8519 6.66667L15.1667 8.53333L17.0926 10.6667L7.22222 10.6667L7.22222 13.3333L17.0926 13.3333L15.1667 15.4667L16.8519 17.3333L21.6667 12L16.8519 6.66667ZM2.40741 2.66667L10.8333 2.66667L10.8333 0L2.40741 0C1.08333 0 0 1.2 0 2.66667L0 21.3333C0 22.8 1.08333 24 2.40741 24L10.8333 24L10.8333 21.3333L2.40741 21.3333L2.40741 2.66667Z"
              fill="currentColor"
            />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-2 left-0 z-50 p-3 bg-[#5272FF] rounded-r-lg text-white lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 max-h-screen w-[340px] z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative md:z-auto`}
      >
        {/* Close Button (Mobile) */}
        <div className="flex justify-end md:hidden absolute right-3 top-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-white hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-full overflow-y-auto pb-16 md:pb-0">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
