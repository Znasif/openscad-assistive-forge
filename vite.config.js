import { defineConfig } from 'vite';

const SW_CACHE_VERSION_TOKEN = '__SW_CACHE_VERSION__';

function getSwCacheVersion() {
  const envHash =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA;
  if (envHash) {
    return `commit-${envHash.slice(0, 8)}`;
  }

  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `build-${stamp}`;
}

function injectSwCacheVersion() {
  const version = getSwCacheVersion();

  return {
    name: 'inject-sw-cache-version',
    apply: 'build',
    generateBundle(_, bundle) {
      const swAsset = bundle['sw.js'];
      if (!swAsset || swAsset.type !== 'asset') return;

      const source = swAsset.source.toString();
      swAsset.source = source.replace(SW_CACHE_VERSION_TOKEN, version);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [injectSwCacheVersion()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'ajv': ['ajv'],
        },
      },
    },
  },
  server: {
    port: 5173,
    headers: {
      // Required for SharedArrayBuffer in development
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['openscad-wasm'], // If we vendor WASM
  },
});
