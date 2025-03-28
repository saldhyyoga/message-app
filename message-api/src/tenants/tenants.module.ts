import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenants, TenantsSchema } from './tenants.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenants.name, schema: TenantsSchema }]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
