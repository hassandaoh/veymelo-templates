import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {drawSurface} from '../art';
import type {Layout} from '../layout';
import {mix, move, prog} from '../motion';
import {blobTexture, useThree, type Built} from '../three-kit';
import {T} from '../timing';

// The cup on the counter, in three.js: glazed ceramic on a saucer, the sun
// from the window behind it (so the cup has a rim of light and its shadow
// falls toward us), the steam lit from behind. A steel jug comes in and pours;
// the milk draws a heart on the coffee (art.ts, a canvas the surface wears).
// The canvas is clear, so the café behind it shows through.

type Parts = {pitcher: THREE.Group; spout: THREE.Object3D; stream: THREE.Mesh; surface: THREE.CanvasTexture; art: CanvasRenderingContext2D; steam: THREE.Sprite[]};
const ART = 1024;
const SURFACE_Y = 0.585;

const lathe = (points: [number, number][], seg = 96) => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg);

function wispTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.filter = 'blur(7px)';
  g.strokeStyle = 'rgba(255,248,236,0.7)';
  g.lineWidth = 16;
  g.lineCap = 'round';
  for (const dx of [-10, 12]) {
    g.beginPath();
    g.moveTo(64 + dx, 240);
    g.bezierCurveTo(30 + dx, 180, 100 + dx, 120, 60 + dx, 60);
    g.bezierCurveTo(40 + dx, 30, 70 + dx, 15, 64 + dx, 10);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function build(renderer: THREE.WebGLRenderer): Omit<Built<Parts>, 'renderer'> {
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  renderer.toneMappingExposure = 1.02;

  const ceramic = new THREE.MeshPhysicalMaterial({color: '#f6efe4', roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide});
  const saucer = new THREE.Mesh(lathe([[0.001, 0], [0.5, 0], [0.62, 0.012], [0.74, 0.04], [0.8, 0.07], [0.79, 0.08], [0.7, 0.055], [0.5, 0.035], [0.3, 0.035], [0.001, 0.035]]), ceramic);
  const cup = new THREE.Mesh(
    lathe([[0.001, 0.035], [0.24, 0.035], [0.27, 0.05], [0.33, 0.14], [0.39, 0.32], [0.425, 0.5], [0.44, 0.6], [0.445, 0.64], [0.43, 0.652], [0.415, 0.63], [0.4, 0.5], [0.35, 0.3], [0.25, 0.14], [0.001, 0.11]]),
    ceramic,
  );
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.042, 24, 48, Math.PI * 1.15), ceramic);
  handle.position.set(0.455, 0.37, 0);
  handle.rotation.z = -Math.PI * 0.575;
  for (const mesh of [saucer, cup, handle]) mesh.castShadow = mesh.receiveShadow = true;

  // the coffee: a disc just below the rim, wearing the drawn surface
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = ART;
  const art = canvas.getContext('2d')!;
  const surfaceTexture = new THREE.CanvasTexture(canvas);
  surfaceTexture.colorSpace = THREE.SRGBColorSpace;
  surfaceTexture.anisotropy = 8;
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.405, 96), new THREE.MeshPhysicalMaterial({map: surfaceTexture, roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.18}));
  coffee.rotation.x = -Math.PI / 2; // the drawing's bottom (the heart's point) toward us
  coffee.position.y = SURFACE_Y;
  coffee.receiveShadow = true;
  scene.add(saucer, cup, handle, coffee);

  // the jug: brushed steel, milk inside, a spout toward the cup and a handle
  const steel = new THREE.MeshStandardMaterial({color: '#dfe3e8', metalness: 1, roughness: 0.22, side: THREE.DoubleSide});
  const pitcher = new THREE.Group();
  const jug = new THREE.Mesh(lathe([[0.001, 0], [0.25, 0], [0.27, 0.03], [0.27, 0.35], [0.24, 0.55], [0.215, 0.68], [0.225, 0.7], [0.205, 0.7], [0.195, 0.68], [0.22, 0.55], [0.25, 0.35], [0.25, 0.03], [0.001, 0.03]], 64), steel);
  const milk = new THREE.Mesh(new THREE.CircleGeometry(0.2, 48), new THREE.MeshStandardMaterial({color: '#fbf3e6', roughness: 0.5}));
  milk.rotation.x = -Math.PI / 2;
  milk.position.y = 0.6;
  const lip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 24, 1, true), steel);
  lip.position.set(-0.25, 0.7, 0);
  lip.rotation.z = Math.PI / 2 + 0.35;
  const grip = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 16, 32, Math.PI), steel);
  grip.position.set(0.26, 0.38, 0);
  grip.rotation.z = -Math.PI / 2;
  const spout = new THREE.Object3D();
  spout.position.set(-0.33, 0.72, 0);
  pitcher.add(jug, milk, lip, grip, spout);
  for (const mesh of [jug, lip, grip]) mesh.castShadow = true;
  scene.add(pitcher);

  const stream = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({color: '#fbf3e6', roughness: 0.35}));
  stream.castShadow = true;
  scene.add(stream);

  // the steam, lit from behind by the sun in the window
  const wisp = wispTexture();
  const steam = [0, 1, 2].map(() => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({map: wisp, transparent: true, depthWrite: false, opacity: 0}));
    scene.add(sprite);
    return sprite;
  });

  // where the shadows fall (nothing else of the ground is drawn), and a soft contact shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({color: '#4a250e', opacity: 0.32}));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshBasicMaterial({map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.55}));
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.002;
  scene.add(ground, contact);

  scene.add(new THREE.HemisphereLight('#fff6ea', '#b88a60', 0.42));
  const sun = new THREE.DirectionalLight('#ffcf96', 4.4);
  sun.position.set(3.2, 5, -4.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = sc.bottom = -3;
  sc.right = sc.top = 3;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#fff3e6', 0.6);
  fill.position.set(-3, 4, 6);
  scene.add(fill);
  return {scene, camera, parts: {pitcher, spout, stream, surface: surfaceTexture, art, steam}};
}

function draw(b: Built<Parts>, f: number) {
  const {pitcher, spout, stream, surface, art, steam} = b.parts;
  // the camera leans in while the milk is poured
  const lean = prog(f, T.pitcher, T.pourEnd + 60 - T.pitcher, move);
  const d = mix(6.4, 5.4, lean);
  const elevation = mix(0.56, 0.62, lean);
  b.camera.position.set(mix(-0.5, 0.35, lean), 0.45 + d * Math.sin(elevation), d * Math.cos(elevation));
  b.camera.lookAt(0, 0.45, 0);

  // the surface: foam grows in rings, then the pour pulls through it into a heart
  const fill = prog(f, T.pour + 8, T.pull - T.pour - 16);
  const heart = prog(f, T.pull, 28, move);
  const pull = prog(f, T.pull - 2, 30, move);
  drawSurface(art, ART, fill, heart, pull, f);
  surface.needsUpdate = true;

  // the jug comes in, tips, pours, pulls through, and leaves
  const enter = prog(f, T.pitcher, 30, move);
  const leave = prog(f, T.pourEnd + 4, 40, move);
  const tip = mix(0.25, 1.05, prog(f, T.pour - 12, 22, move)) + 0.25 * prog(f, T.pour + 10, T.pourEnd - T.pour - 10) - 0.9 * leave;
  pitcher.position.set(mix(2.6, 0.92, enter) + 1.6 * leave, mix(2.7, 1.0, enter) + 1.4 * leave, mix(0.3, -0.1, pull));
  pitcher.rotation.z = tip;
  pitcher.visible = enter > 0 && leave < 1;
  pitcher.updateMatrixWorld(true);

  // the stream, from the spout to the coffee, thinning at the end
  const pouring = f >= T.pour && f < T.pourEnd;
  stream.visible = pouring;
  if (pouring) {
    const from = spout.getWorldPosition(new THREE.Vector3());
    // it lands near the middle while the foam grows, then pulls through from the near edge to the far one
    const to = new THREE.Vector3(0.02, SURFACE_Y, f < T.pull ? 0.04 : mix(0.24, -0.1, pull));
    const curve = new THREE.QuadraticBezierCurve3(from, new THREE.Vector3(from.x - 0.04, (from.y + to.y) / 2 + 0.05, from.z), to);
    const thin = Math.min(1, (T.pourEnd - f) / 12, (f - T.pour + 1) / 4);
    stream.geometry.dispose();
    stream.geometry = new THREE.TubeGeometry(curve, 24, 0.022 * thin, 12, false);
  }

  // steam: three wisps rising and swaying, strongest once the cup is made
  const strength = 0.25 + 0.45 * prog(f, T.pourEnd, 60);
  steam.forEach((sprite, i) => {
    const t = ((f / 140 + i / 3) % 1 + 1) % 1;
    sprite.position.set(Math.sin(f / 50 + i * 2) * 0.09 + (i - 1) * 0.08, 0.95 + t * 1.1, 0);
    sprite.scale.set(0.42 + t * 0.25, 0.85 + t * 0.4, 1);
    (sprite.material as THREE.SpriteMaterial).opacity = strength * Math.sin(t * Math.PI) * prog(f, T.inside - 30, 40);
  });
  b.renderer.render(b.scene, b.camera);
}

/** The cup, drawn in a square box centred on its place in the frame. */
export function Coffee3D({f, h, box}: {f: number; h: number; box: Layout}) {
  const size = Math.round(1700 * box.u);
  const ref = useThree<Parts>(size, size, 1, build, draw, true);
  const rise = prog(f, T.back, T.inside - T.back, move);
  // the cup rides up with the counter (scenes/Cafe.tsx), from well below the frame
  const below = (h + 420 * box.u - box.counter) * (1 - rise);
  return <canvas ref={ref} style={{position: 'absolute', left: box.cup.x - size / 2, top: box.cup.y - size / 2 + below, width: size, height: size}} />;
}
