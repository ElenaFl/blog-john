import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist', // принудительно говорим Vite складывать всё в dist
  },
  plugins: [react(), tailwindcss(),],
})
