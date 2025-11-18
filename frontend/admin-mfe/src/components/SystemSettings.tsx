'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@task-management/shared-ui';
import { useApiMutation } from '@task-management/shared-ui';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    organizationName: '',
    maxUsers: 100,
    enableNotifications: true,
  });

  const updateSettingsMutation = useApiMutation<unknown, typeof settings>(
    '/api/v1/settings',
    'PUT',
    {
      onSuccess: () => {
        alert('Settings updated successfully');
      },
    }
  );

  return (
    <div className="space-y-4 p-6">
      <Card title="System Settings">
        <div className="space-y-4">
          <Input
            label="Organization Name"
            value={settings.organizationName}
            onChange={(e) =>
              setSettings({ ...settings, organizationName: e.target.value })
            }
          />
          <Input
            label="Max Users"
            type="number"
            value={settings.maxUsers.toString()}
            onChange={(e) =>
              setSettings({
                ...settings,
                maxUsers: parseInt(e.target.value),
              })
            }
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  enableNotifications: e.target.checked,
                })
              }
            />
            <label>Enable Notifications</label>
          </div>
          <Button
            onClick={() => updateSettingsMutation.mutate(settings)}
            variant="primary"
            isLoading={updateSettingsMutation.isPending}
          >
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  );
}

