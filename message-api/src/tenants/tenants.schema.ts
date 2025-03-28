import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tenants {
  @Prop({ required: true, unique: true })
  name: string;
}

export type TenantsDocument = Tenants & Document;
export const TenantsSchema = SchemaFactory.createForClass(Tenants);
