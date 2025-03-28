import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';

@Module({
  imports: [KafkaModule, ElasticsearchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
