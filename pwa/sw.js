// sw.js - Service Worker (Opcional)
const CACHE_NAME = 'game-portal-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/jogo.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/theme.css',
  '/js/app.js',
  '/js/ui.js',
  // Adicionar outros assets essenciais do portal
];

self.addEventListener('install', event => {
  // Desativado por omissão para não interferir com o desenvolvimento.
  // Ativar quando pronto para produção.
  console.log('Service Worker: Instalação ignorada (desativado).');
  // event.waitUntil(
  //   caches.open(CACHE_NAME)
  //     .then(cache => {
  //       console.log('Cache aberto');
  //       return cache.addAll(URLS_TO_CACHE);
  //     })
  // );
});

self.addEventListener('fetch', event => {
  // Estratégia Cache-first (exemplo)
  // event.respondWith(
  //   caches.match(event.request)
  //     .then(response => {
  //       if (response) {
  //         return response;
  //       }
  //       return fetch(event.request);
  //     })
  // );
});
