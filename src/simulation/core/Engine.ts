import * as THREE from 'three/webgpu';

/** Set after a GPU crash so the next load uses the more forgiving WebGL2 backend. */
const FORCE_WEBGL_KEY = 'nova-force-webgl';
/** Rendering above this pixel ratio costs a lot of GPU time on laptop screens for little gain. */
const MAX_PIXEL_RATIO = 1.5;

const readForceWebGL = () => {
  if (new URLSearchParams(window.location.search).has('gl')) return true;
  try { return localStorage.getItem(FORCE_WEBGL_KEY) === '1'; } catch { return false; }
};

/** Remembers the GPU failure and reloads once into WebGL mode instead of leaving a dead tab. */
const fallBackToWebGL = (reason: string) => {
  console.error('[Engine] GPU failure, switching to WebGL:', reason);
  try {
    if (localStorage.getItem(FORCE_WEBGL_KEY) === '1') return; // already in fallback: avoid reload loops
    localStorage.setItem(FORCE_WEBGL_KEY, '1');
  } catch { return; }
  window.location.reload();
};

export class Engine {
  public renderer: THREE.WebGPURenderer;
  public timer: THREE.Timer;
  private readonly forceWebGL = readForceWebGL();

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGPURenderer({ antialias: true, forceWebGL: this.forceWebGL });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    this.renderer.setSize(container.clientWidth, container.clientHeight, false);

    // Ensure the canvas is sized by CSS so physical resizing is fluid
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    // Use default shadow map (PCF) as VSM support in WebGPU/NodeMaterial can be sensitive
    this.renderer.shadowMap.enabled = true;

    // WebGL context loss (driver reset): reload instead of leaving a blank view
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setTimeout(() => window.location.reload(), 1500);
    });

    container.appendChild(this.renderer.domElement);
    this.timer = new THREE.Timer();
  }

  public async init() {
    try {
      await this.renderer.init();
      const device = (this.renderer.backend as any)?.device;
      device?.lost?.then((info: { reason: string; message: string }) => {
        if (info.reason !== 'destroyed') fallBackToWebGL(info.message || 'device lost');
      });
    } catch (e) {
      console.error("WebGPU initialization failed:", e);
      if (!this.forceWebGL) fallBackToWebGL(String(e));
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
