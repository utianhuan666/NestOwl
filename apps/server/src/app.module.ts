import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AllExceptionsFilter } from './common/http/all-exceptions.filter.js';
import { ResponseWrapInterceptor } from './common/http/response-wrap.interceptor.js';
import { MilvusModule } from './milvus/milvus.module.js';
import { AiModule } from './ai/ai.module.js';
import { ChatModule } from './chat/chat.module.js';

@Module({
  imports: [MilvusModule, AiModule, ChatModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseWrapInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
