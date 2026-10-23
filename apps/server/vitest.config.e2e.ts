import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // 测试不经过 main.ts，需自行加载 .env
    setupFiles: ['dotenv/config'],
  },
});
