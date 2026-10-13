const CACHE_NAME='hello-kitty-pwa-v1';
const APP_SHELL=[
 './','./index.html','./styles.css','./app.js','./manifest.json',
 './icons/kitty-192.png','./icons/kitty-512.png',
 './icons/icono-1.png','./icons/icono-2.png','./icons/icono-3.png','./icons/icono-4.png','./icons/icono-5.png'
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 event.respondWith(caches.match(event.request).then(cached=>{
  if(cached)return cached;
  return fetch(event.request).then(response=>{
   if(response&&response.ok&&new URL(event.request.url).origin===self.location.origin){
    const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
   }
   return response;
  }).catch(()=>caches.match('./index.html'));
 }));
});
// Background Sync: se ejecuta cuando el navegador decide que hay conectividad.
self.addEventListener('sync',event=>{
 if(event.tag==='sync-kitty-notes'){
  event.waitUntil((async()=>{
   // La demo no tiene API/servidor remoto: notifica que los datos locales están conservados.
   const clientsList=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   clientsList.forEach(client=>client.postMessage({type:'KITTY_SYNC_COMPLETE'}));
   await self.registration.showNotification('¡Todo guardadito! 🎀',{
    body:'Tus notitas siguen seguras en este dispositivo.',
    icon:'./icons/kitty-192.png',badge:'./icons/kitty-192.png',tag:'kitty-sync'
   });
  })());
 }
});
self.addEventListener('message',event=>{
 if(event.data&&event.data.type==='SHOW_KITTY_NOTIFICATION'){
  event.waitUntil(self.registration.showNotification(event.data.title||'Hello Kitty 🎀',{
   body:event.data.body||'¡Hola, amiguita!',icon:'./icons/kitty-192.png',badge:'./icons/kitty-192.png'
  }));
 }
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
  for(const client of list){if('focus' in client)return client.focus();}
  return self.clients.openWindow('./index.html');
 }));
});