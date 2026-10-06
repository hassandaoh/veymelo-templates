import {useLayoutEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {useCurrentFrame} from 'veymelo';

/**
 * A three.js stage driven by the frame: built once, rendered once per frame.
 * `res` lowers the drawing resolution (1 = the design size).
 */
export type Built<T> = {renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; parts: T};

export function useThree<T>(w: number, h: number, res: number, build: (r: THREE.WebGLRenderer) => Omit<Built<T>, 'renderer'>, draw: (b: Built<T>, f: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame();
  const [built, setBuilt] = useState<Built<T> | null>(null);
  useLayoutEffect(() => {
    const renderer = new THREE.WebGLRenderer({canvas: ref.current!, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
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
  }, [w, h, res]);
  useLayoutEffect(() => {
    if (built) draw(built, f);
  }, [f, built]);
  return ref;
}

/** Seeded random for building scenes the same way every time. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
