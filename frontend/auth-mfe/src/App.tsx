import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';

function App() {
  // Get mode from URL search params (passed from shell app)
  const [mode, setMode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') || 'login';
    }
    return 'login';
  });

  useEffect(() => {
    // Listen for URL changes to update mode
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('mode') || 'login';
        setMode(urlMode);
      }
    };

    // Check on mount
    handleLocationChange();
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    // Poll for URL changes (catches React Router navigations)
    // This is needed because React Router doesn't always trigger popstate
    const interval = setInterval(handleLocationChange, 100);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  // Determine which component to render based on mode
  const renderContent = () => {
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
      <div className="w-full h-full">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;

