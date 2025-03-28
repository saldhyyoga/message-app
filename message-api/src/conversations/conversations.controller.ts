import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { Conversations } from './conversations.schema';
import { Messages } from '../messages/messages.schema';
import { PaginationResult } from 'src/utils/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserDetails } from '../users/users.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(): Promise<Conversations> {
    return this.conversationsService.create();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/messages')
  async getMessages(
    @Req() req: Request,
    @Param('conversationId') conversationId: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<PaginationResult<Messages>> {
    const userDetails: UserDetails = req['user'];
    return this.conversationsService.getMessages(
      conversationId,
      page,
      limit,
      userDetails,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/messages/search')
  async searchMessages(
    @Req() req: Request,
    @Param('conversationId') conversationId: string,
    @Query('q') searchTerm: string,
  ): Promise<Messages[]> {
    const userDetails: UserDetails = req['user'];
    return this.conversationsService.searchMessages(
      conversationId,
      searchTerm,
      userDetails,
    );
  }
}
