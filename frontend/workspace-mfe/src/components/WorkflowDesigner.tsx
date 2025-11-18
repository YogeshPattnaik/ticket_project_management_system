'use client';

import { useState } from 'react';
import { Card, Button } from '@task-management/shared-ui';
import { useApi } from '@task-management/shared-ui';
import { Workflow } from '@task-management/interfaces';

interface WorkflowDesignerProps {
  projectId: string;
}

export function WorkflowDesigner({ projectId }: WorkflowDesignerProps) {
  const { data: workflows, isLoading } = useApi<Workflow[]>(
    ['workflows', projectId],
    `/api/v1/workflows?projectId=${projectId}`
  );

  if (isLoading) {
    return <div>Loading workflows...</div>;
  }

  return (
    <Card title="Workflow Designer">
      <div className="space-y-4">
        {workflows && workflows.length > 0 ? (
          workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <h4 className="font-semibold mb-2">{workflow.name}</h4>
              <div className="text-sm text-gray-600">
                <p>Triggers: {workflow.triggers.length}</p>
                <p>Conditions: {workflow.conditions.length}</p>
                <p>Actions: {workflow.actions.length}</p>
              </div>
              <Button variant="primary" size="sm" className="mt-2">
                Edit Workflow
              </Button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No workflows found</p>
        )}
        <Button variant="primary">Create New Workflow</Button>
      </div>
    </Card>
  );
}

