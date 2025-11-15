'use client';

import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar - 340px */}
        <Sidebar />

        {/* Right Side: TopBar + Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto">
            <div className="">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}