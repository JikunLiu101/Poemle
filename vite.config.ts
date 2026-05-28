import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The production build is hosted at https://<user>.github.io/poemle/ so
// asset URLs need the `/poemle/` prefix. Dev server stays on `/` for
// convenience.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/poemle/' : '/',
}))
