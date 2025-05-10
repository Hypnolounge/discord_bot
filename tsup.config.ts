import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'], // or ['cjs'] if you need CommonJS
  target: 'node23', // match your Node version
  clean: true,
  dts: false,
  splitting: true,
  minify: false,
  platform: 'node'
});
