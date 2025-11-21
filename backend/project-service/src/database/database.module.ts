import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Project } from '../entities/project.entity';
import { Task } from '../entities/task.entity';
import { Comment } from '../entities/comment.entity';
import { TaskHistory } from '../entities/task-history.entity';
import { KanbanBoard } from '../entities/kanban-board.entity';
import { BoardColumn } from '../entities/board-column.entity';
import { Workflow } from '../entities/workflow.entity';
import { SLA } from '../entities/sla.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_URL'),
        entities: [Project, Task, Comment, TaskHistory, KanbanBoard, BoardColumn, Workflow, SLA],
        synchronize: false, // Use migrations in production
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Project, Task, Comment, TaskHistory, KanbanBoard, BoardColumn, Workflow, SLA]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

