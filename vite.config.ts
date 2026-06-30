import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1000,
  },
  plugins: [react()],
  // Ensure a single React instance — embla-carousel-react otherwise resolves
  // its own copy in dev, triggering "Invalid hook call" warnings.
  optimizeDeps: {
    include: ["react", "react-dom", "embla-carousel-react"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
