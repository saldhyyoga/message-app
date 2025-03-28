import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
};

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
