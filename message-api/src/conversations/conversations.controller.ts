import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Conversations } from './conversations.schema';
import { Messages } from '../messages/messages.schema';
import { PaginationResult } from 'src/utils/pagination.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(): Promise<Conversations> {
    return this.conversationsService.create();
  }

  @Get(':conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PaginationResult<Messages>> {
    return this.conversationsService.getMessages(conversationId, page, limit);
  }

  @Get(':conversationId/messages/search')
  async searchMessages(
    @Param('conversationId') conversationId: string,
    @Query('q') searchTerm: string,
  ): Promise<Messages[]> {
    return this.conversationsService.searchMessages(conversationId, searchTerm);
  }
}
