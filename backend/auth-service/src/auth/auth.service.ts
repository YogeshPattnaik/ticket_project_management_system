import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '@task-management/dto';
import { Logger } from '@task-management/utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma?.user.findUnique({
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
      organization = await this.prisma.organization.upsert({
        where: { name: dto.organizationName },
        update: {},
        create: { name: dto.organizationName },
      });
    } else {
      // Create default organization
      organization = await this.prisma.organization.create({
        data: { name: `${dto.email.split('@')[0]} Organization` },
      });
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        organizationId: organization.id,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    this.logger.info(`User registered: ${user.email}`);

    return {
      ...tokens,
      user: this.mapUserToDto(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
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
    const tokens = await this.generateTokens(user.id, user.email);

    this.logger.info(`User logged in: ${user.email}`);

    return {
      ...tokens,
      user: this.mapUserToDto(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token exists in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    // Generate new access token
    const accessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      }
    );

    return { accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private async generateTokens(
    userId: string,
    email: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private mapUserToDto(user: any) {
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

