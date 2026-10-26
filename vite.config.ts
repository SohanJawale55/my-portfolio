import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Set VITE_BASE=/repo-name/ when deploying to a GitHub Pages project site. Vercel/Netlify use the default "/".
export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, '.', '').VITE_BASE || '/',
  plugins: [react()],
}))
