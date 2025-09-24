import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthMockService } from './auth-mock.service';
import { LoginRequest, RegisterRequest, RefreshTokenRequest, AuthResponse } from '@benchiq/types';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthMockController {
  constructor(private authService: AuthMockService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login (Mock)' })
  @ApiBody({ type: Object, description: 'Login credentials' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginRequest: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(loginRequest);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration (Mock)' })
  @ApiBody({ type: Object, description: 'Registration data' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerRequest: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(registerRequest);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token (Mock)' })
  @ApiBody({ type: Object, description: 'Refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshRequest: RefreshTokenRequest): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(refreshRequest.refreshToken);
  }

  @Post('complete-setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete first-time account setup' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', minLength: 8 },
        country: { type: 'string' }
      },
      required: ['password']
    }
  })
  @ApiResponse({ status: 200, description: 'Setup completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or setup already completed' })
  async completeSetup(
    @Request() req: any,
    @Body() setupData: { password: string; country?: string }
  ): Promise<{ success: boolean; message: string }> {
    return this.authService.completeFirstTimeSetup(req.user.userId, setupData);
  }
}