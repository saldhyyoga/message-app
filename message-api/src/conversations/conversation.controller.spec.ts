import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { connection, Connection } from 'mongoose';
import { AppModule } from '../app.module';
import * as request from 'supertest';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';

describe('MessagesController (Integration)', () => {
  let app: INestApplication;
  let dbConnection: Connection;
  let controller: ConversationsController;
  let conversationsService: ConversationsService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleRef.createNestApplication();
    await app.init();

    console.log('App initialized!');

    controller = app.get<ConversationsController>(ConversationsController);
    conversationsService = app.get<ConversationsService>(ConversationsService);

    const dbUri =
      'mongodb://root:password@localhost:27017/messageapp?authSource=admin';

    await connection.openUri(dbUri); // Connect to MongoDB
    dbConnection = connection;
  }, 50000);

  afterAll(async () => {
    await dbConnection.close();
    await app.close();
  }, 20000);

  describe('POST /conversations', () => {
    it('should create a new conversations successfully', async () => {
      // Create a new conversation using the ConversationsService
      const conversationResponse = await request(app.getHttpServer())
        .post('/conversations')
        .expect(201);
    });
  });
});
