import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleDto, PermissionDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class RolesService {
  private readonly logger = new Logger('RolesService');

  constructor(private prisma: PrismaService) {}

  async create(
    name: string,
    permissions: PermissionDto[],
    hierarchy: number,
    organizationId: string
  ): Promise<RoleDto> {
    const role = await this.prisma.role.create({
      data: {
        name,
        permissions: permissions as any,
        hierarchy,
        organizationId,
      },
    });

    this.logger.info(`Role created: ${role.name}`);

    return this.mapRoleToDto(role);
  }

  async findAll(organizationId?: string): Promise<RoleDto[]> {
    const roles = await this.prisma.role.findMany({
      where: organizationId ? { organizationId } : undefined,
    });

    return roles.map((role: any) => this.mapRoleToDto(role));
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role', id);
    }

    return this.mapRoleToDto(role);
  }

  async update(
    id: string,
    name?: string,
    permissions?: PermissionDto[],
    hierarchy?: number
  ): Promise<RoleDto> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role', id);
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        name,
        permissions: permissions as any,
        hierarchy,
      },
    });

    this.logger.info(`Role updated: ${updatedRole.name}`);

    return this.mapRoleToDto(updatedRole);
  }

  async remove(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role', id);
    }

    await this.prisma.role.delete({
      where: { id },
    });

    this.logger.info(`Role deleted: ${role.name}`);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      update: {},
      create: {
        userId,
        roleId,
      },
    });

    this.logger.info(`Role ${roleId} assigned to user ${userId}`);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    this.logger.info(`Role ${roleId} removed from user ${userId}`);
  }

  private mapRoleToDto(role: any): RoleDto {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions as PermissionDto[],
      hierarchy: role.hierarchy,
      organizationId: role.organizationId,
    };
  }
}

