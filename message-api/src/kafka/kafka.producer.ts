import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Kafka, Message, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  private readonly logger = new Logger(KafkaProducer.name);
  private readonly topic = 'message.created';

  constructor() {
    this.kafka = new Kafka({
      brokers: ['localhost:9092'],
    });
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });
  }

  async send(key: string, value: string): Promise<void> {
    try {
      await this.producer.send({
        topic: this.topic,
        messages: [
          {
            key,
            value,
          },
        ],
      });
      this.logger.log(`Message sent to topic "${this.topic}"`);
    } catch (error) {
      this.logger.error(`Failed to send message to "${this.topic}"`, error);
    }
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.logger.log(`🔗 Kafka producer connected for topic "${this.topic}"`);
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer. Retrying...', error);
      setTimeout(() => this.onModuleInit(), 5000);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log(`Kafka producer disconnected from topic "${this.topic}"`);
  }
}
