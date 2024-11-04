import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';

function isPlugin(plugin) {
  if (!plugin || typeof plugin !== 'object') {
    console.log("the thing is not an object", plugin)
    return false
  };
  console.log("start finding plugin", plugin)
  const result = plugin.constructor.name.includes('module-federation-vite') || plugin['name']?.includes('module-federation-vite');

  if (result) {
    console.log("we found mf plugin", plugin, "result", result)
    return result
  }
  return false
}

function copy(
  config
) {
  return config.plugins
    ?.filter(isPlugin)
    .map((mf) => {
      const _mf = mf;
      if (!_mf?._options) return;

      return JSON.parse(JSON.stringify(_mf._options));
    })
    .filter(Boolean);
}

function print() {
  return (config) => {
    console.log("config.option", copy(config))
    return config
  }
}

// https://vitejs.dev/config/
export default print()({
  server: {
    open: true,
    port: 5176,
    origin: 'http://localhost:5176',
  },
  preview: {
    port: 5176,
  },
  base: 'http://localhost:5176/testbase',
  plugins: [
    react({ jsxImportSource: '@emotion/react' }),
    federation({
      name: '@namespace/viteViteRemote',
      exposes: {
        './App1': './src/App1',
        './App2': './src/App2.jsx',
        './AgGridDemo': './src/AgGridDemo.jsx',
        './MuiDemo': './src/MuiDemo.jsx',
        './StyledDemo': './src/StyledDemo.jsx',
        './EmotionDemo': './src/EmotionDemo.jsx',
        '.': './src/App.jsx',
      },
      filename: 'remoteEntry-[hash].js',
      manifest: true,
      shared: {
        vue: {},
        'react/': {},
        react: {
          requiredVersion: '18',
        },
        'react-dom/': {},
        'react-dom': {},
        'styled-components': { singleton: true },
        'ag-grid-community/': {},
        'ag-grid-react': {},
        '@emotion/react': {},
        '@emotion/styled': { singleton: true },
        '@mui/material': {},
      },
    }),
    // If you set build.target: "chrome89", you can remove this plugin
    false && topLevelAwait(),
  ],
  build: {
    target: 'chrome89',
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      },
    },
  },
});
