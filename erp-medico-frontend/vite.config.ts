
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"



export default defineConfig({
  base: '/GP-Medical-3.5/',
  plugins: [
    react(),
    /* sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    }) */
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
  },
})

