import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService {
  private readonly client: Client;
  private readonly logger = new Logger(ElasticsearchService.name);

  constructor() {
    this.client = new Client({
      node: 'http://localhost:9200',
    });
  }

  async indexMessage(message: unknown): Promise<void> {
    try {
      await this.client.index({
        index: 'message_index',
        document: message,
      });
      this.logger.log('Message indexed successfully');
    } catch (error) {
      this.logger.error('Error indexing message:', error);
    }
  }
}
