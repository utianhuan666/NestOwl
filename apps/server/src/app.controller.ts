import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AiService } from './ai/ai.service.js';
import { MilvusService } from './milvus/milvus.service.js';
import * as officeParser from 'officeparser';
import { SkipResponseWrap } from './common/http/skip-response-wrap.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { splitText } from './common/text-splitter.js';

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
    if (searchRes && searchRes.length > 0) {
      context = searchRes[0];
    }

    const answer = await this.aiService.ragChat(question, context);

    return {
      question,
      retrieved_context: context, // 把从数据库里挖出来的原始资料展示出来
      answer,
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    this.logger.log(`📄 接收到文件: ${file.originalname}，正在解析...`);
    try {
      //1.解析文件
      const ast = await officeParser.parseOffice(file.buffer);
      const { value: text }: { value: string } = await ast.to('text');

      if (!text || text.trim().length === 0) {
        throw new BadRequestException('文件内容为空');
      }

      //2.文本切块
      const chunks = splitText(text, 500, 50);
      this.logger.log(`✂️ 切分为 ${chunks.length} 个片段`);

      //3.初始化Milvus集合
      await this.milvusService.createCollection(1024);
      await this.milvusService.loadCollection();

      //4.循环入库
      let successCount = 0;
      for (const chunk of chunks) {
        const vector = await this.aiService.getEmbedding(chunk);
        await this.milvusService.insertData(vector, chunk);
        successCount++;
      }

      return {
        filename: file.originalname,
        chunksCount: successCount,
      };

    } catch (err) {
      this.logger.error('❌ 文件解析失败', err);
      throw new BadRequestException('文件处理失败');
    }
  }
}
