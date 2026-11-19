import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    checker({ typescript: true }),
    svgr(),
    ...(process.env.ANALYZE
      ? [visualizer({ open: true, gzipSize: true, brotliSize: true })]
      : []),
  ],
  resolve: {
    alias: {
      '@atoms': resolve(__dirname, 'src/components/atoms'),
      '@molecules': resolve(__dirname, 'src/components/molecules'),
      '@organisms': resolve(__dirname, 'src/components/organisms'),
      '@containers': resolve(__dirname, 'src/containers'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@redux': resolve(__dirname, 'src/redux'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@context': resolve(__dirname, 'src/context'),
      '@models': resolve(__dirname, 'src/models'),
      '@validators': resolve(__dirname, 'src/validators'),
      '@assemblers': resolve(__dirname, 'src/assemblers'),
      '@helpers': resolve(__dirname, 'src/helpers'),
      '@appTypes': resolve(__dirname, 'src/types'),
      '@config': resolve(__dirname, 'src/config'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@HOC': resolve(__dirname, 'src/HOC'),
      '@router': resolve(__dirname, 'src/router'),
      '@mock': resolve(__dirname, 'src/mock'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      'zod',
      '@reduxjs/toolkit',
      'antd',
      'styled-components',
      'lodash',
    ],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['@tanstack/react-router'],
        },
      },
    },
  },
}));
