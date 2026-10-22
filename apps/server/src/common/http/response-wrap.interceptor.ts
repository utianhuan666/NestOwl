import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { REDIRECT_METADATA, SSE_METADATA } from '@nestjs/common/constants.js';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { map, type Observable } from 'rxjs';
import { isApiResult, success } from './api-result.js';
import { SKIP_RESPONSE_WRAP_KEY } from './skip-response-wrap.decorator.js';

/**
 * 全局响应包装拦截器。
 *
 * Controller 正常返回业务数据即可，由这里统一包装成：
 *   { code: 0, msg: '操作成功', data, timestamp }
 *
 * 以下情况跳过包装：
 * - Controller 或方法标注了 @SkipResponseWrap()
 * - SSE、重定向、文件流等非 JSON 响应
 * - 返回值已经符合 ApiResult 结构（避免 Result 套 Result）
 */
@Injectable()
export class ResponseWrapInterceptor implements NestInterceptor<unknown, unknown> {
  /** 这些 Content-Type 属于原始流，包装会破坏协议 */
  private static readonly RAW_CONTENT_TYPE =
    /text\/event-stream|application\/octet-stream|multipart\//i;

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    if (context.getType() !== 'http' || this.shouldSkip(context)) {
      return next.handle();
    }

    return next.handle().pipe(map((data) => this.wrap(data)));
  }

  /** 包装业务数据；已是统一结构或文件流则原样透传，避免 Result 套 Result */
  private wrap(data: unknown): unknown {
    if (data instanceof StreamableFile || isApiResult(data)) {
      return data;
    }
    return success(data ?? null);
  }

  /** 装饰器标注 / @Sse() / @Redirect() / 原始流，任一命中即跳过包装 */
  private shouldSkip(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();
    const { reflector } = this;

    const skipped = reflector.getAllAndOverride<boolean>(SKIP_RESPONSE_WRAP_KEY, [
      handler,
      controller,
    ]);
    // @Sse() 返回事件流，包装后会破坏 SSE 协议
    const isSse = reflector.get<boolean>(SSE_METADATA, handler);
    const redirect = reflector.get<unknown>(REDIRECT_METADATA, handler);

    return Boolean(skipped || isSse || redirect) || this.isRawContent(context);
  }

  private isRawContent(context: ExecutionContext): boolean {
    const response = context.switchToHttp().getResponse<Response>();
    const contentType = response.getHeader('Content-Type');
    const type = Array.isArray(contentType) ? contentType.join(';') : String(contentType ?? '');

    return ResponseWrapInterceptor.RAW_CONTENT_TYPE.test(type);
  }
}
