import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_WRAP_KEY = 'skip:response-wrap';

/**
 * 跳过全局响应包装。
 *
 * 适用场景：文件下载、第三方回调、需要返回原始结构的接口。
 * SSE 接口由拦截器通过 Nest 的 SSE 元数据自动识别，无需手动标注。
 */
export const SkipResponseWrap = () =>
  SetMetadata(SKIP_RESPONSE_WRAP_KEY, true);
