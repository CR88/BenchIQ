import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'SUPER_ADMIN';
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Single admin user for system management
const adminUser: AdminUser = {
  id: 'admin-1',
  email: 'stevena184@gmail.com',
  passwordHash: '$2b$10$PWv3DjqwJ36kjdVf3cmZTuVo3NpyucX1ngfU40iiLcALuRveMmE06', // TempPass2024!
  role: 'SUPER_ADMIN',
  firstName: 'Steven',
  lastName: 'Admin',
  createdAt: new Date('2024-01-01'),
};

@Injectable()
export class AdminAuthService {
  constructor(private jwtService: JwtService) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    if (email !== adminUser.email) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    adminUser.lastLoginAt = new Date();

    const { passwordHash, ...result } = adminUser;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      type: 'admin'
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (userId !== adminUser.id) {
      throw new UnauthorizedException('Admin not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    adminUser.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  }

  async getProfile(userId: string): Promise<any> {
    if (userId !== adminUser.id) {
      throw new UnauthorizedException('Admin not found');
    }

    const { passwordHash, ...profile } = adminUser;
    return profile;
  }
}