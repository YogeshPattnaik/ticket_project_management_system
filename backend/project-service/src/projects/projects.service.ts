import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto, UpdateProjectDto, ProjectDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectDto> {
    const project = this.projectRepository.create({
      name: dto.name,
      description: dto.description,
      settings: (dto.settings || {}) as any,
      organizationId: dto.organizationId,
    });

    const savedProject = await this.projectRepository.save(project);
    this.logger.info(`Project created: ${savedProject.name}`);

    return this.mapProjectToDto(savedProject);
  }

  async findAll(organizationId?: string): Promise<ProjectDto[]> {
    const where = organizationId ? { organizationId } : {};
    const projects = await this.projectRepository.find({
      where,
      relations: ['tasks'],
    });

    return projects.map((project: any) => this.mapProjectToDto(project));
  }

  async findOne(id: string): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['tasks', 'boards', 'workflows'],
    });

    if (!project) {
      throw new NotFoundException('Project', id);
    }

    return this.mapProjectToDto(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project', id);
    }

    Object.assign(project, {
      name: dto.name,
      description: dto.description,
      settings: (dto.settings || {}) as any,
    });

    const updatedProject = await this.projectRepository.save(project);
    this.logger.info(`Project updated: ${updatedProject.name}`);

    return this.mapProjectToDto(updatedProject);
  }

  async remove(id: string): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project', id);
    }

    await this.projectRepository.remove(project);
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

