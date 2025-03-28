import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { Messages } from '../messages/messages.schema';
import { UserDetails } from '../users/users.dto';

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

  async searchMessages(
    conversationId: string,
    search: string,
    userDetails: UserDetails,
  ): Promise<Messages[]> {
    try {
      const messages = await this.client.search({
        index: 'message_index',
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    senderId: {
                      value: userDetails.userId,
                    },
                  },
                },
                {
                  term: {
                    tenantId: {
                      value: userDetails.tenantId,
                    },
                  },
                },
                {
                  term: {
                    conversationId: {
                      value: conversationId,
                    },
                  },
                },
                {
                  wildcard: {
                    content: {
                      value: `*${search}*`,
                      case_insensitive: true,
                    },
                  },
                },
              ],
            },
          },
        },
      });

      // map the result to extract only the content (message) from each message object
      const result = messages.hits.hits.map(
        (message: ElasticsearchMessage) => message._source,
      );

      return result as unknown as Messages[];
    } catch (error) {
      this.logger.error('Error searching messages:', error);
      throw error;
    }
  }
}
