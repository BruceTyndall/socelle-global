import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Gate PWA to production builds only.
// In dev, disable: true avoids the SW intercepting HMR and Vite's dev server requests.
const isProd = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      disable: !isProd,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      // Manual registration already in index.html — don't double-inject
      injectRegister: null,
      // Use existing public/manifest.json — don't regenerate
      manifest: false,
      injectManifest: {
        injectionPoint: '__WB_MANIFEST',
      },
    })
  ],

  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['mammoth', 'pdfjs-dist'],
  },

  build: {
    chunkSizeWarningLimit: 600,
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-docs':     ['mammoth', 'pdfjs-dist'],
          'vendor-icons':    ['lucide-react'],
        },
      },
    },
  },

  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
        "font-src 'self' https://fonts.gstatic.com https://api.fontshare.com https://cdn.fontshare.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.openai.com",
        "frame-ancestors 'none'",
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
