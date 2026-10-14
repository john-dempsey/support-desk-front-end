import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// One config file for both the dev server (`npm run dev`) and the tests
// (`npm test`) — Vitest reads the `test` section below, Vite ignores it.
export default defineConfig({
  plugins: [react()],
  server: {
    // The back-end API already uses port 3000, so the front-end runs on
    // Vite's default port instead. strictPort stops Vite quietly moving to
    // 5174 if 5173 is busy, which would be confusing.
    port: 5173,
    strictPort: true,
  },
  test: {
    // jsdom gives the tests a pretend browser (document, window, ...) so
    // React components can render without a real browser window.
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Undo every fake between tests, so one test can never leak a fake
    // fetch or a fake response into the next: unstubGlobals undoes
    // vi.stubGlobal(), unstubEnvs undoes vi.stubEnv(), and mockReset clears
    // what each vi.fn() / vi.mock() fake was told to return (and puts
    // vi.spyOn() spies back).
    unstubGlobals: true,
    unstubEnvs: true,
    mockReset: true,
  },
});
