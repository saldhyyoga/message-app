import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenants, TenantsDocument } from './tenants.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenants.name) private tenantsModel: Model<TenantsDocument>,
  ) {}

  async create(tenantDto: any): Promise<Tenants> {
    return await this.tenantsModel.create(tenantDto);
  }

  async findById(id: string): Promise<Tenants> {
    const tenant = await this.tenantsModel.findById(id);

    if (!tenant) {
      throw new NotFoundException('User not found');
    }
    return tenant;
  }
}
