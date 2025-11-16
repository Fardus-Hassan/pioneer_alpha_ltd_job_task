'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, checkTokenAndLogout } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      checkTokenAndLogout();
      
      if (isAuthenticated()) {
        setIsAuthorized(true);
        setIsLoading(false);
      } else {
        if (pathname && pathname !== '/login') {
          localStorage.setItem('return_route', pathname);
        }
        router.push('/login');
      }
    };

    checkAuth();

    const interval = setInterval(() => {
      checkTokenAndLogout();
      if (!isAuthenticated()) {
        if (pathname && pathname !== '/login') {
          localStorage.setItem('return_route', pathname);
        }
        router.push('/login');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [router, pathname]);

  if (isLoading) {
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

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

