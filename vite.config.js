import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const page = (p) => resolve(import.meta.dirname, p);
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        home: page('index.html'),
        music: page('music/index.html'),
        tour: page('tour/index.html'),
        achievements: page('achievements/index.html'),
        story: page('story/index.html'),
      },
    },
  },
});
