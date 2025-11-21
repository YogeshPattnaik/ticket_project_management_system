import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { BoardsModule } from './boards/boards.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { SlasModule } from './slas/slas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    ProjectsModule,
    TasksModule,
    BoardsModule,
    WorkflowsModule,
    SlasModule,
  ],
})
export class AppModule {}

