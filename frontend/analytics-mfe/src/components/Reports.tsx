'use client';

import { useState } from 'react';
import { Card, Button } from '@task-management/shared-ui';
import { useApi, useApiMutation } from '@task-management/shared-ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Reports() {
  const [reportType, setReportType] = useState<'tasks' | 'projects' | 'users'>('tasks');

  const { data: reportData, isLoading } = useApi(
    ['reports', reportType],
    `/api/v1/analytics/reports?type=${reportType}`
  );

  const generateReportMutation = useApiMutation<unknown, { type: string; dateRange: string }>(
    '/api/v1/analytics/reports/generate',
    'POST',
    {
      onSuccess: () => {
        alert('Report generated successfully');
      },
    }
  );

  const handleGenerateReport = () => {
    generateReportMutation.mutate({ type: reportType });
  };

  if (isLoading) {
    return <div>Loading report data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex space-x-2">
          <Button
            onClick={() => setReportType('tasks')}
            variant={reportType === 'tasks' ? 'primary' : 'secondary'}
          >
            Tasks
          </Button>
          <Button
            onClick={() => setReportType('projects')}
            variant={reportType === 'projects' ? 'primary' : 'secondary'}
          >
            Projects
          </Button>
          <Button
            onClick={() => setReportType('users')}
            variant={reportType === 'users' ? 'primary' : 'secondary'}
          >
            Users
          </Button>
          <Button onClick={handleGenerateReport} variant="primary">
            Generate Report
          </Button>
        </div>
      </div>

      <Card title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`}>
        {reportData && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

