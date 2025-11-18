import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KanbanBoard, Column } from '@task-management/interfaces';
import { Logger } from '@task-management/utils';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger('BoardsService');

  constructor(private prisma: PrismaService) {}

  async createBoard(projectId: string, name: string): Promise<KanbanBoard> {
    const board = await this.prisma.kanbanBoard.create({
      data: {
        name,
        projectId,
        settings: {},
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    this.logger.info(`Board created: ${board.name}`);

    return this.mapBoardToDto(board);
  }

  async getBoard(id: string): Promise<KanbanBoard> {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board', id);
    }

    return this.mapBoardToDto(board);
  }

  async getBoardsByProject(projectId: string): Promise<KanbanBoard[]> {
    const boards = await this.prisma.kanbanBoard.findMany({
      where: { projectId },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return boards.map((board: any) => this.mapBoardToDto(board));
  }

  async addColumn(
    boardId: string,
    column: Omit<Column, 'id' | 'boardId' | 'createdAt' | 'updatedAt'>
  ): Promise<Column> {
    const board = await this.prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board', boardId);
    }

    const newColumn = await this.prisma.boardColumn.create({
      data: {
        boardId,
        name: column.name,
        statuses: column.statuses as any,
        limit: column.limit,
        color: column.color,
        order: column.order,
      },
    });

    this.logger.info(`Column added: ${newColumn.name}`);

    return this.mapColumnToDto(newColumn);
  }

  async updateColumn(
    boardId: string,
    columnId: string,
    updates: Partial<Column>
  ): Promise<Column> {
    const column = await this.prisma.boardColumn.findUnique({
      where: { id: columnId },
    });

    if (!column || column.boardId !== boardId) {
      throw new NotFoundException('Column', columnId);
    }

    const updatedColumn = await this.prisma.boardColumn.update({
      where: { id: columnId },
      data: {
        name: updates.name,
        statuses: updates.statuses as any,
        limit: updates.limit,
        color: updates.color,
        order: updates.order,
      },
    });

    return this.mapColumnToDto(updatedColumn);
  }

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    const column = await this.prisma.boardColumn.findUnique({
      where: { id: columnId },
    });

    if (!column || column.boardId !== boardId) {
      throw new NotFoundException('Column', columnId);
    }

    await this.prisma.boardColumn.delete({
      where: { id: columnId },
    });

    this.logger.info(`Column deleted: ${column.name}`);
  }

  private mapBoardToDto(board: any): KanbanBoard {
    return {
      id: board.id,
      projectId: board.projectId,
      columns: board.columns.map((col: any) => this.mapColumnToDto(col)),
      swimlanes: [],
      filters: [],
      automation: [],
    };
  }

  private mapColumnToDto(column: any): Column {
    return {
      id: column.id,
      name: column.name,
      statuses: column.statuses as string[],
      limit: column.limit || undefined,
      color: column.color,
      order: column.order,
    };
  }
}

