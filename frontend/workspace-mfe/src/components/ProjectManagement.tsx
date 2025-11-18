'use client';

import { useState } from 'react';
import { Card, Button, Modal, Input } from '@task-management/shared-ui';
import { useApi, useApiMutation } from '@task-management/shared-ui';
import { ProjectDto, CreateProjectDto } from '@task-management/dto';

export function ProjectManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectDto>({
    name: '',
    description: '',
    organizationId: '',
  });

  const { data: projects, isLoading } = useApi<ProjectDto[]>(
    ['projects'],
    '/api/v1/projects'
  );

  const createProjectMutation = useApiMutation<ProjectDto, CreateProjectDto>(
    '/api/v1/projects',
    'POST',
    {
      invalidateQueries: [['projects']],
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewProject({ name: '', description: '', organizationId: '' });
      },
    }
  );

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="space-y-4">
      <Card
        title="Projects"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Create Project
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {project.description || 'No description'}
                </p>
                <Button variant="primary" size="sm">
                  View Details
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">
              No projects found
            </p>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            required
          />
          <Input
            label="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
          <Input
            label="Organization ID"
            value={newProject.organizationId}
            onChange={(e) =>
              setNewProject({ ...newProject, organizationId: e.target.value })
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
              onClick={() => createProjectMutation.mutate(newProject)}
              variant="primary"
              isLoading={createProjectMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

