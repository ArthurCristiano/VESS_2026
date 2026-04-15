import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'


export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr(),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 8641, // you can replace this port with any port
    historyApiFallback: true,
  }
})