import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { MilvusService } from '../milvus/milvus.service.js';
import { ChatDto } from './dto/chat.dto.js';

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
    const contexts = await this.milvusService.search(questionVector,3);
    const mergedContext = contexts.join('\n\n---\n\n')
    const answer = await this.aiService.ragChat(question,mergedContext)
    return {
        question,
        answer,
        sourceChunks: contexts,
    }
  }
}
