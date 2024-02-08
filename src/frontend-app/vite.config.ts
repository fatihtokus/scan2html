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
        app_template: './src/assets/app-template.html',
      },
      output: {
        assetFileNames: (assetInfo) => {
          console.log("assetFileNames: " + assetInfo.name);
          return `assets/[name].css`;
        },
        entryFileNames: (assetInfo) => {
          console.log("entryFileNames: " + assetInfo.name);
          if (assetInfo.name == 'app') {
            return `[name].js`;
          }

          if (assetInfo.name == 'app_template') {
            return `[name].html`;
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