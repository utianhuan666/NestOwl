import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RESULT_MESSAGES, ResultCode, failure } from './api-result.js';
import { BusinessException } from './business.exception.js';

/**
 * 与参考文章保持一致：HTTP 状态码固定 200，业务状态看 body.code。
 *
 * 如果你更希望网关和监控能直接识别 401/403/404/500，
 * 把这里改成 false 即可保留真实 HTTP 状态码。
 */
const ALWAYS_HTTP_200 = true;

interface ResolvedException {
  status: number;
  code: number;
  message: string;
}

/**
 * 全局异常过滤器。
 *
 * 保证正常返回和异常返回使用同一套 ApiResult 结构，
 * 前端只需要判断 body.code，不需要为每个接口写不同的解析逻辑。
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const resolved = resolveException(exception);

    if (resolved.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${resolved.status}/${resolved.code}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} -> ${resolved.status}/${resolved.code} ${resolved.message}`,
      );
    }

    response
      .status(ALWAYS_HTTP_200 ? HttpStatus.OK : resolved.status)
      .json(failure(resolved.code, resolved.message));
  }
}

function resolveException(exception: unknown): ResolvedException {
  if (exception instanceof BusinessException) {
    return {
      status: exception.getStatus(),
      code: exception.code,
      message: exception.message,
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const isServerError = status >= HttpStatus.INTERNAL_SERVER_ERROR;

    return {
      status,
      code: mapStatusToCode(status),
      // 5xx 不把内部细节暴露给前端，真实错误写日志。
      message: isServerError
        ? RESULT_MESSAGES[ResultCode.INTERNAL_ERROR]
        : extractMessage(exception.getResponse()) ?? exception.message,
    };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: ResultCode.INTERNAL_ERROR,
    message: RESULT_MESSAGES[ResultCode.INTERNAL_ERROR],
  };
}

function mapStatusToCode(status: number): number {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ResultCode.VALIDATION_FAILED;
    case HttpStatus.UNAUTHORIZED:
      return ResultCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ResultCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ResultCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ResultCode.CONFLICT;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ResultCode.UNPROCESSABLE_ENTITY;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ResultCode.RATE_LIMITED;
    default:
      return status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? ResultCode.INTERNAL_ERROR
        : ResultCode.FAILED;
  }
}

function extractMessage(payload: unknown): string | undefined {
  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const { message, error } = payload as { message?: unknown; error?: unknown };

  if (Array.isArray(message)) {
    return message.map(String).join('; ');
  }

  if (typeof message === 'string') {
    return message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return undefined;
}
