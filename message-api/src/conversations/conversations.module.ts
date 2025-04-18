import { forwardRef, Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSchema } from './conversations.schema';
import { MessagesModule } from '../messages/messages.module';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Conversations', schema: ConversationSchema },
    ]),
    forwardRef(() => MessagesModule),
    ElasticsearchModule,
    AuthModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
