import { Controller, Get, Logger } from '@nestjs/common';
import { AiService } from './ai/ai.service.js';
import { MilvusService } from './milvus/milvus.service.js';
import { SkipResponseWrap } from './common/http/skip-response-wrap.decorator.js';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly aiService: AiService,
    private readonly milvusService: MilvusService,
  ) {}

  @Get('test-insert')
  async testInsert() {
    const text = '巢智 (NestOwl) 是一个基于 AI 的开源知识库系统，使用 NestJS 和 Milvus 构建。';
    //转向量
    const vector = await this.aiService.getEmbedding(text);
    //建表
    await this.milvusService.createCollection(1024);
    //加载集合
    await this.milvusService.loadCollection();
    //插入数据
    await this.milvusService.insertData(vector, text);

    return {
      status: 'success',
      message: '数据已成功向量化并存入 Milvus！',
      vector_length: vector.length,
    };
  }

  @Get('test-search')
  async testSearch() {
    const question = 'NestOwl 是用什么技术构建的？';
    const questionVector = await this.aiService.getEmbedding(question);
    const searchRes = await this.milvusService.search(questionVector, 1);
    let context = '未找到相关资料';
    if (searchRes.results && searchRes.results.length > 0) {
      context = searchRes.results[0].content;
    }
    return {
      question,
      retrieved_context: context, // 把从数据库里挖出来的原始资料展示出来
    };
  }
}
