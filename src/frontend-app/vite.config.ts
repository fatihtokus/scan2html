import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
/* export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: './src/main.tsx',
      },
    },
  },
}) */

export default defineConfig({
  plugins: [
    cssInjectedByJsPlugin(),
  ],
  build: {
    rollupOptions: {
      input: {
        app: './src/main.tsx',
      },
      output: {
        assetFileNames: (assetInfo) => {
          return `assets/[name].css`;
        },
        entryFileNames: (assetInfo) => {
          if (assetInfo.name == 'app') {
            return `[name].js`;
          }

          let path = assetInfo.facadeModuleId;
          let d = path.split('/');
          let name = d[d.length - 2];

          return `js/components/${name}.js`;
        },
      }
    },
    cssCodeSplit: false,
  },
})