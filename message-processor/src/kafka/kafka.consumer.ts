import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;

  constructor(private readonly elasticsearchService: ElasticsearchService) {
    this.kafka = new Kafka({
      brokers: ['localhost:9092'],
    });

    this.consumer = this.kafka.consumer({ groupId: 'message-processor' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'message.created',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const data = message.value?.toString();
        console.log(`Received message: ${data}`);
        console.log('typeof', typeof data);

        if (data) {
          const parsedMessage = JSON.parse(data);
          await this.elasticsearchService.indexMessage(parsedMessage);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
