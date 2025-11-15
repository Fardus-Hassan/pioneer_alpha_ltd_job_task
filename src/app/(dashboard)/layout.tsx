import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
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
  );
}