// sw.js - Service Worker (Opcional)
const CACHE_NAME = 'retro-games-dev-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/theme.css',
  '/js/app.js',
  '/js/ui.js',
  '/games/snake/index.html',
  '/games/pong/index.html',
  '/games/2048/index.html',
  '/games/tetris/index.html',
  '/games/flappy-bird/index.html',
  '/games/space-invaders/index.html',
  '/games/platformer/index.html',
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
