'use client';

import { Bell, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function TopBar() {
  const today = new Date();
  const dayName = today.toLocaleString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }); // 07/11/2025

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      {/* Left: Logo + Text */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 relative">
          <Image
            src="/logo.svg"
            alt="Dreamy Software"
            fill
            className="object-contain"
          />
        </div>
        {/* Text - Hidden on mobile */}
        <span className="hidden sm:block text-xl font-black tracking-wider text-black uppercase">
          DREAMY SOFTWARE
        </span>
      </div>

      {/* Right: Icons + Date */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Calendar */}
        <button className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors">
          <Calendar className="w-5 h-5" />
        </button>

        {/* Date - Desktop */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>{dayName}</span>
          <span className="text-gray-400">|</span>
          <span>{dateStr}</span>
        </div>

        {/* Date - Mobile (short) */}
        <div className="md:hidden text-sm font-medium text-gray-700">
          {dateStr}
        </div>
      </div>
    </header>
  );
}