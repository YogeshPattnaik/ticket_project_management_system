import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KanbanBoard as KanbanBoardEntity } from '../entities/kanban-board.entity';
import { BoardColumn as BoardColumnEntity } from '../entities/board-column.entity';
import { KanbanBoard, Column } from '@task-management/interfaces';
import { Logger } from '@task-management/utils';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger('BoardsService');

  constructor(
    @InjectRepository(KanbanBoardEntity)
    private boardRepository: Repository<KanbanBoardEntity>,
    @InjectRepository(BoardColumnEntity)
    private columnRepository: Repository<BoardColumnEntity>,
  ) {}

  async createBoard(projectId: string, name: string): Promise<KanbanBoard> {
    const board = this.boardRepository.create({
      name,
      projectId,
      settings: {},
    });

    const savedBoard = await this.boardRepository.save(board);
    const boardWithColumns = await this.boardRepository.findOne({
      where: { id: savedBoard.id },
      relations: ['columns'],
    });

    if (boardWithColumns && boardWithColumns.columns) {
      boardWithColumns.columns.sort((a, b) => a.order - b.order);
    }

    this.logger.info(`Board created: ${savedBoard.name}`);

    return this.mapBoardToDto(boardWithColumns!);
  }

  async getBoard(id: string): Promise<KanbanBoard> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['columns'],
    });

    if (!board) {
      throw new NotFoundException('Board', id);
    }

    if (board.columns) {
      board.columns.sort((a, b) => a.order - b.order);
    }

    return this.mapBoardToDto(board);
  }

  async getBoardsByProject(projectId: string): Promise<KanbanBoard[]> {
    const boards = await this.boardRepository.find({
      where: { projectId },
      relations: ['columns'],
    });

    boards.forEach(board => {
      if (board.columns) {
        board.columns.sort((a, b) => a.order - b.order);
      }
    });

    return boards.map((board: any) => this.mapBoardToDto(board));
  }

  async addColumn(
    boardId: string,
    column: Omit<Column, 'id' | 'boardId' | 'createdAt' | 'updatedAt'>
  ): Promise<Column> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException('Board', boardId);
    }

    const newColumn = this.columnRepository.create({
      boardId,
      name: column.name,
      statuses: column.statuses as any,
      limit: column.limit,
      color: column.color,
      order: column.order,
    });

    const savedColumn = await this.columnRepository.save(newColumn);
    this.logger.info(`Column added: ${savedColumn.name}`);

    return this.mapColumnToDto(savedColumn);
  }

  async updateColumn(
    boardId: string,
    columnId: string,
    updates: Partial<Column>
  ): Promise<Column> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });

    if (!column || column.boardId !== boardId) {
      throw new NotFoundException('Column', columnId);
    }

    Object.assign(column, {
      name: updates.name,
      statuses: updates.statuses as any,
      limit: updates.limit,
      color: updates.color,
      order: updates.order,
    });

    const updatedColumn = await this.columnRepository.save(column);
    return this.mapColumnToDto(updatedColumn);
  }

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id: columnId },
    });

    if (!column || column.boardId !== boardId) {
      throw new NotFoundException('Column', columnId);
    }

    await this.columnRepository.remove(column);
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

