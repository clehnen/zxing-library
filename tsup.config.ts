// tsup.config.ts
import {defineConfig} from 'tsup';

export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/test/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  format: ['esm', 'cjs'],       // Generates both CommonJS and ES Module formats
  dts: {
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  bundle: false,
  splitting: true,             // Enables code splitting for tree-shaking
  sourcemap: true,
  clean: true,                 // Cleans /dist before each build
  treeshake: true,             // Strips unused code for browser bundlers
  target: 'es2022',            // Modern JS target
  skipNodeModulesBundle: true,
});