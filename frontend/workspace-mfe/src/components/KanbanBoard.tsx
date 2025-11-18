'use client';

import { useState, useEffect, useOptimistic } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@task-management/shared-ui';
import { useApi, useApiMutation, useWebSocket } from '@task-management/shared-ui';
import { TaskDto } from '@task-management/dto';
import { KanbanBoard as IKanbanBoard, Column } from '@task-management/interfaces';

interface TaskCardProps {
  task: TaskDto;
}

function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 cursor-move hover:shadow-md transition-shadow"
    >
      <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
      <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">Priority: {task.priority}</span>
        {task.assigneeId && (
          <span className="text-xs text-blue-600">Assigned</span>
        )}
      </div>
    </div>
  );
}

interface ColumnProps {
  column: Column;
  tasks: TaskDto[];
}

function BoardColumn({ column, tasks }: ColumnProps) {
  const columnTasks = tasks.filter((task) =>
    column.statuses.includes(task.status)
  );

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{column.name}</h3>
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: column.color, color: 'white' }}
        >
          {columnTasks.length}
          {column.limit && ` / ${column.limit}`}
        </span>
      </div>
      <SortableContext
        items={columnTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[200px]">
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanBoardProps {
  boardId: string;
  projectId: string;
}

export function KanbanBoard({ boardId, projectId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic<TaskDto[]>([]);

  const { data: board, isLoading: boardLoading } = useApi<IKanbanBoard>(
    ['board', boardId],
    `/api/v1/boards/${boardId}`
  );

  const { data: tasks, isLoading: tasksLoading } = useApi<TaskDto[]>(
    ['tasks', projectId],
    `/api/v1/tasks?projectId=${projectId}`
  );

  const moveTaskMutation = useApiMutation<TaskDto, { taskId: string; columnId: string }>(
    `/api/v1/tasks/${activeId}/move`,
    'POST',
    {
      invalidateQueries: [['tasks', projectId]],
    }
  );

  const { on } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3003',
    undefined
  );

  useEffect(() => {
    if (tasks) {
      setOptimisticTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    const handleTaskUpdate = (data: { task: TaskDto }) => {
      setOptimisticTasks((prev) =>
        prev.map((t) => (t.id === data.task.id ? data.task : t))
      );
    };

    on('task:updated', handleTaskUpdate);

    return () => {
      // Cleanup handled by useWebSocket
    };
  }, [on]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetColumnId = over.id as string;

    const targetColumn = board?.columns.find((col) => col.id === targetColumnId);
    if (!targetColumn || targetColumn.statuses.length === 0) return;

    const newStatus = targetColumn.statuses[0];

    // Optimistic update
    setOptimisticTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // Server update
    try {
      await moveTaskMutation.mutateAsync({ status: newStatus });
    } catch (error) {
      // Rollback on error
      if (tasks) {
        setOptimisticTasks(tasks);
      }
    }
  };

  if (boardLoading || tasksLoading) {
    return <div>Loading board...</div>;
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <Card title="Kanban Board" className="p-6">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {board.columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={optimisticTasks || []}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-64">
              <p className="text-sm font-semibold">
                {optimisticTasks.find((t) => t.id === activeId)?.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Card>
  );
}

