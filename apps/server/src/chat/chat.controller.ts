import { Body, Controller, Post, Res } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { MilvusService } from '../milvus/milvus.service.js';
import { ChatDto } from './dto/chat.dto.js';
import type { Response } from 'express';
@Controller('chat')
export class ChatController {
  constructor(
    private readonly aiService: AiService,
    private readonly milvusService: MilvusService,
  ) {}

  @Post()
  async ask(@Body() chatDto: ChatDto) {
    const { question } = chatDto;
    const questionVector = await this.aiService.getEmbedding(question);
    const contexts = await this.milvusService.search(questionVector, 3);
    const mergedContext = contexts.join('\n\n---\n\n');
    const answer = await this.aiService.ragChat(question, mergedContext);
    return {
      question,
      answer,
      sourceChunks: contexts,
    };
  }

  @Post('stream')
  async stream(@Body() chatDto: ChatDto, @Res() res: Response) {
    const { question } = chatDto;

    //检索上下文
    const questionVector = await this.aiService.getEmbedding(question);
    const contexts = await this.milvusService.search(questionVector, 3);
    const mergedContext = contexts.length > 0 ? contexts.join('\n\n---\n\n') : '未找到相关资料';

    //设置SSE响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.aiService.ragChatStream(question, mergedContext);

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          res.write(`data: ${text.trim()}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (err) {
      console.error('流式生成失败', err);
      res.write(`data: 抱歉，服务器出错了。\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
}
