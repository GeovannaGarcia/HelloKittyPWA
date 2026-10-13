# Hello Kitty PWA 🎀

PWA de ejemplo basada en la estructura de Twittor adjunta, con interfaz temática Hello Kitty.

## Incluye
- `manifest.json` para instalación y los iconos de aplicación 192x192 y 512x512.
- `sw.js` con caché App Shell y estrategia offline-first para que la app abra sin conexión después de la primera carga.
- Evento `sync` (Background Sync) con la etiqueta `sync-kitty-notes`.
- Notificaciones web mediante permiso del navegador y `ServiceWorkerRegistration.showNotification()`.
- Notitas guardadas en `localStorage`.
- Los cinco iconos extraídos del documento Word se incluyen en `icons/icono-1.png` ... `icons/icono-5.png` (se usan en los accesos rápidos los iconos 1, 4 y 5).

## Ejecutar
1. Descomprime la carpeta.
2. Abre una terminal en `HelloKittyPWA`.
3. Ejecuta un servidor local, por ejemplo `python -m http.server 8000`.
4. Visita `http://localhost:8000` en Chrome o Edge.
5. Carga una vez la app con internet, espera que se registre el Service Worker y después prueba el modo sin conexión.
6. Para instalar, usa el botón «Instalar app» cuando aparezca o el menú del navegador → «Instalar app» / «Añadir a pantalla de inicio».
7. Pulsa «Activar avisos» y acepta el permiso.

## Importante sobre Sync
La app registra el evento `sync` y conserva las notitas en el dispositivo. No hay API ni servidor remoto configurado en este proyecto, así que la sincronización es demostrativa: el Service Worker confirma el evento y muestra una notificación, pero no sube datos a una cuenta ni a otro dispositivo. Background Sync depende del navegador y normalmente requiere HTTPS o localhost. Si el navegador no lo soporta, la app sigue guardando localmente y funciona sin conexión.
