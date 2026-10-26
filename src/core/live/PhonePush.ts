/**
 * Web Push for the installed phone app. The cloud worker (Hugging Face Space) holds the VAPID key and
 * forwards every office notification (`<topic>-bildirim`) to the subscriptions registered here, so the
 * phone gets a system notification even while the app is closed.
 */

/** Cloud worker base URL from the `?ping=` param (only cloud phone links carry it). */
export function cloudBase(): string | null {
  const ping = new URLSearchParams(window.location.search).get('ping');
  return ping && /^https:\/\/[\w.-]+\.hf\.space\/?$/.test(ping) ? ping.replace(/\/?$/, '/') : null;
}

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!cloudBase();
}

const b64ToBytes = (b64: string) => {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

async function register(topic: string, sub: PushSubscription) {
  const res = await fetch(`${cloudBase()}push/sub`, {
    method: 'POST',
    // text/plain keeps this a CORS "simple" request (the Space answers without a preflight)
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ topic, sub: sub.toJSON(), url: window.location.href }),
  });
  if (!res.ok) throw new Error(`kayıt başarısız (${res.status})`);
}

/** Ask permission (must run from a tap) and subscribe this phone. */
export async function enablePush(topic: string): Promise<void> {
  if (!pushSupported()) throw new Error('Bu tarayıcı bildirimleri desteklemiyor');
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Bildirim izni verilmedi');
  const reg = await navigator.serviceWorker.ready;
  const keyRes = await fetch(`${cloudBase()}push/key`);
  if (!keyRes.ok) throw new Error('Bulut ofisine ulaşılamadı');
  const { key } = await keyRes.json();
  let sub = await reg.pushManager.getSubscription();
  if (sub) {
    // A subscription made with another server key cannot receive our pushes
    const old = sub.options.applicationServerKey;
    const same = old && btoa(String.fromCharCode(...new Uint8Array(old))).replace(/=+$/, '') ===
      btoa(String.fromCharCode(...b64ToBytes(key))).replace(/=+$/, '');
    if (!same) { await sub.unsubscribe(); sub = null; }
  }
  sub = sub ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
  await register(topic, sub);
}

/** Re-register on every open: the free Space forgets subscriptions when it restarts. Returns whether push is on. */
export async function refreshPush(topic: string): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== 'granted') return false;
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (!sub) return false;
    await register(topic, sub);
    return true;
  } catch {
    return false;
  }
}
