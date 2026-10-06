import * as THREE from 'three';
import {PALETTE} from '../content';

// The things on the island, low-poly and flat-shaded: each a group standing
// on its own origin, so it can be put at height(x, z).

export const flat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({color, flatShading: true, roughness: 0.9, metalness: 0, ...extra});

const shadows = <O extends THREE.Object3D>(g: O, receive = true): O => {
  g.traverse(m => {
    m.castShadow = true;
    m.receiveShadow = receive;
  });
  return g;
};

const GREENS = PALETTE.trees.map(c => flat(c));
const TRUNK = flat('#7a5034');

/** A fir: two or three cones stacked, a little crooked. */
export function fir(r: () => number) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.5, 5), TRUNK);
  trunk.position.y = 0.25;
  g.add(trunk);
  const green = GREENS[Math.floor(r() * GREENS.length)];
  const tiers = 2 + Math.floor(r() * 2);
  for (let i = 0; i < tiers; i++) {
    const s = 1 - i * 0.24;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55 * s, 0.9 * s, 7), green);
    cone.position.y = 0.55 + i * 0.42;
    cone.rotation.y = r() * Math.PI;
    g.add(cone);
  }
  return shadows(g);
}

/** A round tree: a lumpy ball on a trunk. */
export function roundTree(r: () => number) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.6, 5), TRUNK);
  trunk.position.y = 0.3;
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5 + r() * 0.15, 0), GREENS[Math.floor(r() * GREENS.length)]);
  crown.position.y = 0.85;
  crown.scale.set(1, 0.85 + r() * 0.2, 1);
  crown.rotation.set(r(), r(), r());
  g.add(trunk, crown);
  return shadows(g);
}

/** A house; its window lights up at dusk (the returned material). */
export function house(roof: string, wide: number): {group: THREE.Group; light: THREE.MeshStandardMaterial} {
  const g = new THREE.Group();
  const w = 0.9 + wide * 0.4;
  const walls = new THREE.Mesh(new THREE.BoxGeometry(w, 0.75, 0.8), flat(PALETTE.walls));
  walls.position.y = 0.375;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.62, w + 0.2, 3, 1), flat(roof));
  top.rotation.z = Math.PI / 2;
  top.rotation.x = Math.PI;
  top.scale.set(1, 1, 0.75);
  top.position.y = 0.95;
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), flat('#b0896a'));
  chimney.position.set(w * 0.28, 1.15, -0.12);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.02), flat('#6b4129'));
  door.position.set(-w * 0.2, 0.18, 0.41);
  const light = new THREE.MeshStandardMaterial({color: '#3d3a40', emissive: PALETTE.window, emissiveIntensity: 0, flatShading: true, roughness: 0.6});
  const win = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.02), light);
  win.position.set(w * 0.18, 0.45, 0.41);
  const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.2), light);
  win2.position.set(w / 2 + 0.01, 0.45, 0.1);
  g.add(walls, top, chimney, door, win, win2);
  return {group: shadows(g), light};
}

/** The windmill; its sails turn (the returned group). */
export function windmill(): {group: THREE.Group; sails: THREE.Group} {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 2.4, 8), flat(PALETTE.walls));
  tower.position.y = 1.2;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.7, 8), flat(PALETTE.roofs[0]));
  cap.position.y = 2.75;
  const sails = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    const spar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.05), flat('#6b4129'));
    spar.position.y = 0.95;
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.3, 0.02), flat('#fff4e2'));
    cloth.position.set(0.2, 1.15, 0);
    arm.add(spar, cloth);
    arm.rotation.z = (i * Math.PI) / 2;
    sails.add(arm);
  }
  sails.position.set(0, 2.45, 0.66);
  g.add(tower, cap, sails);
  return {group: shadows(g), sails};
}

/** The lighthouse: its lamp lights, and its beam turns (both returned). */
export function lighthouse(): {group: THREE.Group; lamp: THREE.MeshStandardMaterial; beam: THREE.Group; beamMaterial: THREE.MeshBasicMaterial} {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.44 - i * 0.05, 0.5 - i * 0.05, 0.75, 10), flat(i % 2 ? PALETTE.roofs[0] : '#fbf6ee'));
    seg.position.y = 0.375 + i * 0.75;
    g.add(seg);
  }
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 12), flat('#3d3a40'));
  deck.position.y = 3.04;
  const lamp = new THREE.MeshStandardMaterial({color: '#fff6d8', emissive: PALETTE.lamp, emissiveIntensity: 0, flatShading: true});
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 10), lamp);
  glass.position.y = 3.29;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.42, 10), flat(PALETTE.roofs[0]));
  roof.position.y = 3.71;
  g.add(deck, glass, roof);
  shadows(g);
  // the beam: a long cone of light from the lamp, brightest at the lamp
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const grd = ctx.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 4, 256);
  const beamMaterial = new THREE.MeshBasicMaterial({color: PALETTE.lamp, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide});
  // a bright core inside a wider, fainter cone: soft edges
  const beam = new THREE.Group();
  for (const [far, length] of [[1.0, 16], [2.3, 14]]) {
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.16, far, length, 24, 1, true), beamMaterial);
    cone.rotation.z = Math.PI / 2; // narrow end at the lamp, pointing along +x
    cone.position.x = length / 2;
    beam.add(cone);
  }
  beam.position.y = 3.29;
  g.add(beam);
  return {group: g, lamp, beam, beamMaterial};
}

/** The player's boat: a round-bottomed hull, a mast, a mainsail and a jib, and a lantern (returned: it lights at dusk). Its bow is +x. */
export function boat(): {group: THREE.Group; lantern: THREE.MeshStandardMaterial} {
  const g = new THREE.Group();
  const outline = new THREE.Shape();
  outline.moveTo(-0.72, -0.26);
  outline.lineTo(0.3, -0.29);
  outline.quadraticCurveTo(0.8, -0.24, 1.0, 0);
  outline.quadraticCurveTo(0.8, 0.24, 0.3, 0.29);
  outline.lineTo(-0.72, 0.26);
  outline.quadraticCurveTo(-0.82, 0, -0.72, -0.26);
  const hullGeo = new THREE.ExtrudeGeometry(outline, {depth: 0.14, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 3, curveSegments: 10});
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.translate(0, 0.3, 0);
  const hull = new THREE.Mesh(hullGeo, flat(PALETTE.hull));
  const deckGeo = new THREE.ShapeGeometry(outline, 10);
  deckGeo.rotateX(Math.PI / 2);
  deckGeo.scale(0.92, 1, 0.86);
  const deck = new THREE.Mesh(deckGeo, flat('#e2bd8a', {side: THREE.DoubleSide}));
  deck.position.y = 0.405;
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 4, 40), flat('#fbf1e2'));
  stripe.rotation.x = Math.PI / 2;
  stripe.scale.set(0.86, 0.33, 1);
  stripe.position.set(0.12, 0.36, 0);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.9, 5), flat('#5a3a28'));
  mast.position.set(0.18, 1.35, 0);
  // the mainsail, set at an angle to the wind, and the jib forward of the mast
  const main = new THREE.Shape();
  main.moveTo(0, 0);
  main.lineTo(0, 1.5);
  main.quadraticCurveTo(-0.42, 0.7, -0.92, 0.04);
  const mainsail = new THREE.Mesh(new THREE.ShapeGeometry(main, 8), flat(PALETTE.sail, {side: THREE.DoubleSide}));
  const boom = new THREE.Group();
  boom.add(mainsail);
  boom.position.set(0.16, 0.6, 0);
  boom.rotation.y = 0.65;
  const jibShape = new THREE.Shape();
  jibShape.moveTo(0, 0);
  jibShape.lineTo(0, 1.25);
  jibShape.lineTo(0.62, 0);
  const jib = new THREE.Mesh(new THREE.ShapeGeometry(jibShape), flat('#f6e7cf', {side: THREE.DoubleSide}));
  jib.position.set(0.26, 0.62, 0.02);
  jib.rotation.y = 0.45;
  const lantern = new THREE.MeshStandardMaterial({color: '#fff1c6', emissive: PALETTE.window, emissiveIntensity: 0});
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.08), lantern);
  lamp.position.set(-0.6, 0.52, 0);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.13, 0.01), flat(PALETTE.roofs[0]));
  flag.position.set(0.06, 2.24, 0);
  g.add(hull, deck, stripe, mast, boom, jib, lamp, flag);
  shadows(g);
  return {group: g, lantern};
}

export function cloud(r: () => number, material: THREE.Material) {
  const g = new THREE.Group();
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8 + r() * 0.7, 1), material);
    s.position.set(i * 1.0 - n * 0.5, Math.sin((i / (n - 1)) * Math.PI) * 0.5 + r() * 0.2, r() * 0.6);
    s.scale.y = 0.75;
    g.add(s);
  }
  return g;
}

/** A gull: two wings that flap (the returned pair). */
export function gull(): {group: THREE.Group; wings: [THREE.Mesh, THREE.Mesh]} {
  const g = new THREE.Group();
  const white = flat('#fbfaf6');
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.07), white);
  const wing = () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.36), white);
    m.geometry.translate(0, 0, 0.18);
    return m;
  };
  const left = wing();
  const right = wing();
  right.rotation.y = Math.PI;
  g.add(body, left, right);
  return {group: g, wings: [left, right]};
}
