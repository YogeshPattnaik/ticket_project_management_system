import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskDto } from '@task-management/dto';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  async create(@Body() dto: CreateTaskDto): Promise<TaskDto> {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string
  ): Promise<TaskDto[]> {
    return this.tasksService.findAll(projectId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string): Promise<TaskDto> {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto
  ): Promise<TaskDto> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.remove(id);
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Move task to new status' })
  @ApiResponse({ status: 200, description: 'Task moved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async moveTask(
    @Param('id') id: string,
    @Body('status') status: string
  ): Promise<TaskDto> {
    return this.tasksService.moveTask(id, status);
  }
}

