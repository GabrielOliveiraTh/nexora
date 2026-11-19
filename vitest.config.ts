import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig({ mode: 'test', command: 'serve' }),
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/config/setupTests.ts'],
      pool: 'forks',
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: [
          '**/*.styled.{ts,tsx}',
          '**/*.style.{ts,tsx}',
          '**/*.type.ts',
          '**/*.model.ts',
          '**/*.enum.ts',
          '**/*.stories.tsx',
          '**/__mocks__/**',
          '**/config/**',
        ],
      },
    },
  }),
);
