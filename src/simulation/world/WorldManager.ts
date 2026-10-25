
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three/webgpu';
import { getAgentSet } from '../../data/agents';
import { useTeamStore } from '../../integration/store/teamStore';
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

export class WorldManager {
  private office: THREE.Group | null = null;

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

    // Get current AgentSet color
    const { selectedAgentSetId, customSystems } = useTeamStore.getState();
    const activeSet = getAgentSet(selectedAgentSetId, customSystems);
    const themeColor = new THREE.Color(activeSet.color);

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

            // Check if mesh name starts with "colored" to apply thematic color
            const isColoredMesh = name.startsWith('colored');

            mesh.material = new THREE.MeshStandardNodeMaterial({
              color: isColoredMesh ? themeColor : oldMat.color,
              map: oldMat.map,
              roughness: 1,
              metalness: 0.35,
            });
          }
        }
      }
    });

    // Extract Points of Interest
    this.poiManager.loadFromGlb(this.office);
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

  public updateThemeColor(color: string): void {
    if (!this.office) return;

    const themeColor = new THREE.Color(color);

    this.office.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();

        if (name.startsWith('colored') && mesh.material) {
          // Update existing material color if it's a NodeMaterial
          // or replace it if needed. Since we already replaced them in load(),
          // we can just update the color property.
          if ((mesh.material as any).color) {
            (mesh.material as any).color.copy(themeColor);
          }
        }
      }
    });
  }

  public getOffice(): THREE.Group | null {
    return this.office;
  }
}
