import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['node_modules', 'cypress', 'dist', 'tests/e2e', 'cypress'],
  },
});
