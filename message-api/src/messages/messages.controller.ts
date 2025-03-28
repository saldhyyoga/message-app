import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './messages.dto';
import { Messages } from './messages.schema';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserDetails } from 'src/users/users.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: Request,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Messages> {
    const userDetails: UserDetails = req['user'];
    return this.messagesService.create(createMessageDto, userDetails);
  }
}
