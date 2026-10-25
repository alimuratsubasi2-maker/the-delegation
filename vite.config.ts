import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

/**
 * Older phone browsers (no CSS cascade layers) silently drop every rule inside
 * `@layer`, which leaves Tailwind v4 pages unstyled. Unwrap the layers in the
 * final CSS; Tailwind emits them in theme → base → components → utilities
 * order, so source order keeps the same precedence.
 */
function unwrapLayers(css: string): string {
  css = css.replace(/@layer\s+[\w-]+(\s*,\s*[\w-]+)*\s*;/g, '');
  let out = '';
  let i = 0;
  for (;;) {
    const at = css.indexOf('@layer', i);
    if (at < 0) return out + css.slice(i);
    const open = css.indexOf('{', at);
    if (open < 0) return out + css.slice(i);
    out += css.slice(i, at);
    let depth = 1;
    let j = open + 1;
    while (depth > 0 && j < css.length) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    out += unwrapLayers(css.slice(open + 1, j - 1));
    i = j;
  }
}

const flattenCssLayers = (): Plugin => ({
  name: 'flatten-css-layers',
  enforce: 'post',
  generateBundle(_, bundle) {
    for (const file of Object.values(bundle)) {
      if (file.type === 'asset' && file.fileName.endsWith('.css') && typeof file.source === 'string') {
        file.source = unwrapLayers(file.source);
      }
    }
  },
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/the-delegation/',
    plugins: [react(), tailwindcss(), flattenCssLayers()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Down-level oklch()/color-mix()/nesting so older phone browsers render colours
      cssMinify: 'lightningcss',
      cssTarget: ['chrome80', 'safari13', 'firefox78', 'edge88'],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
