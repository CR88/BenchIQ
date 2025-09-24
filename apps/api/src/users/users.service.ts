import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserRequest, UpdateUserRequest, User, UserProfile } from '@benchiq/types';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createData: CreateUserRequest, organizationId: string): Promise<PrismaUser> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createData.email,
        passwordHash,
        firstName: createData.firstName,
        lastName: createData.lastName,
        role: createData.role || 'VIEWER',
        organizationId,
        contact: createData.contact,
        preferences: createData.preferences || {
          theme: 'system',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
      },
    });

    return user;
  }

  async findAll(organizationId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return users as User[];
  }

  async findById(id: string): Promise<PrismaUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<PrismaUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async update(id: string, updateData: UpdateUserRequest): Promise<User> {
    const existingUser = await this.findById(id);

    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: updateData.email,
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        role: updateData.role,
        status: updateData.status,
        contact: updateData.contact,
        preferences: updateData.preferences,
      },
    });

    return user as User;
  }

  async updateProfile(id: string, updateData: Partial<UserProfile>): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateData.firstName,
        lastName: updateData.lastName,
        contact: updateData.contact,
        preferences: updateData.preferences,
      },
    });

    const { organizationId, ...userProfile } = user;
    return userProfile as UserProfile;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(id);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return user as User;
  }

  async activate(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return user as User;
  }

  async getActiveUserCount(organizationId: string): Promise<number> {
    return this.prisma.user.count({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
    });
  }
}