'use client';

import { Header } from '@/components/Header';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import auth components from auth-mfe
// This avoids iframes and directly uses the components
const Login = dynamic(
  () => import('../../../../auth-mfe/src/components/Login').then((mod) => ({ default: mod.Login })),
  { ssr: false, loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> }
);

const Register = dynamic(
  () => import('../../../../auth-mfe/src/components/Register').then((mod) => ({ default: mod.Register })),
  { ssr: false, loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> }
);

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'login';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {mode === 'register' ? <Register /> : <Login />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

