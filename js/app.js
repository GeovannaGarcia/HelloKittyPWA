const $ = (id) => document.getElementById(id);
const DB_KEY = 'kitty-notes-v1';
const QUEUE_KEY = 'kitty-sync-queue-v1';
let installPrompt = null;

function getNotes(){ try{return JSON.parse(localStorage.getItem(DB_KEY)||'[]')}catch{return []} }
function saveNotes(notes){localStorage.setItem(DB_KEY,JSON.stringify(notes))}
function showStatus(message){$('status').textContent=message}
function renderNotes(){
  const notes=getNotes();
  $('notes').innerHTML='';
  if(!notes.length){$('notes').innerHTML='<p class="status">Todavía no hay notitas. ¡Escribe la primera! ♡</p>';return}
  notes.forEach(note=>{
    const article=document.createElement('article');article.className='note';
    const title=document.createElement('h3');title.textContent=note.title;
    const body=document.createElement('p');body.textContent=note.text;
    const time=document.createElement('small');time.textContent=new Date(note.createdAt).toLocaleString('es-MX');
    const del=document.createElement('button');del.className='delete';del.textContent='×';del.setAttribute('aria-label','Eliminar notita');
    del.addEventListener('click',()=>{saveNotes(getNotes().filter(n=>n.id!==note.id));renderNotes();showStatus('Notita eliminada.');});
    article.append(title,body,time,del);$('notes').append(article);
  });
}
function updateConnection(){const online=navigator.onLine;$('connection').textContent=online?'● Conectada':'● Sin conexión';$('connection').classList.toggle('offline',!online)}
window.addEventListener('online',()=>{updateConnection();showStatus('Volviste a conectarte. ♡');trySync()});
window.addEventListener('offline',()=>{updateConnection();showStatus('Sin internet: puedes seguir usando la app. ♡')});

$('noteForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const note={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:$('noteTitle').value.trim(),text:$('noteText').value.trim(),createdAt:new Date().toISOString()};
  if(!note.title||!note.text)return;
  saveNotes([note,...getNotes()]);
  const queue=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');queue.push({type:'new-note',id:note.id,createdAt:note.createdAt});localStorage.setItem(QUEUE_KEY,JSON.stringify(queue));
  $('noteForm').reset();renderNotes();showStatus('¡Notita guardada en este dispositivo! ♡');
  await trySync();
  if('serviceWorker' in navigator && 'SyncManager' in window){
    try{const reg=await navigator.serviceWorker.ready;await reg.sync.register('sync-kitty-notes');showStatus('Notita guardada. Sincronización en segundo plano registrada. ♡')}catch(err){console.info('Background Sync no disponible:',err)}
  }
});

async function trySync(){
  if(!navigator.onLine){showStatus('Sin conexión: tus cambios quedan guardados para sincronizar después. ♡');return}
  if('serviceWorker' in navigator){
    try{const reg=await navigator.serviceWorker.ready;if('sync' in reg)await reg.sync.register('sync-kitty-notes')}catch(e){console.info('Sync no disponible',e)}
  }
  // Demo local: no hay servidor remoto configurado; la cola se conserva en el dispositivo.
  showStatus('Revisión de sincronización lista. No hay servidor remoto configurado; tus datos siguen guardados localmente.');
}
$('syncBtn').addEventListener('click',trySync);
$('notifyBtn').addEventListener('click',async()=>{
  if(!('Notification' in window)){showStatus('Este navegador no permite notificaciones.');return}
  const permission=await Notification.requestPermission();
  if(permission==='granted'){
    if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.ready;await reg.showNotification('¡Hola, amiguita! 🎀',{body:'Tu rinconcito cute está listo para ti.',icon:'icons/kitty-192.png',badge:'icons/kitty-192.png',tag:'kitty-welcome'})}
    else new Notification('¡Hola, amiguita! 🎀',{body:'Tu rinconcito cute está listo para ti.'});
    showStatus('¡Notificaciones activadas! ♡');
  }else showStatus('No se concedió permiso para las notificaciones.');
});
const quotes=['No necesitas un día perfecto para encontrar algo bonito.','Un pequeño paso también cuenta. 🌷','Recuerda tratarte con el mismo cariño que das a los demás.','Hoy puede ser un buen día para empezar de nuevo.'];
$('surpriseBtn').addEventListener('click',async()=>{
  const quote=quotes[Math.floor(Math.random()*quotes.length)];$('quote').textContent=quote;
  if('Notification' in window && Notification.permission==='granted' && 'serviceWorker' in navigator){
    const reg=await navigator.serviceWorker.ready;reg.showNotification('Una sorpresa para ti 🎀',{body:quote,icon:'icons/kitty-192.png',tag:'kitty-surprise'});
  }else showStatus('Sorpresa desbloqueada. Activa los avisos si también quieres recibir notificaciones. ♡');
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installBtn').hidden=false});
$('installBtn').addEventListener('click',async()=>{if(!installPrompt){showStatus('En el menú del navegador, elige “Instalar app” o “Añadir a pantalla de inicio”.');return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').hidden=true});
window.addEventListener('appinstalled',()=>showStatus('¡Hello Kitty se instaló correctamente! 🎀'));
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(()=>console.log('Service Worker registrado')).catch(err=>console.error('Error SW',err)))}
updateConnection();renderNotes();
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('message',event=>{
  if(event.data&&event.data.type==='KITTY_SYNC_COMPLETE')showStatus('Sincronización en segundo plano completada. ♡');
 });
}
