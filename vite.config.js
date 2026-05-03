import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Convert Vite-injected blocking CSS links to async preload pattern.
// Uses closeBundle (runs after dist/ is written) to avoid conflicts with
// Vite 7's html-proxy virtual module system for inline <style> blocks.
const asyncCSSPlugin = {
  name: 'async-css',
  apply: 'build',
  closeBundle() {
    const htmlPath = path.resolve(process.cwd(), 'dist/index.html');
    if (!fs.existsSync(htmlPath)) return;
    let html = fs.readFileSync(htmlPath, 'utf-8');
    html = html.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
      (_, href) =>
        `<link rel="preload" as="style" crossorigin href="${href}" onload="this.onload=null;this.rel='stylesheet'">` +
        `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`
    );
    fs.writeFileSync(htmlPath, html);
  },
};

export default defineConfig({
  plugins: [react(), asyncCSSPlugin],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    
    // Aggressive tree-shaking to eliminate unused code
    rollupOptions: {
      // Ensure tree-shaking of unused exports
      treeshake: {
        moduleSideEffects: false, // Assume no side effects
        propertyReadSideEffects: false, // Don't keep property reads for side effects
        tryCatchDeoptimization: false, // Optimize try-catch blocks
      },
      
      output: {
        manualChunks: (id) => {
          // React core in its own chunk to break the circular dependency:
          // index.js (entry) → chunk-framer → react → back to index.js.
          // With react in a neutral vendor chunk, both index.js and chunk-framer
          // import from vendor without any cycle.
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'vendor';
          }
          // Firebase bundle - only loaded by Admin/Auth pages
          if (id.includes('firebase')) {
            return 'firebase';
          }
          // Framer-motion - split into separate chunk to enable better tree-shaking
          if (id.includes('framer-motion')) {
            return 'framer';
          }
          // Lucide icons - commonly used but can be optimized
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // Merge the 4 small always-visible page sections into one chunk.
          // Each is ≤2.3 KiB; keeping them separate wastes 3 extra round-trips
          // on mobile (each request costs ~455ms in the waterfall).
          if (
            id.includes('/components/Location') ||
            id.includes('/components/About') ||
            id.includes('/components/Footer') ||
            id.includes('/components/Testimonials')
          ) {
            return 'sections';
          }
          // Merge Checkout, UserProfile, and their shared map utilities into one chunk.
          // Without this, Vite creates a separate shared chunk for useGoogleMaps that
          // must load before Checkout can execute, adding a serial hop to the cascade.
          if (
            id.includes('/components/Checkout') ||
            id.includes('/components/UserProfile') ||
            id.includes('/components/GoogleMapDiv') ||
            id.includes('/hooks/useGoogleMaps')
          ) {
            return 'checkout';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/chunk-[name]-[hash].js',
      }
    },
    
    cssCodeSplit: true,
    
    sourcemap: false,
    
    reportCompressedSize: false,
    
    chunkSizeWarningLimit: 500,
  },

  // Optimize asset handling
  assetsInclude: ['**/*.mp4', '**/*.webm'],

  // Development server proxy for CORS bypass
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false,
        ws: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    }
  },

  // Optimize dependencies - mark heavy libraries for dynamic loading
  optimizeDeps: {
    exclude: ['framer-motion', 'firebase/app', 'firebase/auth', 'firebase/firestore'], // Allow these to be tree-shaken more aggressively
    include: ['lucide-react', 'react', 'react-dom'], // Pre-bundle common libraries
  },
})
