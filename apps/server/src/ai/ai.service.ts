import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private embeddingClient: OpenAI;
  private chatClient: OpenAI;

  constructor() {
    this.embeddingClient = new OpenAI({
      apiKey: process.env.EMBEDDING_API_KEY,
      baseURL: process.env.EMBEDDING_BASE_URL,
    });
    this.chatClient = new OpenAI({
      apiKey: process.env.CHAT_API_KEY,
      baseURL: process.env.CHAT_BASE_URL,
    });
  }

  //向量转文字
  async getEmbedding(text: string) {
    try {
      const response = await this.embeddingClient.embeddings.create({
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

  async ragChat(question: string, context: string) {
    this.logger.log(`question: ${question}`);
    const systemPrompt = `你是一个专业的知识库助手。请严格根据以下参考资料回答用户的问题。如果资料中没有答案，请直接说“不知道”，不要瞎编。\n\n参考资料：\n${context}`;
    const response = await this.chatClient.chat.completions.create({
      model: process.env.CHAT_MODEL_NAME as string,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
    });
    return response.choices[0].message.content || '';
  }
}
