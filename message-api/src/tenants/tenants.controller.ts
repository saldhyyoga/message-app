import { Controller, Post, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './tenants.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantsService) {}

  // assuming this is for admin to create tenant
  @Post()
  async create(@Body() tenantDto: CreateTenantDto) {
    return this.tenantService.create(tenantDto);
  }
}
