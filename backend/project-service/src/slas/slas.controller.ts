import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SlasService } from './slas.service';
import { SLA } from '@task-management/interfaces';

@ApiTags('slas')
@ApiBearerAuth()
@Controller('slas')
export class SlasController {
  constructor(private readonly slasService: SlasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SLA' })
  @ApiResponse({ status: 201, description: 'SLA created successfully' })
  async create(@Body() sla: Omit<SLA, 'id'>): Promise<SLA> {
    return this.slasService.create(sla);
  }

  @Get()
  @ApiOperation({ summary: 'Get all SLAs' })
  @ApiResponse({ status: 200, description: 'SLAs retrieved successfully' })
  async findAll(@Query('projectId') projectId?: string): Promise<SLA[]> {
    return this.slasService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SLA by ID' })
  @ApiResponse({ status: 200, description: 'SLA retrieved successfully' })
  async findOne(@Param('id') id: string): Promise<SLA> {
    return this.slasService.findOne(id);
  }
}

