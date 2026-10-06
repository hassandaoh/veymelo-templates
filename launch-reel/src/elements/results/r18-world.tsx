import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from './kit';
import {gradientTexture, seeded, useThree} from './three-kit';

// 3D world: a cozy island at golden hour for a game trailer. Low-poly, warm light, cool water. Unbounded.
type Parts = {water: THREE.Mesh; base: Float32Array; blades: THREE.Group; clouds: THREE.Group[]; boats: THREE.Group[]; lamp: THREE.Mesh};

const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({color, flatShading: true, roughness: 0.85, metalness: 0, ...extra});

function tree(r: () => number) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6), flat('#7a5034'));
  trunk.position.y = 0.3;
  const greens = ['#3f9b5a', '#4daa62', '#2f7d4a', '#5bb36b'];
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.42 + r() * 0.2, 1.1 + r() * 0.5, 7), flat(greens[Math.floor(r() * 4)]));
  crown.position.y = 1.05;
  g.add(trunk, crown);
  g.traverse((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });
  return g;
}

function house(roof: string) {
  const g = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.9), flat('#fbf2e4'));
  walls.position.y = 0.4;
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.7, 4), flat(roof));
  top.position.y = 1.15;
  top.rotation.y = Math.PI / 4;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.02), flat('#7a4b30'));
  door.position.set(0, 0.19, 0.46);
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), flat('#ffcf7a', {emissive: '#ffb347', emissiveIntensity: 0.8}));
  win.position.set(0.32, 0.5, 0.46);
  g.add(walls, top, door, win);
  g.traverse((m) => {
    m.castShadow = true;
    m.receiveShadow = true;
  });
  return g;
}

function cloud(r: () => number) {
  const g = new THREE.Group();
  const mat = flat('#ffffff', {roughness: 1});
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 + r() * 0.6, 0), mat);
    s.position.set(i * 0.8 - 1.6, r() * 0.4, r() * 0.6);
    g.add(s);
  }
  return g;
}

function boat(sail: string) {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.5), flat('#8a5a3c'));
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), flat('#5a3a28'));
  mast.position.y = 0.7;
  const s = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 3), flat(sail));
  s.position.set(0.15, 0.75, 0);
  s.scale.z = 0.15;
  g.add(hull, mast, s);
  g.traverse((m) => (m.castShadow = true));
  return g;
}

function build() {
  const r = seeded(7);
  const scene = new THREE.Scene();
  scene.background = gradientTexture([
    [0, '#5b8fd6'],
    [0.5, '#a9c2ea'],
    [0.8, '#f3c6b8'],
    [1, '#f0b9a8'],
  ]);
  scene.fog = new THREE.Fog('#c9cbe0', 30, 110);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 300);

  scene.add(new THREE.HemisphereLight('#ffe8cc', '#3c6a8c', 1.25));
  const sun = new THREE.DirectionalLight('#ffd0a0', 2.6);
  sun.position.set(-18, 16, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = -16;
  sc.right = 16;
  sc.top = 16;
  sc.bottom = -16;
  sc.near = 1;
  sc.far = 70;
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  // water: a grid we move every frame
  const wg = new THREE.PlaneGeometry(220, 220, 110, 110);
  wg.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({color: '#1f9bb7', flatShading: true, roughness: 0.22, metalness: 0.05}));
  water.receiveShadow = true;
  scene.add(water);
  const base = Float32Array.from(wg.attributes.position.array as Float32Array);

  // the island: a low cylinder of rock with a grass top and a sand ring
  const rock = new THREE.Mesh(new THREE.CylinderGeometry(9, 7, 3.2, 14, 2), flat('#c9935f'));
  rock.position.y = -0.9;
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 9.9, 0.5, 18), flat('#f1d9a3'));
  sand.position.y = 0.05;
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(8.4, 8.8, 0.6, 16), flat('#7cc36a'));
  grass.position.y = 0.45;
  const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(3.6, 1), flat('#6db55c'));
  hill.scale.set(1.2, 0.55, 1);
  hill.position.set(-2.8, 0.7, -2.6);
  for (const m of [rock, sand, grass, hill]) {
    m.receiveShadow = true;
    m.castShadow = true;
    scene.add(m);
  }
  // trees, kept off the houses and the path
  let placed = 0;
  while (placed < 26) {
    const a = r() * Math.PI * 2;
    const d = 2 + r() * 6;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (x > -1 && x < 5 && z > -1 && z < 4) continue;
    const t = tree(r);
    const y = Math.hypot(x + 2.8, z + 2.6) < 3.6 ? 1.6 : 0.75;
    t.position.set(x, y, z);
    t.scale.setScalar(0.8 + r() * 0.5);
    scene.add(t);
    placed++;
  }
  const roofs = ['#d9583b', '#e07a4f', '#c24a3a', '#e8a04e'];
  [
    [0.5, 0.75, 1.2, 0.3],
    [2.6, 0.75, 0.2, -0.4],
    [3.4, 0.75, 2.6, 0.6],
    [1.2, 0.75, 3.2, -0.2],
  ].forEach(([x, y, z, ry], i) => {
    const hs = house(roofs[i]);
    hs.position.set(x, y, z);
    hs.rotation.y = ry;
    scene.add(hs);
  });
  // windmill on the hill
  const mill = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 2.6, 8), flat('#f4ead8'));
  tower.position.y = 1.3;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.6, 8), flat('#a8442f'));
  cap.position.y = 2.9;
  const blades = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.7, 0.04), flat('#fff7ea'));
    bl.position.y = 0.85;
    const arm = new THREE.Group();
    arm.add(bl);
    arm.rotation.z = (i * Math.PI) / 2;
    blades.add(arm);
  }
  blades.position.set(0, 2.5, 0.62);
  mill.add(tower, cap, blades);
  mill.traverse((m) => (m.castShadow = true));
  mill.position.set(-2.8, 1.9, -2.2);
  mill.rotation.y = 0.5;
  scene.add(mill);
  // lighthouse on the point
  const lh = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.42 - i * 0.05, 0.47 - i * 0.05, 0.7, 10), flat(i % 2 ? '#d94a3a' : '#fbf6ee'));
    seg.position.y = 0.35 + i * 0.7;
    seg.castShadow = true;
    lh.add(seg);
  }
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 10), flat('#fff1b8', {emissive: '#ffd36b', emissiveIntensity: 1.4}));
  lamp.position.y = 3.05;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.4, 10), flat('#d94a3a'));
  roof.position.y = 3.45;
  lh.add(lamp, roof);
  lh.position.set(6.6, 0.3, 4.2);
  scene.add(lh);
  // foam where the water meets the sand
  const foam = new THREE.Mesh(new THREE.RingGeometry(9.7, 10.7, 48), new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.55}));
  foam.rotation.x = -Math.PI / 2;
  foam.position.y = -0.18;
  scene.add(foam);
  // a dock
  const dock = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 3.2), flat('#9a6a46'));
  dock.position.set(4.6, 0.2, 8.6);
  dock.castShadow = dock.receiveShadow = true;
  scene.add(dock);

  const clouds: THREE.Group[] = [];
  for (let i = 0; i < 7; i++) {
    const c = cloud(r);
    c.position.set(-40 + i * 13, 12 + r() * 6, -30 + r() * 20);
    c.scale.setScalar(1.2 + r());
    scene.add(c);
    clouds.push(c);
  }
  const boats = ['#fff6ea', '#ffcf6b'].map((sail) => {
    const b = boat(sail);
    scene.add(b);
    return b;
  });
  return {scene, camera, parts: {water, base, blades, clouds, boats, lamp}};
}

function draw(b: {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; parts: Parts}, f: number) {
  const t = f / 60;
  const {water, base, blades, clouds, boats} = b.parts;
  const pos = water.geometry.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < arr.length; i += 3) {
    const x = base[i], z = base[i + 2];
    arr[i + 1] = -0.35 + Math.sin(x * 0.35 + t * 1.3) * 0.16 + Math.cos(z * 0.42 + t * 1.1) * 0.14 + Math.sin((x + z) * 0.9 + t * 2.2) * 0.05;
  }
  pos.needsUpdate = true;
  water.geometry.computeVertexNormals();
  blades.rotation.z = -t * 1.6;
  clouds.forEach((c, i) => (c.position.x = -40 + i * 13 + ((t * 0.9) % 13)));
  boats[0].position.set(Math.cos(t * 0.18 + 1) * 13, -0.1 + Math.sin(t * 2) * 0.06, Math.sin(t * 0.18 + 1) * 13);
  boats[0].rotation.y = -(t * 0.18 + 1);
  boats[1].position.set(Math.cos(-t * 0.13 + 3.6) * 15.5, -0.1 + Math.sin(t * 2.3) * 0.06, Math.sin(-t * 0.13 + 3.6) * 15.5);
  boats[1].rotation.y = t * 0.13 - 3.6 + Math.PI;
  // the camera: a slow orbit that comes in and down
  const m = k(f, 0, 300, inOut);
  const ang = -0.9 + m * 0.7;
  const rad = 22 - m * 5;
  b.camera.position.set(Math.sin(ang) * rad, 6.2 - m * 1.8, Math.cos(ang) * rad);
  b.camera.lookAt(0.8, 2.6 - m * 0.4, 0.8);
  b.renderer.render(b.scene, b.camera);
}

export default function World({w, h, res = 1}: ResultProps) {
  const f = useCurrentFrame();
  const ref = useThree<Parts>(w, h, res, build, draw);
  const title = k(f, 40, 80);
  return (
    <AbsoluteFill style={{background: '#f6c9a0'}}>
      <canvas ref={ref} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', left: 120, top: 100, color: '#fff', fontFamily: 'Unbounded, sans-serif', textShadow: '0 4px 30px rgba(60,30,20,0.35)', opacity: title, transform: `translateY(${(1 - title) * 24}px)`}}>
        <div style={{fontSize: 30, fontWeight: 600, letterSpacing: '0.3em', opacity: 0.9}}>A COZY ISLAND ADVENTURE</div>
        <div style={{fontSize: 150, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 12}}>Harbor Tales</div>
      </div>
    </AbsoluteFill>
  );
}
