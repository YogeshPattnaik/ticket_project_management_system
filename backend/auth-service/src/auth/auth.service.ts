import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create or get organization
    let organization;
    let isNewOrganization = false;
    if (dto.organizationName) {
      organization = await this.organizationRepository.findOne({
        where: { name: dto.organizationName },
      });
      if (!organization) {
        organization = this.organizationRepository.create({
          name: dto.organizationName,
        });
        organization = await this.organizationRepository.save(organization);
        isNewOrganization = true;
      }
    } else {
      // Create default organization
      organization = this.organizationRepository.create({
        name: `${dto.email.split('@')[0]} Organization`,
      });
      organization = await this.organizationRepository.save(organization);
      isNewOrganization = true;
    }

    // Create default roles for organization if it's new
    if (isNewOrganization) {
      await this.createDefaultRoles(organization.id);
    }

    // Check if this is the first user in the organization
    const existingUsers = await this.userRepository.count({
      where: { organizationId: organization.id },
    });
    const isFirstUser = existingUsers === 0;

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      profile: {},
      organizationId: organization.id,
    });
    const savedUser = await this.userRepository.save(user);

    // Assign role: superadmin if first user, responder otherwise
    const roleName = isFirstUser ? 'superadmin' : 'responder';
    const role = await this.roleRepository.findOne({
      where: { name: roleName, organizationId: organization.id },
    });

    if (role) {
      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleId: role.id,
      });
      await this.userRoleRepository.save(userRole);
    }

    // Load user with relations
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = await this.generateRefreshToken(savedUser.id);

    this.logger.info(`User registered: ${savedUser.email}`);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        profile: savedUser.profile as Record<string, unknown>,
        organizationId: savedUser.organizationId,
        roles: (userWithRelations?.userRoles || []).map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
          permissions: ur.role.permissions as any[],
          hierarchy: ur.role.hierarchy,
          organizationId: ur.role.organizationId,
        })),
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile as Record<string, unknown>,
        organizationId: user.organizationId,
        roles: user.userRoles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
          permissions: ur.role.permissions as any[],
          hierarchy: ur.role.hierarchy,
          organizationId: ur.role.organizationId,
        })),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Check if token exists in database
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord || !tokenRecord.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokenRepository.remove(tokenRecord);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new access token
    const accessToken = this.generateAccessToken(tokenRecord.user);

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token: refreshToken });
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(userId: string): Promise<RefreshToken> {
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
    });

    return await this.refreshTokenRepository.save(refreshToken);
  }

  private async createDefaultRoles(organizationId: string): Promise<void> {
    // Check if roles already exist
    const existingRoles = await this.roleRepository.count({
      where: { organizationId },
    });

    if (existingRoles > 0) {
      return; // Roles already exist
    }

    // Create superadmin role
    const superadminRole = this.roleRepository.create({
      name: 'superadmin',
      permissions: [
        { resource: '*', actions: ['*'] }, // All permissions
      ],
      hierarchy: 100, // Highest hierarchy
      organizationId,
    });
    await this.roleRepository.save(superadminRole);

    // Create responder role
    const responderRole = this.roleRepository.create({
      name: 'responder',
      permissions: [
        { resource: 'tasks', actions: ['read', 'create', 'update'] },
        { resource: 'comments', actions: ['read', 'create'] },
      ],
      hierarchy: 10, // Lower hierarchy
      organizationId,
    });
    await this.roleRepository.save(responderRole);

    this.logger.info(`Default roles created for organization ${organizationId}`);
  }

  async googleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  }): Promise<{ user: any; accessToken: string; refreshToken: string; needsOrganization?: boolean }> {
    // Check if user exists
    let user = await this.userRepository.findOne({
      where: { email: googleUser.email },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      // User doesn't exist, return needsOrganization flag
      return {
        user: {
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          picture: googleUser.picture,
        },
        accessToken: '',
        refreshToken: '',
        needsOrganization: true,
      };
    }

    // User exists, generate tokens and return
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    this.logger.info(`Google login successful: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile as Record<string, unknown>,
        organizationId: user.organizationId,
        roles: user.userRoles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
          permissions: ur.role.permissions as any[],
          hierarchy: ur.role.hierarchy,
          organizationId: ur.role.organizationId,
        })),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken: refreshToken.token,
    };
  }

  async googleSignup(
    googleUser: {
      email: string;
      firstName: string;
      lastName: string;
      picture: string;
    },
    organizationName: string
  ): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Create or get organization
    let organization;
    let isNewOrganization = false;
    if (organizationName) {
      organization = await this.organizationRepository.findOne({
        where: { name: organizationName },
      });
      if (!organization) {
        organization = this.organizationRepository.create({
          name: organizationName,
        });
        organization = await this.organizationRepository.save(organization);
        isNewOrganization = true;
      }
    } else {
      // Create default organization
      organization = this.organizationRepository.create({
        name: `${googleUser.email.split('@')[0]} Organization`,
      });
      organization = await this.organizationRepository.save(organization);
      isNewOrganization = true;
    }

    // Create default roles for organization if it's new
    if (isNewOrganization) {
      await this.createDefaultRoles(organization.id);
    }

    // Check if this is the first user in the organization
    const existingUsers = await this.userRepository.count({
      where: { organizationId: organization.id },
    });
    const isFirstUser = existingUsers === 0;

    // Create user with Google profile info
    const user = this.userRepository.create({
      email: googleUser.email,
      passwordHash: '', // No password for Google OAuth users
      profile: {
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        picture: googleUser.picture,
        provider: 'google',
      },
      organizationId: organization.id,
    });
    const savedUser = await this.userRepository.save(user);

    // Assign role: superadmin if first user, responder otherwise
    const roleName = isFirstUser ? 'superadmin' : 'responder';
    const role = await this.roleRepository.findOne({
      where: { name: roleName, organizationId: organization.id },
    });

    if (role) {
      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleId: role.id,
      });
      await this.userRoleRepository.save(userRole);
    }

    // Load user with relations
    const userWithRelations = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(savedUser);
    const refreshToken = await this.generateRefreshToken(savedUser.id);

    this.logger.info(`Google signup successful: ${savedUser.email}`);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        profile: savedUser.profile as Record<string, unknown>,
        organizationId: savedUser.organizationId,
        roles: (userWithRelations?.userRoles || []).map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
          permissions: ur.role.permissions as any[],
          hierarchy: ur.role.hierarchy,
          organizationId: ur.role.organizationId,
        })),
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
      accessToken,
      refreshToken: refreshToken.token,
    };
  }
}
