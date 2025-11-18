import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { Workflow } from '@task-management/interfaces';

@ApiTags('workflows')
@ApiBearerAuth()
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  async create(@Body() workflow: Omit<Workflow, 'id'>): Promise<Workflow> {
    return this.workflowsService.create(workflow);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workflows' })
  @ApiResponse({ status: 200, description: 'Workflows retrieved successfully' })
  async findAll(@Query('projectId') projectId?: string): Promise<Workflow[]> {
    return this.workflowsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiResponse({ status: 200, description: 'Workflow retrieved successfully' })
  async findOne(@Param('id') id: string): Promise<Workflow> {
    return this.workflowsService.findOne(id);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute workflow' })
  @ApiResponse({ status: 200, description: 'Workflow executed successfully' })
  async execute(
    @Param('id') id: string,
    @Body() context: Record<string, unknown>
  ): Promise<void> {
    return this.workflowsService.execute(id, context);
  }
}

