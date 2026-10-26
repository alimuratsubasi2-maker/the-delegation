import * as THREE from 'three/webgpu';

/**
 * Older builds stored this flag to force the WebGL backend after a GPU crash,
 * but the instanced character system cannot render with `forceWebGL`, leaving
 * the office blank. Clear it so affected browsers recover.
 */
const LEGACY_FORCE_WEBGL_KEY = 'nova-force-webgl';
/** Recent GPU-recovery reloads, to avoid a reload loop on a broken driver. */
const RELOADS_KEY = 'nova-gpu-reloads';
const MAX_RELOADS = 2;
const RELOAD_WINDOW_MS = 5 * 60 * 1000;
/** Rendering above this pixel ratio costs a lot of GPU time on laptop screens for little gain. */
const MAX_PIXEL_RATIO = 1.5;
/**
 * Phone GPUs often cannot build the shadow-sampling pipelines; every mesh that
 * receives or casts shadows then silently disappears (floor, furniture, mascots).
 * Phones render without shadows and at a lower resolution instead.
 */
const IS_PHONE = typeof navigator !== 'undefined'
  && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.matchMedia('(max-width: 767px)').matches);
const PHONE_PIXEL_RATIO = 1.25;

try { localStorage.removeItem(LEGACY_FORCE_WEBGL_KEY); } catch { /* storage unavailable */ }

/** Reloads after a GPU device / context loss, at most MAX_RELOADS times per window. */
const recoverFromGpuLoss = (reason: string) => {
  console.error('[Engine] GPU lost:', reason);
  try {
    const now = Date.now();
    const recent: number[] = JSON.parse(sessionStorage.getItem(RELOADS_KEY) || '[]').filter((t: number) => now - t < RELOAD_WINDOW_MS);
    if (recent.length >= MAX_RELOADS) return;
    sessionStorage.setItem(RELOADS_KEY, JSON.stringify([...recent, now]));
  } catch { /* storage unavailable: still try once */ }
  setTimeout(() => window.location.reload(), 1500);
};

export class Engine {
  public renderer: THREE.WebGPURenderer;
  public timer: THREE.Timer;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGPURenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_PHONE ? PHONE_PIXEL_RATIO : MAX_PIXEL_RATIO));
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);

    // Ensure the canvas is sized by CSS so physical resizing is fluid
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    // Use default shadow map (PCF) as VSM support in WebGPU/NodeMaterial can be sensitive
    this.renderer.shadowMap.enabled = !IS_PHONE;

    // WebGL fallback backend (browsers without WebGPU): context loss after a driver reset
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      recoverFromGpuLoss('webgl context lost');
    });

    container.appendChild(this.renderer.domElement);
    this.timer = new THREE.Timer();
  }

  public async init() {
    try {
      await this.renderer.init();
      const device = (this.renderer.backend as any)?.device;
      device?.lost?.then((info: { reason: string; message: string }) => {
        if (info.reason !== 'destroyed') recoverFromGpuLoss(info.message || 'device lost');
      });
    } catch (e) {
      console.error("WebGPU initialization failed:", e);
    }
  }

  public onResize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
  }

  public render(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.renderer.render(scene, camera);
  }

  public dispose() {
    this.renderer.dispose();
  }
}
