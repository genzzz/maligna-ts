import { defineConfig } from 'vite';

export default defineConfig({
  base: '/maligna-ts/',
  optimizeDeps: {
    include: ['maligna-ts'],
  },
  build: {
    commonjsOptions: {
      include: [/maligna-ts/, /node_modules/],
    },
  },
});
