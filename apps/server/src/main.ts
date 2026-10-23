import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// .env 路径锚定在源码位置，不依赖进程启动时的工作目录
config({ path: new URL('../.env', import.meta.url) });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
