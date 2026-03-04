import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@geokit/db': path.resolve(__dirname, '../../packages/db/src'),
      '@geokit/geoip': path.resolve(__dirname, '../../packages/geoip/src'),
    },
  },
});
