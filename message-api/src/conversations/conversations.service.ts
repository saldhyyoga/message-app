import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversations } from './conversations.schema';
import { Messages } from '../messages/messages.schema';
import { MessagesService } from '../messages/messages.service';
import { PaginationResult } from '../utils/pagination.dto';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel('Conversations')
    private readonly conversationsModel: Model<Conversations>,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(): Promise<Conversations> {
    const createdConversation = await this.conversationsModel.create({});
    this.logger.log('Conversation created:', createdConversation);

    return createdConversation;
  }

  async findById(id: string): Promise<Conversations> {
    return await this.conversationsModel.findById(id);
  }

  async addMessageToConversation(
    conversationId: string,
    messageId: Types.ObjectId,
  ): Promise<void> {
    await this.conversationsModel.findByIdAndUpdate(conversationId, {
      $push: { messages: messageId },
    });
  }

  async getMessages(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<PaginationResult<Messages>> {
    // Ensure the conversation exists
    const conversation = await this.conversationsModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Retrieve messages for this conversation
    return this.messagesService.findMessagesByConversation(
      conversationId,
      page,
      limit,
    );
  }

  async searchMessages(
    conversationId: string,
    search: string,
  ): Promise<Messages[]> {
    return await this.elasticsearchService.searchMessages(
      conversationId,
      search,
    );
  }
}
