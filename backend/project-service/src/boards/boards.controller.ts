import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { KanbanBoard, Column } from '@task-management/interfaces';

@ApiTags('boards')
@ApiBearerAuth()
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new board' })
  @ApiResponse({ status: 201, description: 'Board created successfully' })
  async createBoard(
    @Body('projectId') projectId: string,
    @Body('name') name: string
  ): Promise<KanbanBoard> {
    return this.boardsService.createBoard(projectId, name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board by ID' })
  @ApiResponse({ status: 200, description: 'Board retrieved successfully' })
  async getBoard(@Param('id') id: string): Promise<KanbanBoard> {
    return this.boardsService.getBoard(id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get boards by project' })
  @ApiResponse({ status: 200, description: 'Boards retrieved successfully' })
  async getBoardsByProject(@Param('projectId') projectId: string): Promise<KanbanBoard[]> {
    return this.boardsService.getBoardsByProject(projectId);
  }

  @Post(':boardId/columns')
  @ApiOperation({ summary: 'Add column to board' })
  @ApiResponse({ status: 201, description: 'Column added successfully' })
  async addColumn(
    @Param('boardId') boardId: string,
    @Body() column: Omit<Column, 'id' | 'boardId' | 'createdAt' | 'updatedAt'>
  ): Promise<Column> {
    return this.boardsService.addColumn(boardId, column);
  }

  @Put(':boardId/columns/:columnId')
  @ApiOperation({ summary: 'Update column' })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  async updateColumn(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() updates: Partial<Column>
  ): Promise<Column> {
    return this.boardsService.updateColumn(boardId, columnId, updates);
  }

  @Delete(':boardId/columns/:columnId')
  @ApiOperation({ summary: 'Delete column' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  async deleteColumn(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string
  ): Promise<void> {
    return this.boardsService.deleteColumn(boardId, columnId);
  }
}

