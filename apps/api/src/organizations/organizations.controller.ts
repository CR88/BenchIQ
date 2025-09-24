import { Controller, Get, Patch, Body, UseGuards, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateOrganizationRequest, Organization } from '@benchiq/types';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current organization' })
  @ApiResponse({ status: 200, description: 'Organization retrieved successfully' })
  async getCurrentOrganization(@CurrentUser() user: any): Promise<Organization> {
    return this.organizationsService.findById(user.organizationId);
  }

  @Patch('current')
  @ApiOperation({ summary: 'Update current organization' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  async updateCurrentOrganization(
    @CurrentUser() user: any,
    @Body() updateData: UpdateOrganizationRequest,
  ): Promise<Organization> {
    return this.organizationsService.update(user.organizationId, updateData);
  }

  @Post('current/logo')
  @ApiOperation({ summary: 'Upload organization logo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ logoUrl: string }> {
    return this.organizationsService.uploadLogo(user.organizationId, file);
  }
}