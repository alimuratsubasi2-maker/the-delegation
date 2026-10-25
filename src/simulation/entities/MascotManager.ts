import * as THREE from 'three/webgpu';

/**
 * Blocky pixel mascots drawn on top of the simulation.
 *
 * The original skinned characters still run on the GPU (movement, picking,
 * state), but are hidden; each mascot follows its character's CPU position and
 * state and animates procedurally: legs step while walking, it drops onto the
 * chair when seated, arms go up when waving or happy, body pulses when talking.
 */

export interface MascotSpec {
  index: number;
  color: string;
}

interface Mascot {
  root: THREE.Group;
  body: THREE.Group;
  legs: THREE.Mesh[];
  arms: THREE.Mesh[];
  yaw: number;
  last: THREE.Vector3 | null;
  phase: number;
}

/** Overall scale so the mascot is about as tall as the original characters. */
const SCALE = 1.35;
const WALK_SPEED_EPS = 0.004;

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const GEO = {
  body: box(0.72, 0.42, 0.5),
  arm: box(0.16, 0.16, 0.34),
  leg: box(0.09, 0.3, 0.34),
  eye: box(0.09, 0.11, 0.02),
};
const LEG_X = [-0.27, -0.11, 0.11, 0.27];
const EYE_MAT = new THREE.MeshBasicNodeMaterial({ color: 0x0a0a0a });

function buildMascot(color: string): Mascot {
  const mat = new THREE.MeshStandardNodeMaterial({ color: new THREE.Color(color), roughness: 0.7, metalness: 0.05 });
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const torso = new THREE.Mesh(GEO.body, mat);
  torso.position.y = 0.51;
  body.add(torso);

  const arms = [-1, 1].map((side) => {
    const arm = new THREE.Mesh(GEO.arm, mat);
    arm.position.set(side * 0.44, 0.47, 0);
    body.add(arm);
    return arm;
  });

  for (const x of [-0.17, 0.17]) {
    const eye = new THREE.Mesh(GEO.eye, EYE_MAT);
    eye.position.set(x, 0.61, 0.256);
    body.add(eye);
  }

  const legs = LEG_X.map((x) => {
    const leg = new THREE.Mesh(GEO.leg, mat);
    leg.position.set(x, 0.15, 0);
    root.add(leg);
    return leg;
  });

  root.scale.setScalar(SCALE);
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { root, body, legs, arms, yaw: 0, last: null, phase: Math.random() * 10 };
}

export class MascotManager {
  private group = new THREE.Group();
  private mascots = new Map<number, Mascot>();

  constructor(scene: THREE.Scene) {
    this.group.name = 'mascots';
    scene.add(this.group);
  }

  /** Rebuilds the mascot set for the active team. */
  public setCharacters(specs: MascotSpec[]): void {
    for (const m of this.mascots.values()) this.group.remove(m.root);
    this.mascots.clear();
    for (const s of specs) {
      const m = buildMascot(s.color);
      this.mascots.set(s.index, m);
      this.group.add(m.root);
    }
  }

  public update(
    delta: number,
    getPos: (i: number) => THREE.Vector3 | null,
    getState: (i: number) => string | undefined,
    getFacing: (i: number) => { x: number; z: number } | null,
  ): void {
    for (const [i, m] of this.mascots) {
      const pos = getPos(i);
      if (!pos) { m.root.visible = false; continue; }
      m.root.visible = true;
      const state = getState(i) || 'idle';
      m.phase += delta;

      // Facing: movement direction while walking, otherwise the POI facing the sim assigned
      const moved = m.last ? Math.hypot(pos.x - m.last.x, pos.z - m.last.z) : 0;
      let targetYaw = m.yaw;
      if (m.last && moved > WALK_SPEED_EPS) {
        targetYaw = Math.atan2(pos.x - m.last.x, pos.z - m.last.z);
      } else {
        const f = getFacing(i);
        if (f && state !== 'walk' && Math.abs(Math.hypot(f.x, f.z) - 1) < 0.05) targetYaw = Math.atan2(f.x, f.z);
      }
      let diff = targetYaw - m.yaw;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      m.yaw += diff * Math.min(1, delta * 10);
      m.last = pos.clone();

      const seated = state.startsWith('sit');
      const walking = state === 'walk' || moved > WALK_SPEED_EPS;
      const cheering = state === 'wave' || state === 'happy';
      const talking = state === 'talk';

      m.root.position.set(pos.x, pos.y + (seated ? 0.2 : 0), pos.z);
      m.root.rotation.y = m.yaw;

      // Legs: alternate steps while walking, folded away when seated
      m.legs.forEach((leg, k) => {
        leg.visible = !seated;
        const step = walking ? Math.sin(m.phase * 14 + (k % 2) * Math.PI) * 0.06 : 0;
        leg.position.y = 0.15 + Math.max(0, step);
      });

      // Body: bob when walking, breathe when idle, pulse when talking
      const bob = walking ? Math.abs(Math.sin(m.phase * 14)) * 0.05 : Math.sin(m.phase * 2) * 0.012;
      m.body.position.y = bob;
      const pulse = talking ? 1 + Math.sin(m.phase * 18) * 0.04 : 1;
      m.body.scale.set(1, pulse, 1);

      // Arms: raised and waving when cheering, small swing when walking
      m.arms.forEach((arm, k) => {
        const side = k === 0 ? -1 : 1;
        if (cheering) {
          arm.position.y = 0.66 + Math.sin(m.phase * 12 + k) * 0.05;
          arm.rotation.z = side * 0.5;
        } else {
          arm.position.y = 0.47;
          arm.rotation.z = 0;
          arm.rotation.x = walking ? Math.sin(m.phase * 14 + k * Math.PI) * 0.35 : 0;
        }
      });
    }
  }
}
