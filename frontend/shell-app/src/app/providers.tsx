'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { useState, useEffect } from 'react';
import { store } from '@/store';
import { loginSuccess } from '@/store/slices/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in React Query v5)
            refetchOnWindowFocus: false,
            retry: 3,
          },
        },
      })
  );

  // Initialize Redux state from localStorage (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Server-side check

    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (token && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        store.dispatch(
          loginSuccess({
            user,
            accessToken: token,
            refreshToken,
          })
        );
      } catch (error) {
        // Invalid user data, clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ReduxProvider>
  );
}

