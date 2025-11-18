import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { RoleDto, PermissionDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class RolesService {
  private readonly logger = new Logger('RolesService');

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>
  ) {}

  async create(
    name: string,
    permissions: PermissionDto[],
    hierarchy: number,
    organizationId: string
  ): Promise<RoleDto> {
    const role = this.roleRepository.create({
      name,
      permissions: permissions as any,
      hierarchy,
      organizationId,
    });
    const savedRole = await this.roleRepository.save(role);

    this.logger.info(`Role created: ${savedRole.name}`);

    return this.mapRoleToDto(savedRole);
  }

  async findAll(organizationId?: string): Promise<RoleDto[]> {
    const where = organizationId ? { organizationId } : {};
    const roles = await this.roleRepository.find({ where });

    return roles.map((role) => this.mapRoleToDto(role));
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.roleRepository.findOne({ where: { id } });

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
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role', id);
    }

    if (name) role.name = name;
    if (permissions) role.permissions = permissions as any;
    if (hierarchy !== undefined) role.hierarchy = hierarchy;

    const updatedRole = await this.roleRepository.save(role);

    this.logger.info(`Role updated: ${updatedRole.name}`);

    return this.mapRoleToDto(updatedRole);
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role', id);
    }

    await this.roleRepository.remove(role);

    this.logger.info(`Role deleted: ${role.name}`);
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });

    if (!existing) {
      const userRole = this.userRoleRepository.create({ userId, roleId });
      await this.userRoleRepository.save(userRole);
    }

    this.logger.info(`Role ${roleId} assigned to user ${userId}`);
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId, roleId });
    this.logger.info(`Role ${roleId} removed from user ${userId}`);
  }

  private mapRoleToDto(role: Role): RoleDto {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions as PermissionDto[],
      hierarchy: role.hierarchy,
      organizationId: role.organizationId,
    };
  }
}
