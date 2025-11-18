'use client';

import { useState } from 'react';
import { Button, Input } from '@task-management/shared-ui';
import { useAuth } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('refreshToken', refreshToken);
      login(user, accessToken);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold text-center">Sign in</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          to your account
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Sign in
        </Button>
      </form>
    </div>
  );
}

