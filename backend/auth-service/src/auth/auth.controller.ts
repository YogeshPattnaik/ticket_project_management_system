import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from '@task-management/dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
    console.log('🔧 AuthController initialized');
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck() {
    console.log('🏥 Health check endpoint hit');
    return { status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 401, description: 'User already exists' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    console.log('========================================');
    console.log('🎯 AUTH CONTROLLER: Register endpoint HIT!');
    console.log('📥 Register DTO received:', JSON.stringify(dto, null, 2));
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('========================================');
    try {
      const result = await this.authService.register(dto);
      console.log('✅ Register successful, returning response');
      return result;
    } catch (error) {
      console.error('❌ Register failed:', error);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body('refreshToken') refreshToken: string
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    return this.authService.logout(refreshToken);
  }
}

