import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {Easing} from 'veymelo';
import {LIGHT, PALETTE} from '../content';
import {inOut, k, mix} from '../kit';
import {seeded} from '../three-kit';
import {T} from '../timing';
import {CAPE, HARBOUR, HILL, coast, height, noise, onLand} from './island';
import {boat, cloud, fir, flat, gull, house, lighthouse, roundTree, windmill} from './props';

// The world, built once and drawn on every frame: the island, the sea and
// the sky; the boat sailing in, the camera rising with it, dusk falling,
// the windows and the lighthouse coming on.

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const WAKE = 60;
const dir = (a: number) => V(Math.cos(a), 0, Math.sin(a));

/** Where the boat ties up: beside the end of the jetty. */
const JETTY = {from: coast(HARBOUR) - 0.6, to: coast(HARBOUR) + 2.6};
const MOOR = dir(HARBOUR).multiplyScalar(JETTY.to - 0.7).add(dir(HARBOUR + Math.PI / 2).multiplyScalar(0.8));
/** The boat's way in, from the open sea to the jetty. */
const ROUTE = new THREE.CubicBezierCurve3(V(-9, 0, 44), V(-7, 0, 32), MOOR.clone().add(dir(HARBOUR).multiplyScalar(8)).add(V(-3, 0, 0)), MOOR);
const sail = Easing.bezier(0.22, 0.12, 0.25, 1); // under way at once, slowing into the harbour
export const boatAt = (f: number) => ROUTE.getPoint(sail(Math.min(1, Math.max(0, f / T.dock))));
const headingAt = (f: number) => ROUTE.getTangent(Math.min(0.999, Math.max(0.001, sail(Math.min(1, f / T.dock))))).setY(0).normalize();

/** Where the camera comes to rest, and what it looks at. */
const REST = {at: V(7.5, 8.6, 28.5), look: V(-1.6, 4.6, 2.6)};
export const LIGHTHOUSE = (() => {
  const [x, z] = onLand(CAPE, 0.07);
  return V(x, height(x, z), z);
})();

/**
 * The camera: low and three-quarter behind the boat for the first beat, then
 * one path that rises and draws toward the island while the boat sails on
 * ahead into the harbour. Always toward the island, never in and out again.
 */
const chaseAt = (f: number) => {
  const h = headingAt(f);
  return boatAt(f).addScaledVector(h, -7).addScaledVector(V(-h.z, 0, h.x), -2.6).setY(1.5);
};
const CAMERA = new THREE.CubicBezierCurve3(chaseAt(0), chaseAt(0).add(V(2, 1.2, -9)), V(5, 7.2, 34), REST.at);
const glide = Easing.bezier(0.3, 0.1, 0.3, 1);
export function cameraAt(f: number) {
  const ahead = boatAt(f).addScaledVector(headingAt(f), 12).add(V(0, 0.9, 0));
  const path = CAMERA.getPoint(glide(k(f, 0, 460, (x: number) => x)));
  return {at: chaseAt(f).lerp(path, k(f, 20, 240, inOut)), look: ahead.lerp(REST.look, k(f, 60, 440, inOut))};
}

/** How squarely the lighthouse beam faces the camera: 1 when it looks straight down the lens. */
const BEAM_SPEED = -0.032; // radians a frame
const toCamera = Math.atan2(-(REST.at.z - LIGHTHOUSE.z), REST.at.x - LIGHTHOUSE.x);
export const beamAngle = (f: number) => toCamera + (f - T.sweep) * BEAM_SPEED;
export function glare(f: number) {
  if (f < T.lamp) return 0;
  const facing = Math.cos(beamAngle(f) - toCamera);
  return Math.max(0, facing) ** 60 * k(f, T.lamp, T.lamp + 30);
}
export const dusk = (f: number) => k(f, T.duskFrom, T.duskTo, inOut);

type Parts = {
  composer: EffectComposer;
  sky: THREE.ShaderMaterial;
  sun: THREE.DirectionalLight;
  ambient: THREE.HemisphereLight;
  water: THREE.Mesh;
  waterBase: Float32Array;
  shallow: Float32Array;
  foam: THREE.MeshBasicMaterial;
  windows: THREE.MeshStandardMaterial[];
  sails: THREE.Group;
  lamp: THREE.MeshStandardMaterial;
  beam: THREE.Group;
  beamMaterial: THREE.MeshBasicMaterial;
  flare: THREE.Sprite;
  boat: THREE.Group;
  lantern: THREE.MeshStandardMaterial;
  wake: THREE.InstancedMesh;
  gulls: {group: THREE.Group; wings: [THREE.Mesh, THREE.Mesh]}[];
  clouds: THREE.Group[];
  cloudMaterial: THREE.MeshStandardMaterial;
};

function terrain() {
  const g = new THREE.PlaneGeometry(52, 52, 130, 130);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setY(i, Math.max(-3.2, height(p.getX(i), p.getZ(i))));
  const geo = g.toNonIndexed();
  geo.computeVertexNormals();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const nor = geo.attributes.normal as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 3) {
    const y = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3;
    const x = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3;
    const z = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    const up = nor.getY(i);
    if (y < -0.25) c.set(PALETTE.seaFloor);
    else if (y < 0.16) c.set(PALETTE.sand);
    else if (up < 0.72) c.set(PALETTE.rock);
    else c.set(PALETTE.grass[Math.min(2, Math.floor(noise(x * 0.45, z * 0.45) * 3))]);
    for (let j = 0; j < 3; j++) colors.set([c.r, c.g, c.b], (i + j) * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.95}));
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

function skyMaterial() {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {top: {value: new THREE.Color()}, low: {value: new THREE.Color()}, sunDir: {value: V(0, 0, 1)}, sunColor: {value: new THREE.Color()}},
    vertexShader: 'varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 low; uniform vec3 sunDir; uniform vec3 sunColor; varying vec3 vDir;
      void main() {
        float h = clamp(vDir.y, 0.0, 1.0);
        vec3 c = mix(low, top, pow(h, 0.55));
        float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
        c += sunColor * (pow(s, 8.0) * 0.35 + pow(s, 600.0) * 2.5);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
}

/** A soft round glow, for the lamp's glare. */
function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,250,235,1)');
  grd.addColorStop(0.2, 'rgba(255,236,190,0.55)');
  grd.addColorStop(1, 'rgba(255,220,170,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function build(renderer: THREE.WebGLRenderer) {
  const r = seeded(11);
  const size = renderer.getSize(new THREE.Vector2());
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#f2cfae', 45, 170);
  const camera = new THREE.PerspectiveCamera(34, size.x / size.y, 0.1, 600);

  const sky = skyMaterial();
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), sky));

  const ambient = new THREE.HemisphereLight(LIGHT.golden.ambient, LIGHT.golden.ground, LIGHT.golden.ambientPower);
  const sun = new THREE.DirectionalLight(LIGHT.golden.sun, LIGHT.golden.sunPower);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  const sc = sun.shadow.camera as THREE.OrthographicCamera;
  sc.left = sc.bottom = -18;
  sc.right = sc.top = 18;
  sc.near = 1;
  sc.far = 120;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.02;
  scene.add(ambient, sun, sun.target);

  scene.add(terrain());

  // the sea: a grid moved every frame, lighter over the shallows
  const wg = new THREE.PlaneGeometry(360, 360, 150, 150);
  wg.rotateX(-Math.PI / 2);
  const waterBase = Float32Array.from(wg.attributes.position.array as Float32Array);
  const shallow = new Float32Array(wg.attributes.position.count);
  for (let i = 0; i < shallow.length; i++) shallow[i] = Math.max(0, 1 - Math.max(0, -height(waterBase[i * 3], waterBase[i * 3 + 2])) / 2.2);
  wg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(shallow.length * 3), 3));
  const water = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({vertexColors: true, flatShading: true, roughness: 0.52, metalness: 0.02, transparent: true, opacity: 0.92}));
  water.receiveShadow = true;
  scene.add(water);

  // foam where the sea meets the sand, following the coast
  const ring: number[] = [];
  const N = 220;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    let lo = 0, hi = 20;
    for (let j = 0; j < 24; j++) {
      const m = (lo + hi) / 2;
      if (height(Math.cos(a) * m, Math.sin(a) * m) > -0.06) lo = m;
      else hi = m;
    }
    for (const out of [-0.12, 0.5]) ring.push(Math.cos(a) * (lo + out), 0.03, Math.sin(a) * (lo + out));
  }
  const foamGeo = new THREE.BufferGeometry();
  foamGeo.setAttribute('position', new THREE.Float32BufferAttribute(ring, 3));
  const index: number[] = [];
  for (let i = 0; i < N; i++) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  foamGeo.setIndex(index);
  const foam = new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false});
  scene.add(new THREE.Mesh(foamGeo, foam));

  // the jetty
  const jetty = new THREE.Group();
  const deckLength = JETTY.to - JETTY.from;
  const plank = new THREE.Mesh(new THREE.BoxGeometry(deckLength, 0.1, 0.8), flat('#a8774e'));
  plank.position.set(deckLength / 2, 0.42, 0);
  jetty.add(plank);
  for (let i = 0; i <= 4; i++) {
    for (const side of [-0.36, 0.36]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 5), flat('#6b4129'));
      post.position.set((deckLength * i) / 4, -0.1, side);
      jetty.add(post);
    }
  }
  jetty.position.copy(dir(HARBOUR).multiplyScalar(JETTY.from));
  jetty.rotation.y = -HARBOUR;
  jetty.traverse(m => (m.castShadow = m.receiveShadow = true));
  scene.add(jetty);

  // the houses round the harbour, facing the water; their windows light at dusk
  const windows: THREE.MeshStandardMaterial[] = [];
  const homes: THREE.Vector3[] = [];
  [
    [-0.5, 0.2],
    [-0.27, 0.3],
    [-0.04, 0.2],
    [0.2, 0.3],
    [0.42, 0.2],
    [0.08, 0.44],
    [-0.36, 0.46],
  ].forEach(([da, inland], i) => {
    const a = HARBOUR + da;
    const [x, z] = onLand(a, inland);
    const {group, light} = house(PALETTE.roofs[i % PALETTE.roofs.length], noise(i * 3.1, 2));
    group.position.set(x, height(x, z) - 0.05, z);
    group.rotation.y = Math.atan2(Math.cos(a), Math.sin(a));
    scene.add(group);
    windows.push(light);
    homes.push(group.position);
  });

  const mill = windmill();
  mill.group.position.set(HILL.x, height(HILL.x, HILL.z) - 0.1, HILL.z);
  mill.group.rotation.y = 0.55;
  scene.add(mill.group);

  const tower = lighthouse();
  tower.group.position.copy(LIGHTHOUSE).setY(LIGHTHOUSE.y - 0.05);
  scene.add(tower.group);

  // trees on the grass, kept clear of the houses, the windmill, the lighthouse and the harbour
  const keep = [...homes, mill.group.position, tower.group.position];
  for (let tries = 0, placed = 0; tries < 900 && placed < 95; tries++) {
    const x = (r() - 0.5) * 30, z = (r() - 0.5) * 30;
    const y = height(x, z);
    if (y < 0.3) continue;
    if (keep.some(p => Math.hypot(p.x - x, p.z - z) < 1.5)) continue;
    const a = Math.atan2(z, x);
    if (Math.abs(Math.atan2(Math.sin(a - HARBOUR), Math.cos(a - HARBOUR))) < 0.35 && Math.hypot(x, z) > coast(a) * 0.5) continue;
    if (noise(x * 0.35 + 7, z * 0.35) < 0.38) continue; // clusters, with clearings
    const t = noise(x * 0.5, z * 0.5 + 9) > 0.5 ? fir(r) : roundTree(r);
    t.position.set(x, y - 0.05, z);
    t.scale.setScalar(0.75 + r() * 0.55);
    t.rotation.y = r() * Math.PI * 2;
    scene.add(t);
    placed++;
  }
  // boulders on the beach and the cape
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2;
    const [x, z] = onLand(a, -0.02 + r() * 0.06);
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25 + r() * 0.35, 0), flat('#a99a8c'));
    rock.position.set(x, height(x, z) + 0.05, z);
    rock.rotation.set(r(), r(), r());
    rock.castShadow = rock.receiveShadow = true;
    scene.add(rock);
  }

  const cloudMaterial = new THREE.MeshStandardMaterial({color: LIGHT.golden.cloud, flatShading: true, roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.25});
  const clouds: THREE.Group[] = [];
  // a few clouds, at different heights and distances, never in a row
  for (const [x, y, z, size] of [[-95, 12, -95, 3.4], [-40, 22, -120, 4.4], [8, 10, -80, 2.2], [52, 17, -110, 3.6], [105, 26, -140, 4.8], [140, 11, -90, 2.6]]) {
    const c = cloud(r, cloudMaterial);
    c.position.set(x, y, z);
    c.scale.set(size, size * (0.8 + r() * 0.3), size);
    c.userData.x = x;
    scene.add(c);
    clouds.push(c);
  }

  const hero = boat();
  scene.add(hero.group);
  const wake = new THREE.InstancedMesh(new THREE.CircleGeometry(0.5, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false}), WAKE);
  wake.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(WAKE * 3), 3);
  scene.add(wake);

  const gulls = [0, 1, 2].map(() => {
    const bird = gull();
    scene.add(bird.group);
    return bird;
  });

  const flare = new THREE.Sprite(new THREE.SpriteMaterial({map: glowTexture(), transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, opacity: 0}));
  flare.position.copy(LIGHTHOUSE).add(V(0, 3.29, 0));
  scene.add(flare);

  const target = new THREE.WebGLRenderTarget(size.x, size.y, {type: THREE.HalfFloatType, samples: 4});
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(1);
  composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(size.clone(), 0.38, 0.5, 0.92));
  composer.addPass(new OutputPass());

  const parts: Parts = {composer, sky, sun, ambient, water, waterBase, shallow, foam, windows, sails: mill.sails, lamp: tower.lamp, beam: tower.beam, beamMaterial: tower.beamMaterial, flare, boat: hero.group, lantern: hero.lantern, wake, gulls, clouds, cloudMaterial};
  return {scene, camera, parts};
}

const lerpColor = (a: string, b: string, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t);

export function draw(b: {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; parts: Parts}, f: number) {
  const p = b.parts;
  const t = f / 60;
  const d = dusk(f);
  const G = LIGHT.golden, D = LIGHT.dusk;

  // the light: golden hour going down into dusk, the sun sinking in the west
  const sunDir = V(0.9, mix(0.36, 0.08, d), -0.42).normalize(); // to the right, past the lighthouse
  p.sun.position.copy(sunDir).multiplyScalar(60);
  p.sun.color.copy(lerpColor(G.sun, D.sun, d));
  p.sun.intensity = mix(G.sunPower, D.sunPower, d);
  p.ambient.color.copy(lerpColor(G.ambient, D.ambient, d));
  p.ambient.groundColor.copy(lerpColor(G.ground, D.ground, d));
  p.ambient.intensity = mix(G.ambientPower, D.ambientPower, d);
  p.sky.uniforms.top.value.copy(lerpColor(G.skyTop, D.skyTop, d));
  p.sky.uniforms.low.value.copy(lerpColor(G.skyLow, D.skyLow, d));
  p.sky.uniforms.sunDir.value.copy(sunDir);
  p.sky.uniforms.sunColor.value.copy(lerpColor(G.sun, D.sun, d));
  (b.scene.fog as THREE.Fog).color.copy(lerpColor(G.skyLow, D.skyLow, d)).lerp(lerpColor(G.skyTop, D.skyTop, d), 0.25);
  p.cloudMaterial.color.copy(lerpColor(G.cloud, D.cloud, d));
  p.cloudMaterial.emissive.copy(lerpColor(G.cloud, D.cloud, d));

  // the sea
  const pos = p.water.geometry.attributes.position as THREE.BufferAttribute;
  const col = p.water.geometry.attributes.color as THREE.BufferAttribute;
  const deep = lerpColor(G.water, D.water, d), shoal = lerpColor(G.shallow, D.shallow, d);
  const arr = pos.array as Float32Array;
  for (let i = 0, v = 0; i < arr.length; i += 3, v++) {
    const x = p.waterBase[i], z = p.waterBase[i + 2];
    arr[i + 1] = -0.12 + Math.sin(x * 0.32 + t * 1.2) * 0.12 + Math.cos(z * 0.38 + t * 1.0) * 0.1 + Math.sin((x + z) * 0.85 + t * 2.1) * 0.035;
    const s = p.shallow[v];
    col.setXYZ(v, mix(deep.r, shoal.r, s), mix(deep.g, shoal.g, s), mix(deep.b, shoal.b, s));
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  p.water.geometry.computeVertexNormals();
  p.foam.opacity = 0.42 + 0.14 * Math.sin(t * 1.9);

  // the boat: sailing in, rocking on the swell, tied up by the jetty
  const at = boatAt(f);
  const h = headingAt(f);
  p.boat.position.set(at.x, -0.02 + Math.sin(t * 1.9) * 0.05, at.z);
  p.boat.rotation.set(Math.sin(t * 1.6) * 0.05, -Math.atan2(h.z, h.x), Math.sin(t * 1.3 + 1) * 0.03);
  p.lantern.emissiveIntensity = 2.2 * k(f, T.windows - 16, T.windows - 6);
  // its wake: the way it has come, spreading and fading
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const tint = new THREE.Color();
  for (let j = 0; j < WAKE; j++) {
    const back = f - (j + 1) * 2;
    const age = (j + 1) / WAKE;
    const w = boatAt(Math.max(0, back));
    const speed = Math.min(1, w.distanceTo(boatAt(Math.max(0, back - 2))) / 0.14);
    q.setFromAxisAngle(V(0, 1, 0), -Math.atan2(headingAt(back).z, headingAt(back).x));
    m.compose(V(w.x, 0.07, w.z), q, V(0.7 + age * 1.6, 1, 0.22 + age * 1.5));
    p.wake.setMatrixAt(j, m);
    p.wake.setColorAt(j, tint.setScalar(back < 0 ? 0 : (1 - age) ** 1.5 * 0.09 * speed));
  }
  p.wake.instanceMatrix.needsUpdate = true;
  p.wake.instanceColor!.needsUpdate = true;

  p.sails.rotation.z = -t * 1.3;
  p.windows.forEach((w, i) => (w.emissiveIntensity = 2.6 * k(f, T.windows + i * 11, T.windows + i * 11 + 8)));
  // the lighthouse: the lamp on, the beam turning, a glare as it looks down the lens
  const lit = k(f, T.lamp, T.lamp + 6);
  p.lamp.emissiveIntensity = 4 * lit;
  p.beam.rotation.y = beamAngle(f);
  p.beamMaterial.opacity = 0.2 * k(f, T.lamp + 4, T.lamp + 34);
  const g = glare(f);
  p.flare.material.opacity = Math.min(0.9, 0.25 * lit + g);
  p.flare.scale.setScalar(2.5 + 42 * g);

  p.gulls.forEach((bird, i) => {
    const a = t * (0.5 + i * 0.08) + i * 2.1;
    const c = MOOR.clone().multiplyScalar(0.8);
    bird.group.position.set(c.x + Math.cos(a) * (4 + i), 5 + i * 0.7 + Math.sin(t * 1.3 + i) * 0.3, c.z + Math.sin(a) * (4 + i));
    bird.group.rotation.y = -a;
    bird.group.visible = f > T.gulls - 60;
    const flap = Math.sin(t * 9 + i * 1.7) * 0.5;
    bird.wings[0].rotation.x = flap;
    bird.wings[1].rotation.x = -flap;
  });
  p.clouds.forEach((c, i) => (c.position.x = c.userData.x + t * (i % 2 ? 0.7 : 0.45))); // drifting, from the frame alone

  const view = cameraAt(f);
  b.camera.position.copy(view.at);
  b.camera.lookAt(view.look);
  p.composer.render();
}
