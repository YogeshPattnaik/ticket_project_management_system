import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { Providers } from './components/Providers';
import { Header } from './components/Header';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import { useEffect, useState } from 'react';
import './styles/shell.css';

function AppContent() {
  const location = useLocation();
  const [isAdminPage, setIsAdminPage] = useState(false);

  // Check if admin page - always check window.location as source of truth
  useEffect(() => {
    const checkAdmin = () => {
      if (typeof window === 'undefined') return;
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const admin = path === '/dashboard' && searchParams.get('mfe') === 'admin';
      setIsAdminPage(admin);
    };
    
    // Check immediately
    checkAdmin();
    
    // Listen for URL changes
    const handleLocationChange = () => checkAdmin();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('locationchange', handleLocationChange);
    
    // Check periodically for pushState changes (since they don't trigger events)
    const interval = setInterval(checkAdmin, 150);
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('locationchange', handleLocationChange);
      clearInterval(interval);
    };
  }, [location]);

  return (
    <div className={`shell-app-container min-h-screen ${isAdminPage ? 'h-screen overflow-hidden' : 'bg-gray-50'}`}>
      {!isAdminPage && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default App;

