'use client';

import { useState } from 'react';
import { Home, CheckSquare, User, LogOut, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Todos', href: '/todos' },
  { icon: User, label: 'Account Information', href: '/account' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-screen bg-[#0a1a2e] text-white">
      {/* Profile */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-3">
            <Image
              src="/profile.webp"
              alt="Profile"
              fill
              className="rounded-full object-cover border-4 border-gray-700"
            />
          </div>
          <h3 className="text-lg font-semibold">amanuel</h3>
          <p className="text-sm text-gray-400">amanuel@gmail.com</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
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
        className="fixed top-2 left-0 z-50 p-3 bg-[#0a1a2e] rounded-r-lg text-white lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-[340px] bg-[#0a1a2e] z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative md:z-auto`}
      >
        {/* Close Button (Mobile) */}
        <div className="flex justify-end p-4 md:hidden">
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