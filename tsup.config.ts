import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'node24',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.js',
      };
    },
  },
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    outDir: 'dist',
    format: ['cjs'],
    dts: false,
    sourcemap: true,
    clean: false,
    target: 'node24',
    banner: {
      js: '#!/usr/bin/env node',
    },
    outExtension() {
      return {
        js: '.cjs',
      };
    },
  },
]);
