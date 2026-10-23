import { Module } from '@nestjs/common';
import { MilvusService } from './milvus.service.js';

@Module({
  providers: [MilvusService],
  exports: [MilvusService],
})
export class MilvusModule {}
