import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 프론트 서버(5173)는 /api 요청을 백엔드(Next.js, 8080)로 넘긴다.
const backend = process.env.BACKEND_URL ?? 'http://127.0.0.1:8080';
const proxy = { '/api': { target: backend, changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
  preview: { host: '127.0.0.1', port: 5173, strictPort: true, proxy },
});
