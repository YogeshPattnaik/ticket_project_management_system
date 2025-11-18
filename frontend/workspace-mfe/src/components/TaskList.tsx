'use client';

import { useState } from 'react';
import { Card, Button, Modal } from '@task-management/shared-ui';
import { useApi, useApiMutation } from '@task-management/shared-ui';
import { TaskDto, CreateTaskDto } from '@task-management/dto';
import { Input } from '@task-management/shared-ui';

interface TaskListProps {
  projectId: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<CreateTaskDto>({
    title: '',
    description: '',
    projectId,
    status: 'todo',
    priority: 0,
  });

  const { data: tasks, isLoading } = useApi<TaskDto[]>(
    ['tasks', projectId],
    `/api/v1/tasks?projectId=${projectId}`
  );

  const createTaskMutation = useApiMutation<TaskDto, CreateTaskDto>(
    '/api/v1/tasks',
    'POST',
    {
      invalidateQueries: [['tasks', projectId]],
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          projectId,
          status: 'todo',
          priority: 0,
        });
      },
    }
  );

  const deleteTaskMutation = useApiMutation<void, { id: string }>(
    '',
    'DELETE',
    {
      invalidateQueries: [['tasks', projectId]],
    }
  );

  const handleCreateTask = async () => {
    await createTaskMutation.mutateAsync(newTask);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTaskMutation.mutateAsync(
        {},
        {
          url: `/api/v1/tasks/${taskId}`,
        }
      );
    }
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <Card
        title="Tasks"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Create Task
          </Button>
        }
      >
        <div className="space-y-2">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Status: {task.status}</span>
                    <span>Priority: {task.priority}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteTask(task.id)}
                  variant="danger"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks found</p>
          )}
        </div>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask({ ...newTask, title: e.target.value })
            }
            required
          />
          <Input
            label="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            type="textarea"
          />
          <Input
            label="Status"
            value={newTask.status}
            onChange={(e) =>
              setNewTask({ ...newTask, status: e.target.value })
            }
          />
          <Input
            label="Priority"
            type="number"
            value={newTask.priority?.toString()}
            onChange={(e) =>
              setNewTask({ ...newTask, priority: parseInt(e.target.value) })
            }
          />
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setIsCreateModalOpen(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTask}
              variant="primary"
              isLoading={createTaskMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

