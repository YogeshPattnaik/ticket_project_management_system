import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        profile: (dto.profile || {}) as any,
        organizationId: dto.organizationId,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.info(`User created: ${user.email}`);

    return this.mapUserToDto(user);
  }

  async findAll(organizationId?: string): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      where: organizationId ? { organizationId } : undefined,
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((user: any) => this.mapUserToDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    return this.mapUserToDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        profile: dto.profile as any,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.info(`User updated: ${updatedUser.email}`);

    return this.mapUserToDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.info(`User deleted: ${user.email}`);
  }

  private mapUserToDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      profile: user.profile as Record<string, unknown>,
      organizationId: user.organizationId,
      roles: user.userRoles.map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
        permissions: ur.role.permissions as any[],
        hierarchy: ur.role.hierarchy,
        organizationId: ur.role.organizationId,
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

