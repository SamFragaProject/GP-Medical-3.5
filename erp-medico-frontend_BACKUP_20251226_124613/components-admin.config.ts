import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/components/admin/**/*.tsx'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
})