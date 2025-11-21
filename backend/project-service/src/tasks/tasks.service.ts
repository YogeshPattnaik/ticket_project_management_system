import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { CreateTaskDto, UpdateTaskDto, TaskDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(TaskHistory)
    private taskHistoryRepository: Repository<TaskHistory>,
  ) {}

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status || 'todo',
      priority: dto.priority || 0,
      customFields: (dto.customFields || {}) as any,
      projectId: dto.projectId,
      assigneeId: dto.assigneeId,
    });

    const savedTask = await this.taskRepository.save(task);

    // Record history
    await this.recordHistory(savedTask.id, 'status', null, savedTask.status, dto.assigneeId || 'system');

    this.logger.info(`Task created: ${savedTask.title}`);

    return this.mapTaskToDto(savedTask);
  }

  async findAll(projectId?: string, status?: string): Promise<TaskDto[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const tasks = await this.taskRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });

    return tasks.map((task: any) => this.mapTaskToDto(task));
  }

  async findOne(id: string): Promise<TaskDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['comments'],
    });

    if (!task) {
      throw new NotFoundException('Task', id);
    }

    // Sort comments by createdAt descending
    if (task.comments && task.comments.length > 0) {
      task.comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return this.mapTaskToDto(task);
  }

  async update(id: string, dto: UpdateTaskDto, userId?: string): Promise<TaskDto> {
    const task = await this.taskRepository.findOne({
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
      await this.recordHistory(id, 'assignee', task.assigneeId || null, dto.assigneeId, userId || 'system');
    }

    Object.assign(task, {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      customFields: dto.customFields as any,
      assigneeId: dto.assigneeId,
    });

    const updatedTask = await this.taskRepository.save(task);
    this.logger.info(`Task updated: ${updatedTask.title}`);

    return this.mapTaskToDto(updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task', id);
    }

    await this.taskRepository.remove(task);
    this.logger.info(`Task deleted: ${task.title}`);
  }

  async moveTask(taskId: string, newStatus: string, userId?: string): Promise<TaskDto> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task', taskId);
    }

    // Record history
    await this.recordHistory(taskId, 'status', task.status, newStatus, userId || 'system');

    task.status = newStatus;
    const updatedTask = await this.taskRepository.save(task);

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
    const history = new TaskHistory();
    history.taskId = taskId;
    history.field = field;
    history.oldValue = oldValue ?? undefined;
    history.newValue = newValue ?? undefined;
    history.userId = userId;
    await this.taskHistoryRepository.save(history);
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

