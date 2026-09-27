// core/lighting.js — a small, mobile-friendly lighting rig.
// Keep light count low (perf requirement): 1 hemisphere + 1 key directional
// (with shadow) + 1 soft fill. No point lights (expensive on mobile GPUs).
import * as THREE from 'three';

export function buildLightingRig(scene, { enableShadows = true } = {}) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x445566, 0.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2.5, 4, 3);
  key.castShadow = enableShadows;
  if (enableShadows) {
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 15;
    key.shadow.bias = -0.0005;
  }
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbdd7ff, 0.35);
  fill.position.set(-3, 1.5, -2);
  scene.add(fill);

  return { hemi, key, fill };
}
