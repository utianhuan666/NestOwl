import { HttpException, HttpStatus } from '@nestjs/common';
import { RESULT_MESSAGES, ResultCode } from './api-result.js';

/**
 * 业务异常。
 *
 * 业务代码中主动抛出，由 AllExceptionsFilter 统一转换成 ApiResult。
 * 例如：
 *   throw new BusinessException(ResultCode.NOT_FOUND, '用户不存在', HttpStatus.NOT_FOUND);
 */
export class BusinessException extends HttpException {
  readonly code: number;

  constructor(
    code: number = ResultCode.FAILED,
    message?: string,
    status: HttpStatus = defaultStatus(code),
  ) {
    super(
      message ?? RESULT_MESSAGES[code as ResultCode] ?? RESULT_MESSAGES[ResultCode.FAILED],
      status,
    );
    this.code = code;
  }
}

function defaultStatus(code: number): HttpStatus {
  switch (code) {
    case ResultCode.VALIDATION_FAILED:
      return HttpStatus.BAD_REQUEST;
    case ResultCode.UNAUTHORIZED:
      return HttpStatus.UNAUTHORIZED;
    case ResultCode.FORBIDDEN:
      return HttpStatus.FORBIDDEN;
    case ResultCode.NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case ResultCode.CONFLICT:
      return HttpStatus.CONFLICT;
    case ResultCode.UNPROCESSABLE_ENTITY:
      return HttpStatus.UNPROCESSABLE_ENTITY;
    case ResultCode.RATE_LIMITED:
      return HttpStatus.TOO_MANY_REQUESTS;
    case ResultCode.INTERNAL_ERROR:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    default:
      return HttpStatus.BAD_REQUEST;
  }
}
