'use client';

import { ReactNode, useEffect, useState } from 'react';
import { getUserFromStorage, isSuperAdmin } from '../utils/auth';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileDropdown } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';
import { clearAllCookies, getCookie } from '@task-management/shared-ui';

type AdminPage = 'dashboard' | 'analytics' | 'users' | 'organizations' | 'roles' | 'settings' | 'projects' | 'kanban' | 'tasks' | 'workflows';

interface AdminLayoutProps {
  children: ReactNode;
  activePage: AdminPage;
  setActivePage: (page: AdminPage) => void;
}

interface NavItem {
  page: AdminPage;
  label: string;
  icon: string;
  category: string;
  submenu?: { page: AdminPage; label: string }[];
}

export function AdminLayout({ children, activePage, setActivePage }: AdminLayoutProps) {
  const [user, setUser] = useState(getUserFromStorage());
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { theme } = useTheme();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    dashboard: false,
    admin: true,
    workspace: false,
  });

  // Logout handler with API call and cookie management
  const handleLogout = async () => {
    try {
      const refreshToken = getCookie('refreshToken');
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all cookies
      clearAllCookies();
      // Also clear localStorage for backward compatibility
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      // Redirect to home
      if (typeof window !== 'undefined') {
        window.top?.location.replace('/');
      }
    }
  };

  useEffect(() => {
    const currentUser = getUserFromStorage();
    setUser(currentUser);

    if (!currentUser) {
      setIsAuthorized(false);
      return;
    }

    const superAdminCheck = isSuperAdmin(currentUser);
    setIsAuthorized(superAdminCheck);
  }, []);

  if (!user) {
    return (
      <div className="admin-mfe-container flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-300 mb-4">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="admin-mfe-container flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300 mb-4">You need super admin privileges to access this section.</p>
          <button
            onClick={() => window.top?.location.replace('/dashboard')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const navItems: NavItem[] = [
    {
      page: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      category: 'main',
      submenu: [
        { page: 'dashboard', label: 'Overview' },
        { page: 'analytics', label: 'Analytics' },
      ],
    },
    {
      page: 'users',
      label: 'Admin Management',
      icon: '👥',
      category: 'admin',
      submenu: [
        { page: 'users', label: 'Users' },
        { page: 'organizations', label: 'Organizations' },
        { page: 'roles', label: 'Roles' },
        { page: 'settings', label: 'Settings' },
      ],
    },
    {
      page: 'projects',
      label: 'Workspace',
      icon: '💼',
      category: 'workspace',
      submenu: [
        { page: 'projects', label: 'Projects' },
        { page: 'kanban', label: 'Kanban Board' },
        { page: 'tasks', label: 'Tasks' },
        { page: 'workflows', label: 'Workflows' },
      ],
    },
  ];

  const handleNavClick = (page: AdminPage) => {
    setActivePage(page);
    window.location.hash = page;
  };

  const toggleMenu = (category: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const isMenuExpanded = (category: string) => expandedMenus[category];

  return (
    <div className="admin-mfe-container h-screen w-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Top Header Bar - Matching Reference Design */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-50">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-4">
          <img 
            src="/logo.png" 
            alt="Sarso Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-white">Sarso</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search here"
              className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right: Icons and User Profile */}
        <div className="flex items-center space-x-4">
          {/* Settings Icon */}
          <button className="p-2 rounded-lg text-gray-400 hover:text-teal-400 hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Notifications Icon */}
          <button className="relative p-2 rounded-lg text-gray-400 hover:text-teal-400 hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Messages Icon */}
          <button className="p-2 rounded-lg text-gray-400 hover:text-teal-400 hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Building/Organization Icon */}
          <button className="p-2 rounded-lg text-gray-400 hover:text-teal-400 hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </button>

          {/* User Profile Dropdown */}
          <ProfileDropdown user={user} onLogout={handleLogout} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Matching Reference Design */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Logo at top of sidebar */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-3">
              Main Menu
            </div>

            {navItems.map((item) => {
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = isMenuExpanded(item.category);
              const isActive = activePage === item.page || (hasSubmenu && item.submenu?.some(sub => sub.page === activePage));

              return (
                <div key={item.page}>
                  <button
                    onClick={() => {
                      if (hasSubmenu) {
                        toggleMenu(item.category);
                      } else {
                        handleNavClick(item.page);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left group ${
                      isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {hasSubmenu && (
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {/* Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-4">
                      {item.submenu?.map((subItem) => {
                        const isSubActive = activePage === subItem.page;
                        return (
                          <button
                            key={subItem.page}
                            onClick={() => handleNavClick(subItem.page)}
                            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all text-left ${
                              isSubActive
                                ? 'bg-teal-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <span className="text-sm">{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-800">
            <button className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2">
              <span>Get Summary Report</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Sarso © 2024<br />
              All Rights Reserved
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
