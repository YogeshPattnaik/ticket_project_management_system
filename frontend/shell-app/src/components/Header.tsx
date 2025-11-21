'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    router.push('/');
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Task Management
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
              Task Management
            </Link>
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname === '/dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard?mfe=workspace"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname?.includes('workspace')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Workspace
                </Link>
                <Link
                  href="/dashboard?mfe=analytics"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname?.includes('analytics')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  href="/dashboard?mfe=admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    pathname?.includes('admin')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  Admin
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {user?.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth?mode=login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

