import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteSingleFile } from 'vite-plugin-singlefile';

// BASE_PATH: no GitHub Pages o site fica em /<nome-do-repositorio>/
const base = process.env.BASE_PATH || '/';

// ARQUIVO_UNICO=1: gera um só index.html com tudo embutido (prévia da demonstração, sem PWA)
const arquivoUnico = process.env.ARQUIVO_UNICO === '1';

const pwa = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'favicon.svg', 'icon-180.png'],
  manifest: {
    name: 'BolsaLab',
    short_name: 'BolsaLab',
    description: 'Simulador de investimentos dos alunos de Administração do ISECENSA',
    lang: 'pt-BR',
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#00956F',
    background_color: '#FFFFFF',
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    // dados do Supabase nunca ficam em cache: sempre vêm da rede
    navigateFallbackDenylist: [/^\/auth/, /^\/rest/],
    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
  },
});

// Cada build tem uma versão. O app compara a sua com a de versao.json (sempre lida da rede)
// e, se estiver desatualizado, obriga a atualizar (ver lib/atualizacao.js).
const VERSAO = new Date().toISOString();
const arquivoVersao = {
  name: 'versao-json',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'versao.json', source: JSON.stringify({ versao: VERSAO }) }); },
};

export default defineConfig({
  base: arquivoUnico ? './' : base,
  define: { __VERSAO__: JSON.stringify(arquivoUnico ? '' : VERSAO) },
  plugins: arquivoUnico ? [react(), viteSingleFile()] : [react(), pwa, arquivoVersao],
  // na prévia (sem PWA) o registro do service worker vira um arquivo vazio
  resolve: arquivoUnico ? { alias: { 'virtual:pwa-register': '/src/sem-pwa.js' } } : {},
  build: arquivoUnico
    ? { outDir: 'dist-previa', assetsInlineLimit: 1e9, copyPublicDir: false }
    : {},
});
