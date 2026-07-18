import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    // mongodb-memory-server downloads/starts a real mongod binary, which is
    // slow on a cold cache - default 5s timeouts fail spuriously.
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
