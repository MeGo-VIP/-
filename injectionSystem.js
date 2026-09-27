// systems/injectionSystem.js — Injection Master simulator (Phase 2).
//
// Renders a 3D needle at a chosen injection site, lets the trainee set an
// entry angle and a discrete depth level, and scores the attempt against the
// site's textbook-standard ranges from data/injection-sites.js.
//
// HONESTY NOTE: this is a geometric/educational approximation running on the
// Phase-1 placeholder body (see data/injection-sites.js header). It teaches
// site selection, angle, and depth-category reasoning — it does NOT model
// tissue resistance, aspiration, or real per-patient anatomy. That limitation
// is surfaced to the trainee via the disclaimer already shown for the whole
// Anatomy section, and is not hidden here.
import * as THREE from 'three';
import { INJECTION_SITES, DEPTH_LEVEL_LABEL, findInjectionSite } from '../data/injection-sites.js';
import { anatomyBus } from '../core/eventBus.js';

const DEPTH_INSERT_LENGTH = { shallow: 0.015, medium: 0.05, deep: 0.11 };
const NEEDLE_LENGTH = 0.16;

export class InjectionSystem {
  constructor(engine) {
    this.engine = engine;
    this.currentSite = null;
    this.currentAngle = 90;
    this.currentDepth = 'medium';
    this._inserted = false;
    this._startTime = null;

    this.anchorMarkers = new THREE.Group();
    this.anchorMarkers.name = 'injection-anchors';
    this.engine.scene.add(this.anchorMarkers);

    this._buildNeedle();
    this._buildAnchorMarkers();
    this.hide();
  }

  // ---- setup --------------------------------------------------------

  _buildNeedle() {
    const group = new THREE.Group();
    group.name = 'injection-needle';

    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xd8d8e0, metalness: 0.7, roughness: 0.25 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, NEEDLE_LENGTH, 10), shaftMat);
    shaft.position.y = NEEDLE_LENGTH / 2; // pivot at the tip (local origin = tip)
    group.add(shaft);

    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.0025, 0.008, 10), shaftMat);
    tip.position.y = 0.004;
    tip.rotation.x = Math.PI;
    group.add(tip);

    const hubMat = new THREE.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.4 });
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10), hubMat);
    hub.position.y = NEEDLE_LENGTH + 0.015;
    group.add(hub);

    group.visible = false;
    this.needle = group;
    this.engine.scene.add(group);
  }

  _buildAnchorMarkers() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
    INJECTION_SITES.forEach((site) => {
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), mat.clone());
      marker.position.set(...site.anchor);
      marker.userData.injectionSiteId = site.id;
      marker.visible = false;
      this.anchorMarkers.add(marker);
    });
  }

  _normalAt(anchor) {
    const n = new THREE.Vector3(anchor[0], 0, anchor[2]);
    if (n.lengthSq() < 1e-6) n.set(0, 0, 1);
    return n.normalize();
  }

  // ---- visibility -----------------------------------------------------

  showSitePicker(category) {
    this.anchorMarkers.children.forEach((m) => {
      const site = findInjectionSite(m.userData.injectionSiteId);
      m.visible = !category || site.category === category;
    });
    this.needle.visible = false;
  }

  hide() {
    this.anchorMarkers.children.forEach((m) => (m.visible = false));
    this.needle.visible = false;
  }

  // ---- site selection & needle placement ---------------------------------

  selectSite(siteId) {
    const site = findInjectionSite(siteId);
    if (!site) return null;
    this.currentSite = site;
    this.currentAngle = site.angle.max; // start at the "textbook" angle
    this.currentDepth = site.depthLevel;
    this._inserted = false;
    this._startTime = performance.now();

    this.anchorMarkers.children.forEach((m) => (m.visible = false));
    this.needle.visible = true;
    this._placeNeedle();
    this.engine.anatomyCamera.flyTo(
      [site.anchor[0] * 1.8 + 0.3, site.anchor[1] + 0.15, site.anchor[2] * 1.8 + 0.3],
      site.anchor
    );
    anatomyBus.emit('injection-site-selected', { site });
    return site;
  }

  setAngle(deg) {
    this.currentAngle = THREE.MathUtils.clamp(deg, 0, 90);
    this._placeNeedle();
  }

  setDepth(level) {
    if (!DEPTH_LEVEL_LABEL[level]) return;
    this.currentDepth = level;
    this._placeNeedle();
  }

  _placeNeedle() {
    if (!this.currentSite) return;
    const anchor = new THREE.Vector3(...this.currentSite.anchor);
    const normal = this._normalAt(this.currentSite.anchor);

    // Needle rests tip-at-skin, hovering, until insert() animates it in.
    const hoverOffset = normal.clone().multiplyScalar(0.05);
    this.needle.position.copy(anchor).add(hoverOffset);

    // Orient the needle: local +Y (its shaft axis) should point along
    // `normal` tilted by (90 - angle) toward the skin plane.
    const angleFromSurface = THREE.MathUtils.degToRad(this.currentAngle);
    const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
    if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
    const dir = normal.clone().multiplyScalar(Math.sin(angleFromSurface))
      .add(tangent.multiplyScalar(Math.cos(angleFromSurface)))
      .normalize();

    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.negate());
    this.needle.quaternion.copy(quat);
  }

  // ---- insertion + scoring --------------------------------------------

  insert() {
    if (!this.currentSite || this._inserted) return null;
    this._inserted = true;

    const anchor = new THREE.Vector3(...this.currentSite.anchor);
    const normal = this._normalAt(this.currentSite.anchor);
    const insertDepth = DEPTH_INSERT_LENGTH[this.currentDepth] || 0.05;
    const target = anchor.clone().add(normal.clone().multiplyScalar(-insertDepth * 0.15));

    const start = this.needle.position.clone();
    const startTime = performance.now();
    const duration = 350;
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      this.needle.position.lerpVectors(start, target, t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);

    const elapsedMs = performance.now() - this._startTime;
    const result = this._score(elapsedMs);
    anatomyBus.emit('injection-scored', result);
    return result;
  }

  _score(elapsedMs) {
    const site = this.currentSite;
    const lang = 'both';

    // Angle score (max 60 in free-practice mode).
    const { min, max } = site.angle;
    let angleScore;
    if (this.currentAngle >= min && this.currentAngle <= max) {
      angleScore = 60;
    } else {
      const dist = this.currentAngle < min ? min - this.currentAngle : this.currentAngle - max;
      angleScore = Math.max(0, 60 - dist * 3);
    }

    // Depth score (max 40) — exact category match required (shallow/medium/deep
    // are the taught categories for ID/SC/IM respectively).
    const depthScore = this.currentDepth === site.depthLevel ? 40 : (
      // adjacent category (e.g., medium vs deep) still gets partial credit
      Math.abs(['shallow', 'medium', 'deep'].indexOf(this.currentDepth) - ['shallow', 'medium', 'deep'].indexOf(site.depthLevel)) === 1 ? 15 : 0
    );

    const total = Math.round(angleScore + depthScore);

    return {
      site,
      total,
      angleScore: Math.round(angleScore),
      depthScore: Math.round(depthScore),
      angleOk: this.currentAngle >= min && this.currentAngle <= max,
      depthOk: this.currentDepth === site.depthLevel,
      chosenAngle: this.currentAngle,
      chosenDepth: this.currentDepth,
      elapsedMs: Math.round(elapsedMs),
    };
  }

  dispose() {
    this.engine.scene.remove(this.needle, this.anchorMarkers);
  }
}
