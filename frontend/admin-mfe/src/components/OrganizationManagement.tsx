'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Input, AdminTable, AdminTableColumn } from '@task-management/shared-ui';
import { useApi } from '@task-management/shared-ui';
import { apiClient } from '@task-management/shared-ui';

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function OrganizationManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  const { data: organizations, isLoading, error, refetch } = useApi<Organization[]>(
    ['organizations'],
    '/api/v1/auth/organizations'
  );

  useEffect(() => {
    console.log('OrganizationManagement mounted');
    console.log('Organizations data:', organizations);
    if (error) {
      console.error('Error fetching organizations:', error);
    }
  }, [organizations, error]);

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;

    try {
      // Organizations are created automatically when users register
      // This is just for viewing existing organizations
      alert('Organizations are created automatically when users register with a new organization name.');
      setIsCreateModalOpen(false);
      setNewOrgName('');
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  const columns: AdminTableColumn<Organization>[] = [
    {
      key: 'name',
      header: 'Organization Name',
      render: (org) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">🏢</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">{org.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'ID',
      render: (org) => (
        <div className="text-sm text-gray-400 font-mono">{org.id.substring(0, 8)}...</div>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (org) => {
        const date = new Date(org.createdAt);
        return (
          <div className="text-sm text-gray-400">
            {isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (org) => {
        const date = new Date(org.updatedAt);
        return (
          <div className="text-sm text-gray-400">
            {isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-red-400 font-semibold mb-2">Error loading organizations</p>
          <p className="text-sm text-gray-400 mb-4">
            {error.message || 'Please check your connection and try again.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Organization Management</h2>
        <p className="text-gray-400">
          View and manage organizations in the system
        </p>
      </div>

      <div className="w-full">
        <AdminTable
          columns={columns}
          data={organizations || []}
          isLoading={isLoading}
          emptyMessage="No organizations found"
        />
      </div>

      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
        <p className="text-sm text-teal-300">
          <strong className="text-teal-200">Note:</strong> Organizations are automatically created when users register with a new organization name. 
          Each organization gets default roles (superadmin, responder) and the first user becomes a super admin.
        </p>
      </div>
    </div>
  );
}

