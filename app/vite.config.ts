import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 앱인토스 WebView 미니앱은 표준 웹 번들이에요. (SSR 금지 · CSR/SSG)
// dev 서버는 샌드박스 앱이 intoss://{appName} 딥링크로 접근해요.
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
  },
});
