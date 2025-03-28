import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Messages & Document;

@Schema({ timestamps: true })
export class Messages {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Conversations',
    index: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;

  @Prop({ required: true })
  tenantId: string;

  get id(): string {
    return this.id.toString();
  }
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);

MessagesSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});
