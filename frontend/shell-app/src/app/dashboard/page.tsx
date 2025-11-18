'use client';

import { Header } from '@/components/Header';
import { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeMfe, setActiveMfe] = useState<string>('workspace');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Check URL params on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mfeParam = params.get('mfe');
      if (mfeParam && ['workspace', 'auth', 'analytics', 'admin'].includes(mfeParam)) {
        setActiveMfe(mfeParam);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const mfeConfig = {
    workspace: {
      url: '/mfe/workspace',
      title: 'Workspace',
    },
    auth: {
      url: '/mfe/auth',
      title: 'Authentication',
    },
    analytics: {
      url: '/mfe/analytics',
      title: 'Analytics',
    },
    admin: {
      url: '/mfe/admin',
      title: 'Admin',
    },
  } as const;

  type MfeKey = keyof typeof mfeConfig;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Task Management System
          </h1>
          <p className="text-gray-600">
            Integrated microfrontend application
          </p>
        </div>

        {/* MFE Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {(Object.keys(mfeConfig) as MfeKey[]).map((key) => {
              const config = mfeConfig[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveMfe(key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeMfe === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {config.title}
                </button>
              );
            })}
          </nav>
        </div>

        {/* MFE Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <iframe
            src={mfeConfig[activeMfe as MfeKey].url}
            className="w-full h-[calc(100vh-300px)] border-0"
            title={mfeConfig[activeMfe as MfeKey].title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>

        {/* Info Banner */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All microfrontends are proxied through the shell app on port 3000.
            Access them via <code className="bg-blue-100 px-1 rounded">/mfe/auth</code>, <code className="bg-blue-100 px-1 rounded">/mfe/workspace</code>, etc.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
