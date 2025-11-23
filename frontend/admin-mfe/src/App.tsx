import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminLayout } from './components/AdminLayout';
import { RBACManagement } from './components/RBACManagement';
import { UserManagement } from './components/UserManagement';
import { SystemSettings } from './components/SystemSettings';
import { OrganizationManagement } from './components/OrganizationManagement';
import { WorkspaceWrapper } from './components/WorkspaceWrapper';
import './index.css'; // Import CSS here so it loads when MFE is loaded via Module Federation

const queryClient = new QueryClient();

type AdminPage = 'dashboard' | 'analytics' | 'users' | 'organizations' | 'roles' | 'settings' | 'projects' | 'kanban' | 'tasks' | 'workflows';

function App() {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');

  // Handle hash-based routing on mount and hash changes
  useEffect(() => {
    const updatePageFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages: AdminPage[] = ['dashboard', 'analytics', 'users', 'organizations', 'roles', 'settings', 'projects', 'kanban', 'tasks', 'workflows'];
      if (hash && validPages.includes(hash as AdminPage)) {
        setActivePage(hash as AdminPage);
      } else if (!hash) {
        // If no hash, default to dashboard but set the hash
        window.location.hash = 'dashboard';
        setActivePage('dashboard');
      }
    };

    // Check hash on mount
    updatePageFromHash();

    // Listen for hash changes
    const handleHashChange = () => {
      updatePageFromHash();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Welcome to the admin dashboard</p>
            </div>
            {/* Dashboard content will go here */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Total Projects</h3>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-gray-400 text-sm mb-2">Active Tasks</h3>
                <p className="text-3xl font-bold text-white">0</p>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
              <p className="text-gray-400">View detailed analytics and reports</p>
            </div>
            {/* Analytics content will go here */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <p className="text-gray-400">Analytics charts and data will be displayed here</p>
            </div>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'organizations':
        return <OrganizationManagement />;
      case 'roles':
        return <RBACManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'projects':
        return <WorkspaceWrapper componentName="ProjectManagement" />;
      case 'kanban':
        return <WorkspaceWrapper componentName="KanbanBoard" />;
      case 'tasks':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-white">Tasks</h2>
            <p className="text-gray-400 mb-4">Select a project to view tasks, or create a new project.</p>
            <WorkspaceWrapper componentName="ProjectManagement" />
          </div>
        );
      case 'workflows':
        return <WorkspaceWrapper componentName="WorkflowDesigner" />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="admin-mfe-container">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AdminLayout activePage={activePage} setActivePage={setActivePage}>
            {renderPage()}
          </AdminLayout>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;

