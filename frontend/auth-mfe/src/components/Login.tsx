import { useState, useMemo } from 'react';
import { Button, Input } from '@task-management/shared-ui';
import { useAuth } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';

// Array of background images
const backgroundImages = [
  '/auth-background-one.jpg',
  '/auth-background-two.jpg',
  '/auth-background-three.jpg',
];

// Function to get random background image
const getRandomBackgroundImage = () => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  return backgroundImages[randomIndex];
};

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Randomly select background image on each render
  const backgroundImage = useMemo(() => getRandomBackgroundImage(), []);

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
      
      // Check if user is super admin and redirect accordingly
      const isSuperAdmin = user?.roles?.some((role: any) => role.name === 'superadmin');
      // Use window.location to trigger a full page navigation
      // This ensures the shell app's router picks up the change
      if (isSuperAdmin) {
        // Super admin goes to admin dashboard
        window.location.href = '/dashboard?mfe=admin';
      } else {
        // Regular user goes to workspace
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split-layout" style={{ display: 'flex', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
      {/* Form Section */}
      <div className="auth-form-section">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Sarso</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in to continue</h2>
            <p className="text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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

          <div className="mt-6">
            <p className="text-sm text-gray-600 text-center mb-4">Or continue with:</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
                  const popup = window.open(
                    `${apiBaseUrl}/api/v1/auth/google`,
                    'google-auth',
                    'width=500,height=600,scrollbars=yes,resizable=yes'
                  );

                  // Listen for messages from popup
                  const messageListener = (event: MessageEvent) => {
                    // Verify origin for security
                    if (event.origin !== window.location.origin && !event.origin.includes('localhost')) {
                      return;
                    }

                    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                      const { accessToken, refreshToken, user } = event.data;
                      localStorage.setItem('refreshToken', refreshToken);
                      login(user, accessToken);
                      
                      const isSuperAdmin = user?.roles?.some((role: any) => role.name === 'superadmin');
                      if (isSuperAdmin) {
                        window.location.href = '/dashboard?mfe=admin';
                      } else {
                        window.location.href = '/dashboard';
                      }
                      window.removeEventListener('message', messageListener);
                    } else if (event.data.type === 'GOOGLE_AUTH_NEEDS_ORG') {
                      // Handle organization needed
                      window.location.href = `/auth?${new URLSearchParams({
                        email: event.data.email,
                        firstName: event.data.firstName || '',
                        lastName: event.data.lastName || '',
                        picture: event.data.picture || '',
                        action: 'signup',
                      }).toString()}`;
                      window.removeEventListener('message', messageListener);
                    } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                      setError(event.data.message || 'Google authentication failed');
                      window.removeEventListener('message', messageListener);
                    }
                  };

                  window.addEventListener('message', messageListener);

                  // Check if popup is closed manually
                  const checkClosed = setInterval(() => {
                    if (popup?.closed) {
                      clearInterval(checkClosed);
                      window.removeEventListener('message', messageListener);
                    }
                  }, 500);
                }}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24" width="20" height="20" preserveAspectRatio="xMidYMid meet">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background Image Section */}
      <div 
        className="auth-image-section" 
        data-image-error={imageError}
        style={{ 
          flex: '0 0 50%', 
          width: '50%', 
          minHeight: '100vh', 
          display: 'block', 
          backgroundImage: `url(${backgroundImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }}
      >
        {/* Hidden img to detect load errors */}
        <img 
          src={backgroundImage} 
          alt="" 
          style={{ display: 'none' }}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      </div>
    </div>
  );
}

