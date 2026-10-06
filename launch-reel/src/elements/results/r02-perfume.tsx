import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {AbsoluteFill, useCurrentFrame} from 'veymelo';
import {inOut, k, ResultProps} from './kit';
import {blobTexture, gradientTexture, useThree} from './three-kit';

// 3D product: a perfume in real glass, slow light, luxury. Blush studio, rose gold, amber. Instrument Serif.
const PLUM = '#3b1f2b';
type Parts = {bottle: THREE.Group; sweep: THREE.SpotLight; pearls: THREE.Mesh[]};

function lathe(points: [number, number][], seg = 96) {
  return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg);
}

function build(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = gradientTexture([
    [0, '#f1ddd6'],
    [0.6, '#e6c7c0'],
    [1, '#d9b1aa'],
  ]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(26, 16 / 9, 0.1, 100);

  // floor that fades into the backdrop
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({color: '#b98179', roughness: 0.7}));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  // podium
  const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.5, 96), new THREE.MeshStandardMaterial({color: '#ead2cc', roughness: 0.4}));
  podium.position.set(1.4, 0.25, 0);
  podium.castShadow = podium.receiveShadow = true;
  scene.add(podium);

  // the bottle: a rounded flask of thick glass, an amber liquid, a rose-gold collar and a faceted cap
  const bottle = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({color: '#fff6f8', metalness: 0, roughness: 0.03, transmission: 1, thickness: 0.5, ior: 1.5, attenuationColor: new THREE.Color('#f6d3dc'), attenuationDistance: 6, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1});
  const body = new THREE.Mesh(
    lathe([
      [0, 0],
      [0.82, 0],
      [0.95, 0.12],
      [1.0, 0.5],
      [1.0, 1.55],
      [0.92, 1.85],
      [0.6, 2.02],
      [0.28, 2.08],
      [0, 2.08],
    ]),
    glass,
  );
  body.castShadow = true;
  const liquid = new THREE.Mesh(
    lathe([
      [0, 0.16],
      [0.78, 0.16],
      [0.86, 0.5],
      [0.86, 1.42],
      [0, 1.42],
    ]),
    new THREE.MeshPhysicalMaterial({color: '#d98a3a', roughness: 0.15, clearcoat: 1, emissive: '#8a3f0a', emissiveIntensity: 0.35}),
  );
  const rose = new THREE.MeshStandardMaterial({color: '#e2a68f', metalness: 1, roughness: 0.18});
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 64), rose);
  collar.position.y = 2.18;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.8, 8, 1), rose);
  cap.position.y = 2.7;
  cap.castShadow = true;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(1.006, 1.006, 0.14, 96, 1, true), new THREE.MeshStandardMaterial({color: '#e8b8a6', metalness: 1, roughness: 0.25, side: THREE.DoubleSide}));
  label.position.y = 0.95;
  bottle.add(liquid, body, collar, cap, label);
  bottle.position.set(1.4, 0.5, 0);
  scene.add(bottle);
  // contact shadow
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({map: blobTexture(), transparent: true, depthWrite: false}));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(1.4, 0.505, 0);
  scene.add(shadow);
  // pearls
  const pearlMat = new THREE.MeshPhysicalMaterial({color: '#fff8f2', roughness: 0.15, metalness: 0, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color('#ffd6e0'), iridescence: 0.6});
  const pearls = [
    [-0.1, 0.24, 1.4, 0.24],
    [0.35, 0.16, 1.9, 0.16],
    [3.3, 0.2, 1.2, 0.2],
  ].map(([x, y, z, r]) => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), pearlMat);
    p.position.set(x, y, z);
    p.castShadow = true;
    scene.add(p);
    return p;
  });

  scene.add(new THREE.HemisphereLight('#fff1ec', '#a87a72', 0.45));
  renderer.toneMappingExposure = 0.92;
  const key = new THREE.DirectionalLight('#fff3e6', 2.2);
  key.position.set(-5, 8, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 6;
  const kc = key.shadow.camera as THREE.OrthographicCamera;
  kc.left = -6;
  kc.right = 6;
  kc.top = 6;
  kc.bottom = -6;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#ffc2d6', 2.5);
  rim.position.set(5, 4, -6);
  scene.add(rim);
  const sweep = new THREE.SpotLight('#ffffff', 160, 20, 0.22, 0.9, 1.6);
  sweep.target = bottle;
  scene.add(sweep);
  return {scene, camera, parts: {bottle, sweep, pearls}};
}

function draw(b: {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; parts: Parts}, f: number) {
  const m = k(f, 0, 300, inOut);
  b.parts.bottle.rotation.y = -0.6 + m * 1.1;
  b.parts.sweep.position.set(-6 + 12 * k(f, 10, 220, inOut), 3.5, 6);
  b.camera.position.set(-0.8 + m * 0.9, 2.5 + 0.3 * (1 - m), 11.6 - m * 1.4);
  b.camera.lookAt(0.55, 1.75, 0);
  b.renderer.render(b.scene, b.camera);
}

export default function Perfume({w, h, res = 1}: ResultProps) {
  const f = useCurrentFrame();
  const ref = useThree<Parts>(w, h, res, build, draw);
  const word = k(f, 24, 70);
  const sub = k(f, 50, 90);
  return (
    <AbsoluteFill style={{background: '#e6c7c0', overflow: 'hidden'}}>
      <canvas ref={ref} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', left: 150, top: 360, color: PLUM}}>
        <div style={{fontFamily: "'Instrument Serif Italic', serif", fontSize: 200, lineHeight: 1, letterSpacing: '-0.02em', opacity: word, transform: `translateY(${(1 - word) * 30}px)`, filter: `blur(${(1 - word) * 8}px)`}}>Lumière</div>
        <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 28, letterSpacing: '0.42em', marginTop: 34, marginLeft: 8, opacity: sub}}>EAU DE PARFUM · 50 ML</div>
      </div>
    </AbsoluteFill>
  );
}
