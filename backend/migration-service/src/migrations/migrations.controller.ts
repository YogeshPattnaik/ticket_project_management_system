import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MigrationsService } from './migrations.service';
import { CreateMigrationDto, ExecuteMigrationDto } from '@task-management/dto';
import { IMigration } from '../common/migration.interface';

@ApiTags('migrations')
@Controller('migrations')
export class MigrationsController {
  constructor(private readonly migrationsService: MigrationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new migration file' })
  @ApiResponse({ status: 201, description: 'Migration created successfully' })
  async createMigration(
    @Body() dto: CreateMigrationDto
  ): Promise<IMigration> {
    return this.migrationsService.createMigration(dto);
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute a migration' })
  @ApiResponse({ status: 200, description: 'Migration executed successfully' })
  async executeMigration(
    @Body() dto: ExecuteMigrationDto
  ): Promise<IMigration> {
    return this.migrationsService.executeMigration(dto);
  }

  @Post('rollback/:version')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback a migration' })
  @ApiResponse({ status: 200, description: 'Migration rolled back successfully' })
  async rollbackMigration(
    @Param('version') version: string,
    @Query('type') type: 'sql' | 'nosql',
  ): Promise<IMigration> {
    return this.migrationsService.rollbackMigration(version, type);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get migration history' })
  @ApiResponse({ status: 200, description: 'Migration history retrieved' })
  async getMigrationHistory(
    @Query('type') type: 'sql' | 'nosql',
  ): Promise<IMigration[]> {
    return this.migrationsService.getMigrationHistory(type);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current migration version' })
  @ApiResponse({ status: 200, description: 'Current version retrieved' })
  async getCurrentVersion(
    @Query('type') type: 'sql' | 'nosql',
  ): Promise<{ version: string | null }> {
    const version = await this.migrationsService.getCurrentVersion(type);
    return { version };
  }

  @Delete(':version')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a migration file' })
  @ApiResponse({ status: 204, description: 'Migration deleted successfully' })
  async deleteMigration(
    @Param('version') version: string,
    @Query('type') type: 'sql' | 'nosql',
  ): Promise<void> {
    return this.migrationsService.deleteMigration(version, type);
  }
}

