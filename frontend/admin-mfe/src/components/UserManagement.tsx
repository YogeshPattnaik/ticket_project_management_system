'use client';

import { useState } from 'react';
import { Card, Button, Modal, Input } from '@task-management/shared-ui';
import { useApi, useApiMutation } from '@task-management/shared-ui';
import { UserDto, CreateUserDto } from '@task-management/dto';

export function UserManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserDto>({
    email: '',
    password: '',
    organizationId: '',
  });

  const { data: users, isLoading } = useApi<UserDto[]>(
    ['users'],
    '/api/v1/users'
  );

  const createUserMutation = useApiMutation<UserDto, CreateUserDto>(
    '/api/v1/users',
    'POST',
    {
      invalidateQueries: [['users']],
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewUser({ email: '', password: '', organizationId: '' });
      },
    }
  );

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <Card
        title="User Management"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Create User
          </Button>
        }
      >
        <div className="space-y-2">
          {users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold">{user.email}</h4>
                  <p className="text-sm text-gray-600">
                    Roles: {user.roles.map((r) => r.name).join(', ')}
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Edit
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No users found</p>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New User"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            required
          />
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            required
          />
          <Input
            label="Organization ID"
            value={newUser.organizationId}
            onChange={(e) =>
              setNewUser({ ...newUser, organizationId: e.target.value })
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
              onClick={() => createUserMutation.mutate(newUser)}
              variant="primary"
              isLoading={createUserMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

