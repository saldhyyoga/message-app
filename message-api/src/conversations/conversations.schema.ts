import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Messages } from '../messages/messages.schema';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Conversations {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Messages' }] })
  messages: Messages[];

  get id(): string {
    return this.id.toString();
  }
}

export const ConversationSchema = SchemaFactory.createForClass(Conversations);

ConversationSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});
