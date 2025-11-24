import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MFELoader } from '../components/MFELoader';

export default function DashboardPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [activeMfe, setActiveMfe] = useState<string>('workspace');

  // Check URL params and user role to determine default MFE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mfeParam = params.get('mfe');
      
      if (mfeParam && ['workspace', 'analytics', 'admin'].includes(mfeParam)) {
        setActiveMfe(mfeParam);
      } else {
        // Check if user is super admin - default to admin dashboard
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const isSuperAdmin = user?.roles?.some((role: any) => role.name === 'superadmin');
            if (isSuperAdmin) {
              setActiveMfe('admin');
              window.history.replaceState({}, '', '/dashboard?mfe=admin');
            } else {
              setActiveMfe('workspace');
            }
          } catch {
            setActiveMfe('workspace');
          }
        } else {
          setActiveMfe('workspace');
        }
      }
      
      // Listen for popstate to handle browser back/forward
      const handlePopState = () => {
        const newParams = new URLSearchParams(window.location.search);
        const newMfeParam = newParams.get('mfe');
        if (newMfeParam && ['workspace', 'analytics', 'admin'].includes(newMfeParam)) {
          setActiveMfe(newMfeParam);
        } else {
          setActiveMfe('workspace');
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  const mfeConfig = {
    workspace: {
      remote: 'workspace_mfe',
      title: 'Workspace',
    },
    analytics: {
      remote: 'analytics_mfe',
      title: 'Analytics',
    },
    admin: {
      remote: 'admin_mfe',
      title: 'Admin',
    },
  } as const;

  type MfeKey = keyof typeof mfeConfig;

  const renderActiveMfe = () => {
    const config = mfeConfig[activeMfe as MfeKey];
    if (!config) return null;

    return (
      <MFELoader
        remote={config.remote}
        module="./App"
        fallback={
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {config.title}...</p>
          </div>
        }
      />
    );
  };

  // Full screen for admin, normal layout for others
  const isAdmin = activeMfe === 'admin';

  if (isAdmin) {
    return (
      <div className="h-screen w-full overflow-hidden">
        {renderActiveMfe()}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sarso
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
                onClick={() => {
                  setActiveMfe(key);
                  const newUrl = key === 'workspace' 
                    ? '/dashboard' 
                    : `/dashboard?mfe=${key}`;
                  window.history.pushState({}, '', newUrl);
                  // Force React Router to update
                  window.dispatchEvent(new PopStateEvent('popstate'));
                  // Also trigger a custom event for our admin detection
                  window.dispatchEvent(new Event('locationchange'));
                }}
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[calc(100vh-300px)]">
        {renderActiveMfe()}
      </div>
    </div>
  );
}

