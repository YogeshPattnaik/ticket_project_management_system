
import { useState } from 'react';
import { Button, Input, Card } from '@task-management/shared-ui';
import { useAuth } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';

export function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await apiClient.put(`/api/v1/users/${user?.id}`, {
        profile,
      });
      setMessage('Profile updated successfully');
    } catch (error: any) {
      setMessage(error.response?.data?.error?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card title="Profile Settings">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization ID
            </label>
            <Input value={user.organizationId} disabled />
          </div>
          {message && (
            <div
              className={`p-3 rounded ${
                message.includes('success')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
          <div className="flex space-x-4">
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              variant="primary"
            >
              Save Changes
            </Button>
            <Button onClick={logout} variant="danger">
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

