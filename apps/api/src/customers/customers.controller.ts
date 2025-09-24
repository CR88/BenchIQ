import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Request() req, @Body() createCustomerDto: any) {
    return this.customersService.create(req.user.organizationId, createCustomerDto);
  }

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.customersService.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.customersService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateCustomerDto: any) {
    return this.customersService.update(id, req.user.organizationId, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.customersService.remove(id, req.user.organizationId);
  }

  @Post(':id/devices')
  addDevice(@Param('id') id: string, @Request() req, @Body() createDeviceDto: any) {
    return this.customersService.addDevice(id, req.user.organizationId, createDeviceDto);
  }
}