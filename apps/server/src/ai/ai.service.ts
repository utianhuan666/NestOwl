import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import Response from 'express';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.EMBEDDING_API_KEY,
      baseURL: process.env.EMBEDDING_BASE_URL,
    });
  }

  //向量转文字
  async getEmbedding(text: string) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'Qwen3-Embedding-0.6B',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ 向量化失败，请检查模型是否支持 Embedding:', error);
      throw error;
    } finally {
    }
  }
}
