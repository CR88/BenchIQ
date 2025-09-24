import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Body,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  findAll(@Request() req, @Query('customerId') customerId?: string) {
    return this.devicesService.findAll(req.user.organizationId, customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.devicesService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateDeviceDto: any) {
    return this.devicesService.update(id, req.user.organizationId, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.devicesService.remove(id, req.user.organizationId);
  }
}