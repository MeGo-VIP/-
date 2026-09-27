// core/raycast.js — pointer selection (works for mouse AND touch via
// pointer events), resolves the clicked mesh's nearest ancestor that carries
// userData.partId, and emits a 'select' event on the shared bus.
import * as THREE from 'three';
import { anatomyBus } from './eventBus.js';

export class AnatomySelector {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this._onPointerUp = this._onPointerUp.bind(this);
    this._downPos = null;
    this._onPointerDown = this._onPointerDown.bind(this);

    domElement.addEventListener('pointerdown', this._onPointerDown, { passive: true });
    domElement.addEventListener('pointerup', this._onPointerUp, { passive: true });
  }

  _onPointerDown(e) {
    this._downPos = { x: e.clientX, y: e.clientY };
  }

  _onPointerUp(e) {
    // Ignore drags (orbit rotation) — only treat near-stationary taps as selection.
    if (this._downPos) {
      const dx = e.clientX - this._downPos.x;
      const dy = e.clientY - this._downPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 6) {
        this._downPos = null;
        return;
      }
    }
    this._downPos = null;

    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);

    for (const hit of hits) {
      let obj = hit.object;
      while (obj) {
        if (obj.userData && obj.userData.partId) {
          anatomyBus.emit('select', { partId: obj.userData.partId, object3D: obj, point: hit.point });
          return;
        }
        obj = obj.parent;
      }
    }
    anatomyBus.emit('select-none');
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this._onPointerDown);
    this.domElement.removeEventListener('pointerup', this._onPointerUp);
  }
}
