import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Messages } from './messages.schema';
import { CreateMessageDto } from './messages.dto';
import { randomUUID } from 'node:crypto';
import { ConversationsService } from '../conversations/conversations.service';
import { PaginationResult } from '../utils/pagination.dto';
import { KafkaProducer } from '../kafka/kafka.producer';
import { UserDetails } from '../users/users.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  constructor(
    @InjectModel('Messages') private readonly messagesModel: Model<Messages>,
    private readonly conversationsService: ConversationsService,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async create(
    dto: CreateMessageDto,
    userDetails: UserDetails,
  ): Promise<Messages> {
    const { conversationId, content, metadata } = dto;
    const conversation =
      await this.conversationsService.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Create and save the new message
    const payload = {
      conversationId,
      senderId: userDetails.userId,
      content,
      metadata,
    };
    const message = await this.messagesModel.create(payload);
    // console.log('🚀 ~ MessagesService ~ message:', message);
    console.log(
      JSON.stringify({
        payload,
        tenantId: userDetails.tenantId,
      }),
    );

    await this.conversationsService.addMessageToConversation(
      conversationId,
      message._id,
    );

    await this.kafkaProducer.send(
      message.id,
      JSON.stringify({
        ...payload,
        tenantId: userDetails.tenantId,
      }),
    );

    return message;
  }

  async findMessagesByConversation(
    conversationId: string,
    page: number = 1,
    limit: number = 30,
  ): Promise<PaginationResult<Messages>> {
    const skip = (page - 1) * limit;

    // Count total messages for pagination metadata
    const total = await this.messagesModel.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
    });

    // Fetch paginated messages
    const messages = await this.messagesModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      total,
      page,
      limit,
      data: messages,
    };
  }
}
