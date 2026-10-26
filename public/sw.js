// Service worker: makes the page installable as a phone app and shows office push notifications.
// Every request still goes to the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    // A chat reply needs no banner while the app is already on screen
    if (d.tag === 'chat' && list.some((c) => c.visibilityState === 'visible')) return;
    return self.registration.showNotification(d.title || 'Nova Ofis', {
      body: d.body || '',
      icon: 'icons/icon-192-v2.png',
      badge: 'icons/icon-192-v2.png',
      tag: d.tag || undefined,
      renotify: !!d.tag,
      data: { url: d.url || self.registration.scope },
    });
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const open = list.find((c) => c.url.startsWith(self.registration.scope));
    return open ? open.focus() : self.clients.openWindow(url);
  }));
});
