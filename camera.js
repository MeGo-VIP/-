// core/camera.js — camera + OrbitControls wrapper with named view presets
// and a smooth focusOn() used by search results, region navigation, and the
// public AnatomyAPI.focusOn(name).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const VIEW_PRESETS = {
  front: { pos: [0, 1.4, 4.2], target: [0, 1.1, 0] },
  back: { pos: [0, 1.4, -4.2], target: [0, 1.1, 0] },
  left: { pos: [-4.2, 1.4, 0], target: [0, 1.1, 0] },
  right: { pos: [4.2, 1.4, 0], target: [0, 1.1, 0] },
  reset: { pos: [0, 1.4, 4.2], target: [0, 1.1, 0] },
};

export class AnatomyCamera {
  constructor(domElement, aspect) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.05, 100);
    this.camera.position.set(...VIEW_PRESETS.front.pos);

    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.6;
    this.controls.maxDistance = 12;
    this.controls.target.set(...VIEW_PRESETS.front.target);
    this.controls.update();

    this._animId = null;
  }

  setAspect(aspect) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update() {
    this.controls.update();
  }

  goToPreset(name, animate = true) {
    const preset = VIEW_PRESETS[name] || VIEW_PRESETS.reset;
    this.flyTo(preset.pos, preset.target, animate);
  }

  // Smoothly move the camera to a position while looking at a target.
  // object3D (optional): if provided, its world position is used as target
  // and the camera offsets from its bounding sphere — used by focusOn(partId).
  flyTo(position, target, animate = true) {
    if (this._animId) cancelAnimationFrame(this._animId);

    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const endPos = new THREE.Vector3(...position);
    const endTarget = new THREE.Vector3(...target);

    if (!animate) {
      this.camera.position.copy(endPos);
      this.controls.target.copy(endTarget);
      this.controls.update();
      return;
    }

    const duration = 600; // ms
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      this.camera.position.lerpVectors(startPos, endPos, e);
      this.controls.target.lerpVectors(startTarget, endTarget, e);
      this.controls.update();
      if (t < 1) {
        this._animId = requestAnimationFrame(step);
      } else {
        this._animId = null;
      }
    };
    this._animId = requestAnimationFrame(step);
  }

  focusOnObject3D(object3D) {
    if (!object3D) return;
    const box = new THREE.Box3().setFromObject(object3D);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z) * 0.9 + 0.3;
    const dir = new THREE.Vector3(0.6, 0.35, 1).normalize();
    const camPos = center.clone().addScaledVector(dir, radius * 2.2);
    this.flyTo([camPos.x, camPos.y, camPos.z], [center.x, center.y, center.z], true);
  }

  dispose() {
    if (this._animId) cancelAnimationFrame(this._animId);
    this.controls.dispose();
  }
}
