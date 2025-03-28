import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversations } from './conversations.schema';
import { MessagesService } from '../messages/messages.service';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { NotFoundException } from '@nestjs/common';

describe('ConversationsService (Unit)', () => {
  let service: ConversationsService;
  let conversationsModel: Model<Conversations>;

  // Mocking the MessagesService and ElasticsearchService
  const messagesServiceMock = {
    findMessagesByConversation: jest.fn(),
  };

  const elasticsearchServiceMock = {
    searchMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: getModelToken('Conversations'),
          useValue: {
            // Mocking the Mongoose model methods
            create: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: MessagesService,
          useValue: messagesServiceMock,
        },
        {
          provide: ElasticsearchService,
          useValue: elasticsearchServiceMock,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    conversationsModel = module.get<Model<Conversations>>(
      getModelToken('Conversations'),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a conversation', async () => {
    const createdConversation = { _id: '123', messages: [] };

    // Mocking the 'create' method to return a mock conversation
    conversationsModel.create = jest
      .fn()
      .mockResolvedValue(createdConversation);

    const result = await service.create();

    expect(conversationsModel.create).toHaveBeenCalled();
    expect(result).toEqual(createdConversation);
  });

  it('should find a conversation by id', async () => {
    const conversationId = '123';
    const foundConversation = { _id: conversationId, messages: [] };

    // Mocking 'findById' to return a found conversation
    conversationsModel.findById = jest
      .fn()
      .mockResolvedValue(foundConversation);

    const result = await service.findById(conversationId);

    expect(conversationsModel.findById).toHaveBeenCalledWith(conversationId);
    expect(result).toEqual(foundConversation);
  });

  it('should throw NotFoundException if conversation not found when retrieving messages', async () => {
    const conversationId = '123';
    const page = 1;
    const limit = 10;

    // Mocking 'findById' to return null
    conversationsModel.findById = jest.fn().mockResolvedValue(null);

    // Check if the error is thrown
    await expect(
      service.getMessages(conversationId, page, limit),
    ).rejects.toThrow(NotFoundException);
  });

  it('should add a message to a conversation', async () => {
    const conversationId = '67e565246aeaefeda9bb3356';
    const messageId = new Types.ObjectId();

    // Mocking 'findByIdAndUpdate' to simulate adding a message
    conversationsModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      _id: conversationId,
      messages: [messageId],
    });

    await service.addMessageToConversation(conversationId, messageId);

    expect(conversationsModel.findByIdAndUpdate).toHaveBeenCalledWith(
      conversationId,
      { $push: { messages: messageId } },
    );
  });

  it('should get messages for a conversation', async () => {
    const conversationId = '67e565246aeaefeda9bb3356';
    const page = 1;
    const limit = 10;
    const messages = [
      { _id: '1', text: 'Hello' },
      { _id: '2', text: 'World' },
    ];
    const mockConversation = { _id: conversationId, messages: [] };

    // Mocking 'findById' to return a valid conversation
    conversationsModel.findById = jest.fn().mockResolvedValue(mockConversation);

    // Mocking 'findMessagesByConversation' method
    messagesServiceMock.findMessagesByConversation = jest
      .fn()
      .mockResolvedValue({
        data: messages,
        totalCount: 2,
      });

    const result = await service.getMessages(conversationId, page, limit);

    expect(conversationsModel.findById).toHaveBeenCalledWith(conversationId);
    expect(messagesServiceMock.findMessagesByConversation).toHaveBeenCalledWith(
      conversationId,
      page,
      limit,
    );
    expect(result.data).toEqual(messages);
  });

  it('should throw NotFoundException if conversation not found when retrieving messages', async () => {
    const conversationId = '123';
    const page = 1;
    const limit = 10;

    // Mocking 'findById' to return null
    conversationsModel.findById = jest.fn().mockResolvedValue(null);

    await expect(
      service.getMessages(conversationId, page, limit),
    ).rejects.toThrow(NotFoundException);
  });

  it('should search messages for a conversation', async () => {
    const conversationId = '67e565246aeaefeda9bb3356';
    const search = 'test search';
    const searchResults = [
      { _id: '1', text: 'Test message' },
      { _id: '2', text: 'Another test message' },
    ];

    // Mocking 'searchMessages' from ElasticsearchService
    elasticsearchServiceMock.searchMessages = jest
      .fn()
      .mockResolvedValue(searchResults);

    const result = await service.searchMessages(conversationId, search);

    expect(elasticsearchServiceMock.searchMessages).toHaveBeenCalledWith(
      conversationId,
      search,
    );
    expect(result).toEqual(searchResults);
  });
});
