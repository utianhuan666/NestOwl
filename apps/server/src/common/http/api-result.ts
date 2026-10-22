/**
 * 统一响应结构，对应参考文章中的 Result<T>。
 *
 * code:      业务状态码，0 表示成功
 * msg:       给用户看的提示信息
 * data:      业务数据
 * timestamp: 服务端响应时间戳（毫秒）
 */
export interface ApiResult<T = unknown> {
  code: number;
  msg: string;
  data: T | null;
  timestamp: number;
}

export enum ResultCode {
  SUCCESS = 0,
  FAILED = 500,
  VALIDATION_FAILED = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  RATE_LIMITED = 429,
  INTERNAL_ERROR = 50000,
}

export const RESULT_MESSAGES: Record<ResultCode, string> = {
  [ResultCode.SUCCESS]: '操作成功',
  [ResultCode.FAILED]: '操作失败',
  [ResultCode.VALIDATION_FAILED]: '参数校验失败',
  [ResultCode.UNAUTHORIZED]: '暂未登录或登录已过期',
  [ResultCode.FORBIDDEN]: '没有相关权限',
  [ResultCode.NOT_FOUND]: '资源不存在',
  [ResultCode.CONFLICT]: '资源冲突',
  [ResultCode.UNPROCESSABLE_ENTITY]: '请求无法处理',
  [ResultCode.RATE_LIMITED]: '请求过于频繁，请稍后再试',
  [ResultCode.INTERNAL_ERROR]: '系统繁忙，请稍后再试',
};

export function success<T>(
  data: T | null = null,
  msg: string = RESULT_MESSAGES[ResultCode.SUCCESS],
): ApiResult<T> {
  return {
    code: ResultCode.SUCCESS,
    msg,
    data,
    timestamp: Date.now(),
  };
}

export function failure(
  code: number = ResultCode.FAILED,
  msg?: string,
): ApiResult<null> {
  return {
    code,
    msg: msg ?? RESULT_MESSAGES[code as ResultCode] ?? RESULT_MESSAGES[ResultCode.FAILED],
    data: null,
    timestamp: Date.now(),
  };
}

/**
 * 判断响应是否已经是统一结构，避免 Controller 手动返回后再次包装。
 * 使用结构判断而不是 instanceof，兼容跨模块/跨包的普通对象。
 */
export function isApiResult(value: unknown): value is ApiResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.code === 'number' &&
    typeof candidate.msg === 'string' &&
    'data' in candidate &&
    typeof candidate.timestamp === 'number'
  );
}
