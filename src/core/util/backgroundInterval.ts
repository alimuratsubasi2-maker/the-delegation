/**
 * setInterval that keeps ticking while the tab is hidden.
 *
 * Chrome throttles chained timers in background tabs to one wake-up per minute,
 * which would stall the office while the user follows it from their phone.
 * Dedicated workers are exempt, so the ticks come from a tiny inline worker.
 * Falls back to a normal interval where workers are unavailable.
 */
export function backgroundInterval(fn: () => void, ms: number): () => void {
  try {
    const src = `setInterval(() => postMessage(0), ${Math.max(100, Math.floor(ms))});`;
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    const worker = new Worker(url);
    worker.onmessage = () => fn();
    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  } catch {
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }
}
