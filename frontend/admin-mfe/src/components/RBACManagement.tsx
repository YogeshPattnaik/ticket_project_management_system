'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Input, RoleCard } from '@task-management/shared-ui';
import { useApi, useApiMutation } from '@task-management/shared-ui';
import { RoleDto, PermissionDto } from '@task-management/dto';
import { getUserFromStorage } from '../utils/auth';

export function RBACManagement() {
  const user = getUserFromStorage();
  const organizationId = user?.organizationId || '';

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: [] as PermissionDto[],
    hierarchy: 0,
    organizationId: organizationId,
  });

  const { data: roles, isLoading, error } = useApi<RoleDto[]>(
    ['roles', organizationId],
    `/api/v1/roles?organizationId=${organizationId}`,
    { enabled: !!organizationId }
  );

  useEffect(() => {
    console.log('RBACManagement mounted');
    console.log('User:', user);
    console.log('Organization ID:', organizationId);
    console.log('Roles data:', roles);
    if (error) {
      console.error('Error fetching roles:', error);
    }
  }, [user, organizationId, roles, error]);

  const createRoleMutation = useApiMutation<RoleDto, Partial<RoleDto>>(
    '/api/v1/roles',
    'POST',
    {
      invalidateQueries: [['roles']],
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewRole({
          name: '',
          permissions: [],
          hierarchy: 0,
          organizationId: '',
        });
      },
    }
  );

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-red-400 font-semibold mb-2">Organization ID not found</p>
          <p className="text-sm text-gray-400">
            Please log in again to refresh your session.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-red-400 font-semibold mb-2">Error loading roles</p>
          <p className="text-sm text-gray-400 mb-4">
            {error.message || 'Please check your connection and try again.'}
          </p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Role Management</h2>
          <p className="text-gray-400">
            Manage roles and permissions for your organization
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles && roles.length > 0 ? (
          roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">No roles found. Default roles (superadmin, responder) are created automatically.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewRole({
            name: '',
            permissions: [],
            hierarchy: 0,
            organizationId: organizationId,
          });
        }}
        title="Create New Role"
        darkMode={true}
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Role Name"
              value={newRole.name}
              onChange={(e) =>
                setNewRole({ ...newRole, name: e.target.value })
              }
              placeholder="Enter role name"
              required
              darkMode={true}
            />
            <Input
              label="Hierarchy"
              type="number"
              value={newRole.hierarchy.toString()}
              onChange={(e) =>
                setNewRole({ ...newRole, hierarchy: parseInt(e.target.value) || 0 })
              }
              placeholder="Enter hierarchy level"
              required
              darkMode={true}
            />
          </div>
          
          <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
            <p className="text-sm text-teal-300 leading-relaxed">
              <strong className="text-teal-200">Note:</strong> Default roles (superadmin, responder) are created automatically when an organization is created. 
              You can create additional custom roles here.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewRole({
                  name: '',
                  permissions: [],
                  hierarchy: 0,
                  organizationId: organizationId,
                });
              }}
              className="px-5 py-2.5 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => createRoleMutation.mutate(newRole)}
              disabled={createRoleMutation.isPending || !newRole.name.trim()}
              className="px-5 py-2.5 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

