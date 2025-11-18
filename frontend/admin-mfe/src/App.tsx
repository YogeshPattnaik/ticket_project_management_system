import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACManagement } from './components/RBACManagement';
import { UserManagement } from './components/UserManagement';
import { SystemSettings } from './components/SystemSettings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/admin/rbac" replace />} />
          <Route path="/admin/rbac" element={<RBACManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="*" element={<Navigate to="/admin/rbac" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

