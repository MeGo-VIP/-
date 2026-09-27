// systems/layerSystem.js — show/hide, opacity, and isolate for each anatomical
// layer (skin/fat/muscles/skeleton/organs/vessels/nerves). Works identically
// on the placeholder body and on a real model, because both tag meshes with
// `userData.layer` using the same ids from data/anatomy-map.js.
import * as THREE from 'three';
import { LAYERS } from '../data/anatomy-map.js';

export class LayerSystem {
  constructor(modelRoot) {
    this.modelRoot = modelRoot;
    this.state = {}; // { [layerId]: { visible, opacity } }
    LAYERS.forEach((l) => {
      this.state[l.id] = { visible: l.defaultVisible, opacity: l.defaultOpacity };
    });
  }

  // Re-scans the current model root (call after a model/placeholder loads)
  // and applies the current state immediately.
  refresh() {
    Object.keys(this.state).forEach((id) => this._applyLayer(id));
  }

  _meshesForLayer(layerId) {
    const meshes = [];
    this.modelRoot.traverse((obj) => {
      if (obj.isMesh && obj.userData.layer === layerId) meshes.push(obj);
    });
    return meshes;
  }

  _applyLayer(layerId) {
    const { visible, opacity } = this.state[layerId];
    this._meshesForLayer(layerId).forEach((mesh) => {
      mesh.visible = visible;
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          m.transparent = opacity < 1;
          m.opacity = opacity;
        });
      }
    });
  }

  setVisible(layerId, visible) {
    if (!this.state[layerId]) return;
    this.state[layerId].visible = visible;
    this._applyLayer(layerId);
  }

  toggle(layerId) {
    if (!this.state[layerId]) return;
    this.setVisible(layerId, !this.state[layerId].visible);
  }

  setOpacity(layerId, opacity) {
    if (!this.state[layerId]) return;
    this.state[layerId].opacity = THREE.MathUtils.clamp(opacity, 0, 1);
    this._applyLayer(layerId);
  }

  // Show only this layer, hide the rest.
  isolate(layerId) {
    Object.keys(this.state).forEach((id) => {
      this.state[id].visible = id === layerId;
      this._applyLayer(id);
    });
  }

  showAll() {
    Object.keys(this.state).forEach((id) => {
      this.state[id].visible = true;
      this._applyLayer(id);
    });
  }
}
