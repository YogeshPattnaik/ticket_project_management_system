import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
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
    if (dto.organizationName) {
      organization = await this.organizationRepository.findOne({
        where: { name: dto.organizationName },
      });
      if (!organization) {
        organization = this.organizationRepository.create({
          name: dto.organizationName,
        });
        organization = await this.organizationRepository.save(organization);
      }
    } else {
      // Create default organization
      organization = this.organizationRepository.create({
        name: `${dto.email.split('@')[0]} Organization`,
      });
      organization = await this.organizationRepository.save(organization);
    }

    // Create user
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      profile: {},
      organizationId: organization.id,
    });
    const savedUser = await this.userRepository.save(user);

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
}
