'use client';

import { useState, useActionState } from 'react';
import { Card, Button, Modal, Input } from '@task-management/shared-ui';
import { useApi, useApiMutation } from '@task-management/shared-ui';
import { RoleDto, PermissionDto } from '@task-management/dto';

export function RBACManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: [] as PermissionDto[],
    hierarchy: 0,
    organizationId: '',
  });

  const { data: roles, isLoading } = useApi<RoleDto[]>(
    ['roles'],
    '/api/v1/roles'
  );

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

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <Card
        title="Role-Based Access Control"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Create Role
          </Button>
        }
      >
        <div className="space-y-4">
          {roles && roles.length > 0 ? (
            roles.map((role) => (
              <div
                key={role.id}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{role.name}</h4>
                    <p className="text-sm text-gray-600">
                      Hierarchy: {role.hierarchy}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Permissions: {role.permissions.length}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No roles found</p>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Role"
      >
        <div className="space-y-4">
          <Input
            label="Role Name"
            value={newRole.name}
            onChange={(e) =>
              setNewRole({ ...newRole, name: e.target.value })
            }
            required
          />
          <Input
            label="Hierarchy"
            type="number"
            value={newRole.hierarchy.toString()}
            onChange={(e) =>
              setNewRole({ ...newRole, hierarchy: parseInt(e.target.value) })
            }
            required
          />
          <Input
            label="Organization ID"
            value={newRole.organizationId}
            onChange={(e) =>
              setNewRole({ ...newRole, organizationId: e.target.value })
            }
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createRoleMutation.mutate(newRole)}
              variant="primary"
              isLoading={createRoleMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

