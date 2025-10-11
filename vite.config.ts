import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { analyzer } from 'vite-bundle-analyzer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [mkcert(), analyzer()],
});
