// Service worker disabled temporarily for debugging
// All requests pass through to network
self.addEventListener('fetch', e=>{
  e.respondWith(fetch(e.request));
});
self.addEventListener('install', ()=>self.skipWaiting());
self.addEventListener('activate', ()=>self.clients.claim());
