/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Intentional: only `.test.ts` (pure-function tests). Component tests
    // are deferred to manual verification per the MVP plan; broaden to
    // `*.test.{ts,tsx}` if/when RTL-based tests are added.
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
