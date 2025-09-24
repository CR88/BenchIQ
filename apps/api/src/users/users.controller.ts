import { Controller, Get, Post, Patch, Body, Param, UseGuards, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserRequest, UpdateUserRequest, User, UserProfile, ChangePasswordRequest } from '@benchiq/types';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => OrganizationsService))
    private organizationsService: OrganizationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users in organization' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@CurrentUser() user: any): Promise<User[]> {
    return this.usersService.findAll(user.organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'User limit exceeded' })
  async create(
    @CurrentUser() user: any,
    @Body() createData: CreateUserRequest,
  ): Promise<User> {
    // Check if user has permission to create users (OWNER or ADMIN)
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions to create users');
    }

    // Check user limit for free plan
    const canAddUser = await this.organizationsService.checkUserLimit(user.organizationId);
    if (!canAddUser) {
      throw new ForbiddenException('User limit exceeded. Upgrade to Pro plan for unlimited users.');
    }

    const newUser = await this.usersService.create(createData, user.organizationId);
    const { passwordHash, ...userResponse } = newUser;
    return userResponse as any;
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser() user: any): Promise<UserProfile> {
    const fullUser = await this.usersService.findById(user.userId);
    const { organizationId, passwordHash, ...userProfile } = fullUser;
    return userProfile as UserProfile;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    return this.usersService.updateProfile(user.userId, updateData);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 403, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordData: ChangePasswordRequest,
  ): Promise<{ message: string }> {
    await this.usersService.changePassword(
      user.userId,
      changePasswordData.currentPassword,
      changePasswordData.newPassword,
    );

    return { message: 'Password changed successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string): Promise<User> {
    const targetUser = await this.usersService.findById(id);

    // Check if user belongs to same organization
    if (targetUser.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    const { passwordHash, ...userResponse } = targetUser;
    return userResponse as any;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateData: UpdateUserRequest,
  ): Promise<User> {
    // Check if user has permission to update users (OWNER or ADMIN)
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions to update users');
    }

    const targetUser = await this.usersService.findById(id);

    // Check if user belongs to same organization
    if (targetUser.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    return this.usersService.update(id, updateData);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  async deactivate(@CurrentUser() user: any, @Param('id') id: string): Promise<User> {
    // Check if user has permission (OWNER or ADMIN)
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions to deactivate users');
    }

    const targetUser = await this.usersService.findById(id);

    // Check if user belongs to same organization
    if (targetUser.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    // Prevent deactivating self
    if (targetUser.id === user.userId) {
      throw new ForbiddenException('Cannot deactivate yourself');
    }

    return this.usersService.deactivate(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activate(@CurrentUser() user: any, @Param('id') id: string): Promise<User> {
    // Check if user has permission (OWNER or ADMIN)
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions to activate users');
    }

    const targetUser = await this.usersService.findById(id);

    // Check if user belongs to same organization
    if (targetUser.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    // Check user limit for free plan
    const canAddUser = await this.organizationsService.checkUserLimit(user.organizationId);
    if (!canAddUser) {
      throw new ForbiddenException('User limit exceeded. Upgrade to Pro plan for unlimited users.');
    }

    return this.usersService.activate(id);
  }
}