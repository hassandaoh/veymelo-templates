import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from './kit';
import {useThree} from './three-kit';

// 3D motion: soft shapes drop, bounce and settle for a brand intro. Peach room, pastel toys. Fraunces.
const BG = '#f6d8c8';
type Shape = {mesh: THREE.Mesh; at: number; x: number; z: number; ground: number; spin: number};
type Parts = {shapes: Shape[]};

/** where each shape lands, when; also used for the landing sounds */
export const DROPS = [0, 9, 18, 27, 36, 46];

const bounce = (t: number) => {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
};

function build() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 14, 30);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({color: BG, roughness: 0.95}));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const mat = (color: string) => new THREE.MeshPhysicalMaterial({color, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3});
  const defs: [THREE.BufferGeometry, string, number, number, number][] = [
    [new THREE.TorusGeometry(1.0, 0.42, 48, 96), '#b7a2ff', -1.6, -0.6, 1.42],
    [new THREE.SphereGeometry(0.95, 64, 48), '#ff7d68', 0.9, 0.2, 0.95],
    [new RoundedBoxGeometry(1.5, 1.5, 1.5, 8, 0.32), '#86dfbd', 2.9, -1.2, 0.75],
    [new THREE.CapsuleGeometry(0.5, 1.1, 16, 48), '#ffd36a', -3.2, 1.0, 1.05],
    [new THREE.ConeGeometry(0.85, 1.5, 64), '#78c1ff', -0.6, 1.9, 0.75],
    [new THREE.SphereGeometry(0.42, 48, 32), '#ff9fc4', 2.1, 1.6, 0.42],
  ];
  const shapes = defs.map(([g, c, x, z, ground], i) => {
    const mesh = new THREE.Mesh(g, mat(c));
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    return {mesh, at: DROPS[i], x, z, ground, spin: i % 2 ? 1 : -1};
  });
  scene.add(new THREE.HemisphereLight('#fff4ee', '#e8b8a4', 1.1));
  const sun = new THREE.DirectionalLight('#fff1e6', 2.2);
  sun.position.set(-4, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.radius = 10;
  sun.shadow.bias = -0.0005;
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -8;
  sc.right = 8;
  sc.top = 8;
  sc.bottom = -8;
  scene.add(sun);
  return {scene, camera, parts: {shapes}};
}

function draw(b: {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; parts: Parts}, f: number) {
  const t = f / 60;
  b.parts.shapes.forEach((s, i) => {
    const p = Math.min(1, Math.max(0, (f - s.at) / 50));
    const y = s.ground + 9 * (1 - bounce(p));
    s.mesh.visible = f >= s.at;
    s.mesh.position.set(s.x, y, s.z);
    // squash on the first contact
    const hit = Math.max(0, 1 - Math.abs(p - 0.364) * 14);
    s.mesh.scale.set(1 + 0.12 * hit, 1 - 0.16 * hit, 1 + 0.12 * hit);
    s.mesh.rotation.y = s.spin * t * 0.4 + i;
    if (i === 0) s.mesh.rotation.x = 0;
  });
  const m = k(f, 0, 300, inOut);
  const ang = 0.5 - m * 0.35;
  b.camera.position.set(Math.sin(ang) * 14.5, 6.4 - m * 0.8, Math.cos(ang) * 14.5);
  b.camera.lookAt(0.2, 1.1, 0.2);
  b.renderer.render(b.scene, b.camera);
}

export default function Shapes({w, h, res = 1}: ResultProps) {
  const f = useCurrentFrame();
  const ref = useThree<Parts>(w, h, res, build, draw);
  const a = k(f, 60, 96);
  return (
    <AbsoluteFill style={{background: BG}}>
      <canvas ref={ref} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', left: 80, top: 80, color: '#4a2f3a', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 104, lineHeight: 1, letterSpacing: '-0.03em', opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
        Soft by design.
      </div>
      <div style={{position: 'absolute', left: 84, top: 206, color: '#7a5260', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 30, letterSpacing: '0.3em', opacity: k(f, 80, 110)}}>PUFF STUDIO</div>
    </AbsoluteFill>
  );
}
