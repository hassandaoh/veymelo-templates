import {useLayoutEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'veymelo';

/**
 * A three.js stage driven by the frame: built once, rendered once per frame.
 * `res` lowers the drawing resolution; `alpha` leaves the background clear so
 * the picture behind the canvas shows through.
 */
export type Built<T> = {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; parts: T};

export function useThree<T>(w: number, h: number, res: number, build: (r: THREE.WebGLRenderer) => Omit<Built<T>, 'renderer'>, draw: (b: Built<T>, f: number) => void, alpha = false) {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [built, setBuilt] = useState<Built<T> | null>(null);
  useLayoutEffect(() => {
    const renderer = new THREE.WebGLRenderer({canvas: ref.current!, antialias: true, alpha, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
    renderer.setPixelRatio(1);
    renderer.setSize(Math.round(w * res), Math.round(h * res), false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const b = {renderer, ...build(renderer)};
    setBuilt(b);
    return () => {
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [w, h, res, alpha]);
  useLayoutEffect(() => {
    if (built) draw(built, f);
  }, [f, built]);
  return ref;
}

/** A vertical gradient as a texture (sky, studio sweep). */
export function gradientTexture(stops: [number, string][]) {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 512;
  const g = c.getContext('2d')!;
  const grd = g.createLinearGradient(0, 0, 0, 512);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** A soft round shadow (for contact shadows under objects). */
export function blobTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(0.5, 'rgba(0,0,0,0.25)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/** Seeded random for building scenes the same way every time. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
