import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { KanbanBoard } from '../entities/kanban-board.entity';
import { BoardColumn } from '../entities/board-column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanBoard, BoardColumn])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}

