import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Standalone BuLLM Admin web: runs on its own port (5180), separate from Masters (5173).
export default defineConfig({plugins:[react()],base:'./',server:{port:5180},preview:{port:5180}});
