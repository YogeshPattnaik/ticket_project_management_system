'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, AdminTable, AdminTableColumn } from '@task-management/shared-ui';
import { useApi } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';
import { useQueryClient } from '@tanstack/react-query';
import { UserDto, RoleDto } from '@task-management/dto';
import { getUserFromStorage } from '../utils/auth';

export function UserManagement() {
  const user = getUserFromStorage();
  const organizationId = user?.organizationId || '';
  const queryClient = useQueryClient();

  // All hooks must be declared at the top, before any early returns
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    name: '',
    roleIds: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    console.log('UserManagement mounted');
    console.log('User:', user);
    console.log('Organization ID:', organizationId);
  }, [user, organizationId]);

  const { data: users, isLoading: usersLoading, error: usersError } = useApi<UserDto[]>(
    ['users', organizationId],
    `/api/v1/users?organizationId=${organizationId}`,
    { enabled: !!organizationId }
  );

  const { data: roles, isLoading: rolesLoading, error: rolesError } = useApi<RoleDto[]>(
    ['roles', organizationId],
    `/api/v1/roles?organizationId=${organizationId}`,
    { enabled: !!organizationId }
  );

  useEffect(() => {
    console.log('Users data:', users);
    console.log('Roles data:', roles);
    if (usersError) {
      console.error('Error fetching users:', usersError);
    }
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }
  }, [users, roles, usersError, rolesError]);

  const handleEditRoles = (user: UserDto) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.roles.map((r) => r.id));
    setIsRoleModalOpen(true);
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    
    setIsUpdatingRoles(true);
    try {
      await apiClient.put<UserDto>(
        `/api/v1/users/${selectedUser.id}/roles?organizationId=${organizationId}`,
        { roleIds: selectedRoleIds }
      );
      // Invalidate and refetch users
      await queryClient.invalidateQueries({ queryKey: ['users', organizationId] });
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      setSelectedRoleIds([]);
    } catch (error) {
      console.error('Failed to update roles:', error);
      alert('Failed to update user roles. Please try again.');
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-red-400 font-semibold mb-2">Organization ID not found</p>
          <p className="text-sm text-gray-400 mb-4">
            The user object doesn't have an organizationId. This might be a data structure issue.
          </p>
          <div className="text-left bg-gray-900 p-4 rounded-lg mb-4">
            <p className="text-xs text-gray-300 mb-2"><strong>User object:</strong></p>
            <pre className="text-xs text-gray-400 overflow-auto max-h-40">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <p className="text-xs text-gray-500">
            Please check the browser console (F12) for more details.
          </p>
        </div>
      </div>
    );
  }

  if (usersLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users and roles...</p>
        </div>
      </div>
    );
  }

  if (usersError || rolesError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-red-400 font-semibold mb-2">Error loading data</p>
          <p className="text-sm text-gray-400 mb-4">
            {usersError?.message || rolesError?.message || 'Please check your connection and try again.'}
          </p>
          <div className="text-left bg-gray-900 p-4 rounded-lg mb-4">
            <p className="text-xs text-gray-300 mb-2"><strong>Error details:</strong></p>
            <pre className="text-xs text-gray-400 overflow-auto max-h-40">
              {JSON.stringify({ usersError, rolesError }, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const columns: AdminTableColumn<UserDto>[] = [
    {
      key: 'user',
      header: 'User',
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">
              {user.email.split('@')[0]}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => <div className="text-sm text-gray-300">{user.email}</div>,
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (user) => (
        <div className="flex flex-wrap gap-2">
          {user.roles.map((role) => (
            <span
              key={role.id}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                role.name === 'superadmin'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : role.name === 'responder'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-700 text-gray-300 border border-gray-600'
              }`}
            >
              {role.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => {
        const isActive = (user.profile as any)?.isActive !== false; // Default to true if not set
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isActive
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      key: 'created',
      header: 'Created',
      render: (user) => (
        <div className="text-sm text-gray-400">
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (user) => (
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const isActive = (user.profile as any)?.isActive !== false;
              try {
                await apiClient.put(`/api/v1/users/${user.id}?organizationId=${organizationId}`, {
                  profile: {
                    ...user.profile,
                    isActive: !isActive,
                  },
                });
                queryClient.invalidateQueries({ queryKey: ['users', organizationId] });
              } catch (error) {
                console.error('Failed to toggle user status:', error);
                alert('Failed to update user status. Please try again.');
              }
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              (user.profile as any)?.isActive !== false
                ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
            }`}
          >
            {(user.profile as any)?.isActive !== false ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditRoles(user);
            }}
            className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
          >
            Edit Roles
          </button>
        </div>
      ),
    },
  ];

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create user
      const response = await apiClient.post(`/api/v1/users?organizationId=${organizationId}`, {
        email: newUser.email,
        password: newUser.password,
        profile: {
          name: newUser.name || newUser.email.split('@')[0],
          isActive: newUser.isActive,
        },
      });

      const createdUser = response.data;

      // Assign roles if any selected
      if (newUser.roleIds.length > 0 && createdUser?.id) {
        await apiClient.put(
          `/api/v1/users/${createdUser.id}/roles?organizationId=${organizationId}`,
          { roleIds: newUser.roleIds }
        );
      }
      
      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['users', organizationId] });
      
      // Reset form
      setNewUser({ email: '', password: '', name: '', roleIds: [], isActive: true });
      setIsAddUserModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create user:', error);
      alert(error.response?.data?.message || 'Failed to create user. Please try again.');
    }
  };

  const toggleNewUserRole = (roleId: string) => {
    setNewUser((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
          <p className="text-gray-400">
            Manage users and their roles in your organization
          </p>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          Add User
        </button>
      </div>

      <div className="w-full">
        <AdminTable
          columns={columns}
          data={users && Array.isArray(users) ? users : []}
          isLoading={usersLoading || rolesLoading}
          emptyMessage={
            users === undefined
              ? 'Data is undefined. Check API connection.'
              : 'No users in this organization yet.'
          }
        />
      </div>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
          setSelectedRoleIds([]);
        }}
        title={`Edit Roles - ${selectedUser?.email}`}
        size="md"
        darkMode={true}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Select roles to assign to this user. Only super admins can change user roles.
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center space-x-3 p-3 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={() => toggleRole(role.id)}
                    className="w-4 h-4 text-teal-600 bg-gray-800 border-gray-600 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{role.name}</div>
                    <div className="text-sm text-gray-400">
                      Hierarchy: {role.hierarchy}
                    </div>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No roles available</p>
            )}
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setIsRoleModalOpen(false);
                setSelectedUser(null);
                setSelectedRoleIds([]);
              }}
              className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRoles}
              disabled={isUpdatingRoles}
              className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingRoles ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setNewUser({ email: '', password: '', name: '', roleIds: [], isActive: true });
        }}
        title="Add New User"
        size="md"
        darkMode={true}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter user email"
              required
              darkMode={true}
            />
            <Input
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Enter password"
              required
              darkMode={true}
            />
            <Input
              label="Name (Optional)"
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter user name (defaults to email username)"
              darkMode={true}
            />
            
            {/* Active Status Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Status</label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setNewUser({ ...newUser, isActive: !newUser.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                    newUser.isActive ? 'bg-teal-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newUser.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-400">
                  {newUser.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Roles</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-3">
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex items-center space-x-3 p-2 border border-gray-700 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={newUser.roleIds.includes(role.id)}
                        onChange={() => toggleNewUserRole(role.id)}
                        className="w-4 h-4 text-teal-600 bg-gray-800 border-gray-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-white">{role.name}</div>
                        <div className="text-xs text-gray-400">
                          Hierarchy: {role.hierarchy}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-2 text-sm">No roles available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setIsAddUserModalOpen(false);
                setNewUser({ email: '', password: '', name: '', roleIds: [], isActive: true });
              }}
              className="px-5 py-2.5 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUser}
              disabled={!newUser.email || !newUser.password}
              className="px-5 py-2.5 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Add User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
