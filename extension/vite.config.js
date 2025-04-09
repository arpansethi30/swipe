import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest-and-icons',
      closeBundle() {
        // Create directories if they don't exist
        mkdirSync('dist/icons', { recursive: true });
        
        // Copy manifest file
        try {
          copyFileSync('manifest.json', 'dist/manifest.json');
          console.log('✓ manifest.json copied to dist/');
        } catch (error) {
          console.error('Error copying manifest.json:', error);
        }
        
        // Copy icons
        try {
          copyFileSync('public/icons/icon16.png', 'dist/icons/icon16.png');
          copyFileSync('public/icons/icon48.png', 'dist/icons/icon48.png');
          copyFileSync('public/icons/icon128.png', 'dist/icons/icon128.png');
          console.log('✓ Icons copied to dist/icons/');
        } catch (error) {
          console.error('Error copying icons:', error);
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
