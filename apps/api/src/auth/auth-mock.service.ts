import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginRequest, RegisterRequest, AuthResponse } from '@benchiq/types';
import { MockDataService } from '../shared/mock-data.service';

@Injectable()
export class AuthMockService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private mockDataService: MockDataService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.mockDataService.getUserByEmail(email);
    if (!user) return null;

    // Check if user has a temporary password (first-time login)
    if (user.temporaryPassword && user.firstTimeLogin) {
      if (password === user.temporaryPassword) {
        const { passwordHash, ...result } = user;
        return result;
      }
      return null;
    }

    // Regular password validation
    if (await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    const user = await this.validateUser(loginRequest.email, loginRequest.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE' && user.status !== 'PENDING_SETUP') {
      throw new UnauthorizedException('Account is not active');
    }

    const organization = this.mockDataService.getOrganizationById(user.organizationId);

    const payload = {
      email: user.email,
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        plan: organization.plan,
        activeUserLimit: organization.activeUserLimit,
        features: organization.features,
        country: organization.country,
      },
      requiresSetup: user.firstTimeLogin || false,
    };
  }

  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = this.mockDataService.getUserByEmail(registerRequest.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new organization
    const newOrgId = this.mockDataService.getNextOrganizationId();
    const now = new Date();
    const newOrg = {
      id: newOrgId,
      name: registerRequest.organizationName,
      plan: 'FREE' as const,
      status: 'ACTIVE' as const,
      activeUserLimit: 1,
      features: this.mockDataService.getFeaturesForPlan('FREE'),
      billingEmail: registerRequest.email,
      country: registerRequest.country,
      createdAt: now,
      updatedAt: now,
      monthlyRevenue: 0,
      userCount: 1,
      ticketCount: 0,
      storageUsed: 0,
    };
    this.mockDataService.addOrganization(newOrg);

    // Hash password
    const passwordHash = await bcrypt.hash(registerRequest.password, 10);

    // Create new user
    const newUserId = this.mockDataService.getNextUserId();
    const newUser = {
      id: newUserId,
      email: registerRequest.email,
      passwordHash,
      firstName: registerRequest.firstName,
      lastName: registerRequest.lastName,
      role: 'OWNER' as const,
      status: 'ACTIVE' as const,
      organizationId: newOrgId,
      createdAt: now,
    };
    this.mockDataService.addUser(newUser);

    // Generate tokens
    const payload = {
      email: newUser.email,
      sub: newUser.id,
      organizationId: newUser.organizationId,
      role: newUser.role
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: newUser.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }
    );

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return {
      accessToken,
      refreshToken,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        firstName: userWithoutPassword.firstName,
        lastName: userWithoutPassword.lastName,
        role: userWithoutPassword.role,
        organizationId: userWithoutPassword.organizationId,
      },
      organization: {
        id: newOrg.id,
        name: newOrg.name,
        plan: newOrg.plan,
        activeUserLimit: newOrg.activeUserLimit,
        features: newOrg.features,
        country: newOrg.country,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = this.mockDataService.getUserById(payload.sub);
      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        email: user.email,
        sub: user.id,
        organizationId: user.organizationId,
        role: user.role
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async completeFirstTimeSetup(userId: string, setupData: {
    password: string;
    country?: string;
  }): Promise<{ success: boolean; message: string }> {
    const user = this.mockDataService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.firstTimeLogin) {
      throw new UnauthorizedException('Setup already completed');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(setupData.password, 10);

    // Update user
    this.mockDataService.updateUser(userId, {
      passwordHash,
      status: 'ACTIVE',
      firstTimeLogin: false,
      temporaryPassword: undefined,
    });

    // Update organization country if provided
    if (setupData.country) {
      this.mockDataService.updateOrganization(user.organizationId, {
        country: setupData.country,
      });
    }

    return {
      success: true,
      message: 'Account setup completed successfully',
    };
  }

}