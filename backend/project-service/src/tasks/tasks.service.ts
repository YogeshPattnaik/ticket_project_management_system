import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || 'todo',
        priority: dto.priority || 0,
        customFields: (dto.customFields || {}) as any,
        projectId: dto.projectId,
        assigneeId: dto.assigneeId,
      },
    });

    // Record history
    await this.recordHistory(task.id, 'status', null, task.status, dto.assigneeId || 'system');

    this.logger.info(`Task created: ${task.title}`);

    return this.mapTaskToDto(task);
  }

  async findAll(projectId?: string, status?: string): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(status && { status }),
      },
      include: {
        // Project relation available via projectId
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks.map((task: any) => this.mapTaskToDto(task));
  }

  async findOne(id: string): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        // Project relation available via projectId
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task', id);
    }

    return this.mapTaskToDto(task);
  }

  async update(id: string, dto: UpdateTaskDto, userId?: string): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task', id);
    }

    // Record history for changed fields
    if (dto.status && dto.status !== task.status) {
      await this.recordHistory(id, 'status', task.status, dto.status, userId || 'system');
    }
    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      await this.recordHistory(id, 'assignee', task.assigneeId, dto.assigneeId, userId || 'system');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        customFields: dto.customFields as any,
        assigneeId: dto.assigneeId,
      },
    });

    this.logger.info(`Task updated: ${updatedTask.title}`);

    return this.mapTaskToDto(updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task', id);
    }

    await this.prisma.task.delete({
      where: { id },
    });

    this.logger.info(`Task deleted: ${task.title}`);
  }

  async moveTask(taskId: string, newStatus: string, userId?: string): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task', taskId);
    }

    // Record history
    await this.recordHistory(taskId, 'status', task.status, newStatus, userId || 'system');

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    this.logger.info(`Task moved: ${task.title} -> ${newStatus}`);

    return this.mapTaskToDto(updatedTask);
  }

  private async recordHistory(
    taskId: string,
    field: string,
    oldValue: string | null,
    newValue: string | null,
    userId: string
  ): Promise<void> {
    await this.prisma.taskHistory.create({
      data: {
        taskId,
        field,
        oldValue,
        newValue,
        userId,
      },
    });
  }

  private mapTaskToDto(task: any): TaskDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      customFields: task.customFields as Record<string, unknown>,
      projectId: task.projectId,
      assigneeId: task.assigneeId || undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

