import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Messages } from './messages.schema';
import { ConversationsService } from '../conversations/conversations.service';
import { KafkaProducer } from '../kafka/kafka.producer';
import { NotFoundException } from '@nestjs/common';

describe('MessagesService (Unit)', () => {
  let service: MessagesService;
  let messagesModel: Model<Messages>;
  let conversationsService: ConversationsService;
  let kafkaProducer: KafkaProducer;

  const mockMessage = {
    _id: new Types.ObjectId('67e60af44c4c6b28c88293d8'), // Ensure it's a valid ObjectId
    conversationId: '67e60af44c4c6b28c88293d9',
    senderId: 'random-sender-id',
    content: 'Test message',
    metadata: {},
  };

  const mockMessageModel = {
    create: jest.fn().mockResolvedValue(mockMessage),
    countDocuments: jest.fn().mockResolvedValue(1),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockMessage]),
  };

  const mockConversationsService = {
    findById: jest.fn().mockResolvedValue({ _id: mockMessage.conversationId }),
    addMessageToConversation: jest.fn().mockResolvedValue(null),
  };

  const mockKafkaProducer = {
    send: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getModelToken('Messages'),
          useValue: mockMessageModel,
        },
        {
          provide: ConversationsService,
          useValue: mockConversationsService,
        },
        {
          provide: KafkaProducer,
          useValue: mockKafkaProducer,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messagesModel = module.get<Model<Messages>>(getModelToken('Messages'));
    conversationsService =
      module.get<ConversationsService>(ConversationsService);
    kafkaProducer = module.get<KafkaProducer>(KafkaProducer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a message', async () => {
    const dto = {
      conversationId: mockMessage.conversationId.toString(),
      content: 'Test message',
      metadata: {},
    };
    const result = await service.create(dto);
    expect(conversationsService.findById).toHaveBeenCalledWith(
      dto.conversationId,
    );
    expect(result).toEqual(mockMessage);
    expect(messagesModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: expect.any(Types.ObjectId),
        content: dto.content,
      }),
    );
    expect(conversationsService.addMessageToConversation).toHaveBeenCalledWith(
      dto.conversationId,
      mockMessage._id,
    );

    console.log('Kafka send arguments:', mockKafkaProducer.send.mock.calls);

    expect(kafkaProducer.send).toHaveBeenCalledWith(
      result.id,
      JSON.stringify(mockMessage),
    );
  });
});
