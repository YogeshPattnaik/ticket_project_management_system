import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        settings: (dto.settings || {}) as any,
        organizationId: dto.organizationId,
      },
    });

    this.logger.info(`Project created: ${project.name}`);

    return this.mapProjectToDto(project);
  }

  async findAll(organizationId?: string): Promise<ProjectDto[]> {
    const projects = await this.prisma.project.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    return projects.map((project: any) => this.mapProjectToDto(project));
  }

  async findOne(id: string): Promise<ProjectDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tasks: true,
            boards: true,
            workflows: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project', id);
    }

    return this.mapProjectToDto(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project', id);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        settings: (dto.settings || {}) as any,
      },
    });

    this.logger.info(`Project updated: ${updatedProject.name}`);

    return this.mapProjectToDto(updatedProject);
  }

  async remove(id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project', id);
    }

    await this.prisma.project.delete({
      where: { id },
    });

    this.logger.info(`Project deleted: ${project.name}`);
  }

  private mapProjectToDto(project: any): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      settings: project.settings as Record<string, unknown>,
      organizationId: project.organizationId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

