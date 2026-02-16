import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/src-v2": path.resolve(__dirname, "./src-v2"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: mode !== 'production',
    // Note: manualChunks removed because it caused ReferenceError
    // "Cannot access 'X' before initialization" in production builds.
    // Vite's automatic code splitting handles this correctly.
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}))
