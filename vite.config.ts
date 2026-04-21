import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'DayBloom',
        short_name: 'DayBloom',
        theme_color: '#0F0F0F',
        background_color: '#0F0F0F',
        display: 'standalone'
      }
    })
  ],
});
