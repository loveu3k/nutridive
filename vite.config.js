import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendors';
            }
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('mdast') || id.includes('micromark') || id.includes('unist') || id.includes('decode-named-character-reference')) {
              return 'markdown-vendors';
            }
            if (id.includes('@supabase') || id.includes('postgrest') || id.includes('websocket')) {
              return 'supabase-vendors';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('react-router-dom') || id.includes('@remix-run')) {
              return 'react-vendors';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
