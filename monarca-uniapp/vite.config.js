import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
  plugins: [(typeof uni === 'function' ? uni : uni.default)()],
  server: { proxy: { '/api': { target: 'https://itsmonarca.com', changeOrigin: true } } }
});
