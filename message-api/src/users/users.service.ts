import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersDocument, Users } from './users.schema';
import { TenantsService } from '../tenants/tenants.service';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<UsersDocument>,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(userDto: CreateUserDto): Promise<Users> {
    const checkTenant = await this.tenantsService.findById(userDto.tenantId);
    if (!checkTenant) throw new NotFoundException('Tenant Not found');
    const user = new this.userModel(userDto);
    return user.save();
  }

  async findByUsername(username: string): Promise<Users> {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
