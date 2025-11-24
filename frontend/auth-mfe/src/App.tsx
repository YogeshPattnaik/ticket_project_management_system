import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { GoogleOrganizationForm } from './components/GoogleOrganizationForm';
import { GoogleCallback } from './components/GoogleCallback';
import { useAuth, setCookie } from '@task-management/shared-ui';
import './index.css';

function App() {
  const { login } = useAuth();
  const [mode, setMode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') || 'login';
    }
    return 'login';
  });

  const [googleUser, setGoogleUser] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  } | null>(null);

  useEffect(() => {
    // Check for OAuth callback (only if NOT in a popup)
    if (typeof window !== 'undefined' && !window.opener) {
      const params = new URLSearchParams(window.location.search);
      
      // Handle Google OAuth callback with tokens (existing user) - full page redirect fallback
      if (params.get('accessToken') && params.get('refreshToken')) {
        const accessToken = params.get('accessToken')!;
        const refreshToken = params.get('refreshToken')!;
        const userStr = params.get('user');
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setCookie('accessToken', accessToken, 7);
            setCookie('refreshToken', refreshToken, 7);
            localStorage.setItem('refreshToken', refreshToken);
            login(user, accessToken);
            
            // Check if user is super admin and redirect accordingly
            const isSuperAdmin = user?.roles?.some((role: any) => role.name === 'superadmin');
            if (isSuperAdmin) {
              window.location.href = '/dashboard?mfe=admin';
            } else {
              window.location.href = '/dashboard';
            }
          } catch (err) {
            console.error('Failed to parse user data:', err);
          }
        }
        return;
      }

      // Handle Google OAuth callback for new user (needs organization) - full page redirect fallback
      if (params.get('action') === 'signup' && params.get('email')) {
        setGoogleUser({
          email: params.get('email')!,
          firstName: params.get('firstName') || '',
          lastName: params.get('lastName') || '',
          picture: params.get('picture') || '',
        });
        return;
      }

      // Listen for URL changes to update mode
      const handleLocationChange = () => {
        const newParams = new URLSearchParams(window.location.search);
        const urlMode = newParams.get('mode') || 'login';
        setMode(urlMode);
      };

      // Check on mount
      handleLocationChange();
      
      // Listen for popstate (browser back/forward)
      window.addEventListener('popstate', handleLocationChange);
      
      // Poll for URL changes (catches React Router navigations)
      const interval = setInterval(handleLocationChange, 100);
      
      return () => {
        window.removeEventListener('popstate', handleLocationChange);
        clearInterval(interval);
      };
    }
  }, [login]);

  // Show organization form if Google user needs to complete signup
  if (googleUser) {
    return (
      <div className="auth-mfe-container">
        <div className="w-full h-full flex items-center justify-center p-8">
          <GoogleOrganizationForm
            googleUser={googleUser}
            onComplete={() => setGoogleUser(null)}
          />
        </div>
      </div>
    );
  }

  // Determine which component to render based on mode
  const renderContent = () => {
    // Check if this is a popup callback (opened by window.open)
    if (typeof window !== 'undefined' && window.opener) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('accessToken') || params.get('action') === 'signup' || params.get('error')) {
        return <GoogleCallback />;
      }
    }

    switch (mode) {
      case 'register':
        return <Register />;
      case 'login':
      default:
        return <Login />;
    }
  };

  return (
    <div className="auth-mfe-container">
      {renderContent()}
    </div>
  );
}

export default App;

