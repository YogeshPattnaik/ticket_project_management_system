import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto): Promise<UserDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      profile: dto.profile || {},
      organizationId: dto.organizationId,
    });
    const savedUser = await this.userRepository.save(user);

    // Load with relations
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    this.logger.info(`User created: ${savedUser.email}`);

    return this.mapUserToDto(userWithRelations || savedUser);
  }

  async findAll(organizationId?: string): Promise<UserDto[]> {
    const where = organizationId ? { organizationId } : {};
    const users = await this.userRepository.find({
      where,
      relations: ['userRoles', 'userRoles.role'],
    });

    return users.map((user) => this.mapUserToDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    return this.mapUserToDto(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    if (dto.email) user.email = dto.email;
    if (dto.profile) user.profile = dto.profile as any;

    const updatedUser = await this.userRepository.save(user);

    // Load with relations
    const userWithRelations = await this.userRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    this.logger.info(`User updated: ${updatedUser.email}`);

    return this.mapUserToDto(userWithRelations || updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User', id);
    }

    await this.userRepository.remove(user);

    this.logger.info(`User deleted: ${user.email}`);
  }

  private mapUserToDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      profile: user.profile as Record<string, unknown>,
      organizationId: user.organizationId,
      roles: (user.userRoles || []).map((ur) => ({
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
