
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three/webgpu';
import { DRACO_LIB_PATH } from '../constants';
import { NavMeshManager } from '../pathfinding/NavMeshManager';
import { PoiManager } from './PoiManager';

/** East wing: a copy of the base office rotated 180° and placed next to it. */
export const WING_OFFSET_X = 10;
/** Index offsets applied to the wing's POIs so they continue the base numbering. */
const WING_SPAWN_OFFSET = 5;
const WING_DESK_OFFSET = 5;
const WING_SEAT_OFFSET = 4;
/** Tolerance used to detect navmesh vertices lying on the seam edge. */
const SEAM_EPS = 0.01;

// ── Neon office theme ─────────────────────────────────────────
const NEON = 0xa855f7;
const NEON_LIGHT = 0xd8b4fe;
const WARM_LAMP = 0xffb347;
/** Where the Obsidian "brain" floats: the hall between both rooms. */
const BRAIN_POSITION = new THREE.Vector3(WING_OFFSET_X / 2, 0, 0);
const BRAIN_HOVER = 2.5;
export const BRAIN_POI_ID = 'brain-core';

type NeonStyle = { color: THREE.ColorRepresentation; roughness: number; metalness: number; emissive?: THREE.ColorRepresentation; emissiveIntensity?: number };

/** Night office: navy floor, dark wood desks, warm desk lamps, violet ambience. */
function neonStyleFor(name: string): NeonStyle {
  if (name.startsWith('colored')) return { color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.9, roughness: 0.5, metalness: 0 };
  if (name.includes('floor')) return { color: 0x141c33, roughness: 0.55, metalness: 0.25 };
  if (name.includes('pc') || name.includes('laptop')) return { color: 0x12141c, emissive: 0x6366f1, emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.5 };
  if (name.includes('flexo')) return { color: 0x2b2b2b, emissive: WARM_LAMP, emissiveIntensity: 1.8, roughness: 0.5, metalness: 0.3 };
  if (name.includes('board')) return { color: 0x1c2338, emissive: 0x4c1d95, emissiveIntensity: 0.25, roughness: 0.4, metalness: 0.3 };
  if (name.includes('desk') || name.includes('table') || name.includes('counter') || name.includes('cabinet')) {
    return { color: 0x3d2b20, roughness: 0.75, metalness: 0.05 };
  }
  if (name.includes('sofa')) return { color: 0x3b2a5c, roughness: 0.85, metalness: 0 };
  if (name.includes('chair')) return { color: 0x2b3040, roughness: 0.6, metalness: 0.3 };
  if (name.includes('plant')) return { color: 0x26442f, roughness: 0.85, metalness: 0 };
  return { color: 0x2b3142, roughness: 0.6, metalness: 0.3 };
}

export class WorldManager {
  private office: THREE.Group | null = null;
  private brainCrystal: THREE.Mesh | null = null;
  private brainTime = 0;

  constructor(
    private scene: THREE.Scene,
    private navMesh: NavMeshManager,
    private poiManager: PoiManager
  ) {}

  public async load(): Promise<void> {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_LIB_PATH);
    loader.setDRACOLoader(dracoLoader);
    const officeGltf = await loader.loadAsync(`${import.meta.env.BASE_URL}models/office.glb`);
    this.office = officeGltf.scene;
    this.scene.add(this.office);

    const baseNavMesh = this.office.getObjectByName('navMesh') as THREE.Mesh | undefined;
    const wing = this.createWing(this.office);
    this.office.add(wing);
    this.office.updateMatrixWorld(true);

    if (baseNavMesh) {
      this.navMesh.loadFromGeometry(this.buildExpandedNavMesh(baseNavMesh, wing.matrixWorld));
    }

    // Setup meshes (navmesh is hidden, already loaded above)
    this.office.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (name.includes('navmesh')) {
          mesh.visible = false;
        } else {
          mesh.receiveShadow = true;
          mesh.castShadow = true;

          // Apply specific material for WebGPU shadow compatibility as requested
          if (mesh.material) {
            const oldMat = mesh.material as THREE.MeshStandardMaterial;
            mesh.material = new THREE.MeshStandardNodeMaterial({ map: oldMat.map, ...neonStyleFor(name) });
          }
        }
      }
    });

    this.addNeonDecor();

    // Extract Points of Interest
    this.poiManager.loadFromGlb(this.office);
    this.addBrainPois();
  }

  /** Warm desk-cluster lighting, violet ambience and the floating Obsidian crystal. */
  private addNeonDecor(): void {
    if (!this.office) return;
    const neon = new THREE.MeshStandardNodeMaterial({ color: NEON, emissive: NEON, emissiveIntensity: 1.6 });

    // Warm pools of light over each desk cluster (base room and its rotated copy)
    for (const [x, z] of [[2.4, -2.3], [WING_OFFSET_X - 2.4, 2.3], [-3.6, 4.2], [WING_OFFSET_X + 3.6, -4.2]]) {
      const lamp = new THREE.PointLight(WARM_LAMP, 5, 5, 1.6);
      lamp.position.set(x, 1.6, z);
      this.office.add(lamp);
    }

    // Obsidian brain: glowing crystal floating above the hall between both rooms
    const brain = new THREE.Group();
    brain.position.copy(BRAIN_POSITION);
    const crystalMat = new THREE.MeshStandardNodeMaterial({
      color: 0x2e1065, emissive: NEON, emissiveIntensity: 1.6, roughness: 0.15, metalness: 0.6, flatShading: true,
    });
    this.brainCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), crystalMat);
    this.brainCrystal.scale.set(1, 1.5, 1);
    this.brainCrystal.position.y = BRAIN_HOVER;
    const shell = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.6, 0),
      new THREE.MeshBasicNodeMaterial({ color: NEON_LIGHT, wireframe: true, transparent: true, opacity: 0.5 }),
    );
    this.brainCrystal.add(shell);
    brain.add(this.brainCrystal);

    const glow = new THREE.PointLight(NEON, 6, 7, 1.5);
    glow.position.y = BRAIN_HOVER;
    brain.add(glow);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.68, 48), neon);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    brain.add(ring);
    this.office.add(brain);

    // Soft violet ambience over each room
    for (const x of [0, WING_OFFSET_X]) {
      const fill = new THREE.PointLight(0x7c3aed, 3, 12, 1.2);
      fill.position.set(x, 3.2, 0);
      this.office.add(fill);
    }
  }

  /** Work spot for the Obsidian agent (under the crystal) plus its spawn point. */
  private addBrainPois(): void {
    const facing = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    this.poiManager.addPoi({
      id: BRAIN_POI_ID,
      position: BRAIN_POSITION.clone().add(new THREE.Vector3(0, 0, 0.85)),
      quaternion: facing,
      arrivalState: 'idle',
      occupiedBy: null,
    });
    this.poiManager.addPoi({
      id: 'idle-spawn-brain',
      position: BRAIN_POSITION.clone().add(new THREE.Vector3(0, 0, -0.85)),
      quaternion: new THREE.Quaternion(),
      arrivalState: 'idle',
      occupiedBy: null,
    });
  }

  /** Animates the floating crystal. */
  public update(delta: number): void {
    if (!this.brainCrystal) return;
    this.brainTime += delta;
    this.brainCrystal.rotation.y += delta * 0.6;
    this.brainCrystal.position.y = BRAIN_HOVER + Math.sin(this.brainTime * 1.4) * 0.12;
    (this.brainCrystal.material as THREE.MeshStandardNodeMaterial).emissiveIntensity = 1.4 + Math.sin(this.brainTime * 2.2) * 0.5;
  }

  /**
   * Builds the east wing by cloning the base office (minus its navmesh),
   * rotating it 180° so both desk clusters face each other across the seam,
   * and renaming its POIs so desks/spawns/seats continue the base numbering.
   */
  private createWing(base: THREE.Group): THREE.Group {
    const wing = base.clone(true);
    wing.name = 'east-wing';
    wing.rotation.y = Math.PI;
    wing.position.set(WING_OFFSET_X, 0, 0);

    const toRemove: THREE.Object3D[] = [];
    wing.traverse((child) => {
      if (child.name.toLowerCase().includes('navmesh')) {
        toRemove.push(child);
        return;
      }
      const match = child.name.match(/^poi-([a-z0-9_]+)-(.+)$/);
      if (!match) return;
      const [, type, id] = match;
      const num = id.match(/^(spawn-)?(\d+)$/);
      if (num) {
        const offset = num[1] ? WING_SPAWN_OFFSET : type === 'sit_work' ? WING_DESK_OFFSET : WING_SEAT_OFFSET;
        child.name = `poi-${type}-${num[1] ?? ''}${Number(num[2]) + offset}`;
      } else {
        child.name = `poi-${type}-${id}-east`;
      }
    });
    toRemove.forEach((o) => o.removeFromParent());
    return wing;
  }

  /**
   * Merges the base navmesh with a transformed copy for the wing and stitches
   * the two facing boundary edges with a triangle strip so paths cross rooms.
   */
  private buildExpandedNavMesh(baseMesh: THREE.Mesh, wingMatrix: THREE.Matrix4): THREE.BufferGeometry {
    const base = baseMesh.geometry.clone().applyMatrix4(baseMesh.matrixWorld);
    const wing = base.clone().applyMatrix4(wingMatrix);

    const basePos = base.getAttribute('position');
    const wingPos = wing.getAttribute('position');
    const n = basePos.count;

    const positions: number[] = [];
    for (let i = 0; i < n; i++) positions.push(basePos.getX(i), basePos.getY(i), basePos.getZ(i));
    for (let i = 0; i < n; i++) positions.push(wingPos.getX(i), wingPos.getY(i), wingPos.getZ(i));

    const baseIndex = base.index ? Array.from(base.index.array) : [...Array(n).keys()];
    const indices: number[] = [...baseIndex, ...baseIndex.map((i) => i + n)];

    // Collect unique vertices on each seam edge, sorted along Z
    const seamVerts = (offset: number, pickMax: boolean): number[] => {
      let edgeX = pickMax ? -Infinity : Infinity;
      for (let i = 0; i < n; i++) {
        const x = positions[(i + offset) * 3];
        edgeX = pickMax ? Math.max(edgeX, x) : Math.min(edgeX, x);
      }
      const seen = new Map<string, number>();
      for (let i = 0; i < n; i++) {
        const v = i + offset;
        if (Math.abs(positions[v * 3] - edgeX) > SEAM_EPS) continue;
        const key = positions[v * 3 + 2].toFixed(4);
        if (!seen.has(key)) seen.set(key, v);
      }
      return [...seen.values()].sort((a, b) => positions[a * 3 + 2] - positions[b * 3 + 2]);
    };

    const a = seamVerts(0, true);  // base east edge
    const b = seamVerts(n, false); // wing west edge
    const z = (v: number) => positions[v * 3 + 2];

    // Zipper triangulation between the two sorted edges
    let i = 0;
    let j = 0;
    while (i < a.length - 1 || j < b.length - 1) {
      if (j >= b.length - 1 || (i < a.length - 1 && z(a[i + 1]) <= z(b[j + 1]))) {
        indices.push(a[i], b[j], a[i + 1]);
        i++;
      } else {
        indices.push(a[i], b[j], b[j + 1]);
        j++;
      }
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setIndex(indices);
    return merged;
  }

  /** The office keeps its purple neon border for every team, so team color is ignored. */
  public updateThemeColor(_color: string): void {}

  public getOffice(): THREE.Group | null {
    return this.office;
  }
}
