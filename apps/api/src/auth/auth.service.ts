import { Injectable, UnauthorizedException, ConflictException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '@benchiq/types';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => OrganizationsService))
    private organizationsService: OrganizationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
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

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const organization = await this.organizationsService.findById(user.organizationId);

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
        features: this.getOrganizationFeatures(organization.plan),
      },
    };
  }

  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerRequest.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create organization first
    const organization = await this.organizationsService.create({
      name: registerRequest.organizationName,
    });

    // Hash password
    const passwordHash = await bcrypt.hash(registerRequest.password, 10);

    // Create user
    const user = await this.usersService.create({
      email: registerRequest.email,
      firstName: registerRequest.firstName,
      lastName: registerRequest.lastName,
      password: registerRequest.password, // This will be hashed in the service
      role: 'OWNER',
    }, organization.id);

    // Generate tokens
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
        features: this.getOrganizationFeatures(organization.plan),
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
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

  private getOrganizationFeatures(plan: string): string[] {
    const features = ['customers', 'tickets', 'inventory', 'estimates', 'invoices'];

    if (plan === 'PRO') {
      features.push(
        'multi-user',
        'dashboards',
        'reporting',
        'customer-map',
        'scheduling',
        'pos',
        'automations',
        'payments',
        'priority-support'
      );
    }

    return features;
  }
}