import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { connection, Connection, Types } from 'mongoose';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './messages.dto';
import { AppModule } from '../app.module';
import * as request from 'supertest'; // Use supertest for HTTP requests
import { ConversationsService } from '../conversations/conversations.service';
import { KafkaProducer } from '../kafka/kafka.producer';

describe('MessagesController (Integration)', () => {
  let app: INestApplication;
  let dbConnection: Connection;
  let controller: MessagesController;
  let messagesService: MessagesService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleRef.createNestApplication();
    await app.init();

    console.log('App initialized!');

    controller = app.get<MessagesController>(MessagesController);
    messagesService = app.get<MessagesService>(MessagesService);

    const dbUri =
      'mongodb://root:password@localhost:27017/messageapp?authSource=admin';

    await connection.openUri(dbUri); // Connect to MongoDB
    dbConnection = connection;
  }, 50000);

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  }, 20000);

  describe('POST /messages', () => {
    it('should create a new message successfully', async () => {
      const newConversation = {
        participants: ['1234', '5678'],
        title: 'Test Conversation',
      };

      // Create a new conversation using the ConversationsService
      const conversationResponse = await request(app.getHttpServer())
        .post('/conversations')
        .send()
        .expect(201);

      const createdConversation = conversationResponse.body;

      const createMessageDto: CreateMessageDto = {
        conversationId: createdConversation.id,
        content: 'Test message content',
        metadata: { someKey: 'someValue' },
      };

      const conversationsService = app.get(ConversationsService);
      const kafkaProducer = app.get(KafkaProducer);

      // Use supertest to send HTTP request
      const response = await request(app.getHttpServer()) // Get the HTTP server instance
        .post('/messages')
        .send(createMessageDto)
        .expect(201);

      // Assertions
      expect(response.body).toMatchObject({
        conversationId: createMessageDto.conversationId,
        content: createMessageDto.content,
        metadata: createMessageDto.metadata,
      });
    });

    it('should throw NotFoundException if conversation is not found', async () => {
      const createMessageDto: CreateMessageDto = {
        conversationId: new Types.ObjectId().toString(),
        content: 'Test message content',
        metadata: { someKey: 'someValue' },
      };

      const response = await request(app.getHttpServer())
        .post('/messages')
        .send(createMessageDto);

      expect(response.body.statusCode).toEqual(404);
    });
  });
});
