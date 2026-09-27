// core/engine.js — scene/renderer lifecycle, adaptive quality, model loading
// with a safe placeholder fallback, and memory-safe disposal.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { AnatomyCamera } from './camera.js';
import { buildLightingRig } from './lighting.js';
import { findPartByNodeName, findLayerByNodeName, REGIONS } from '../data/anatomy-map.js';

const THREE_VERSION_PATH = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/';

export class AnatomyEngine {
  constructor(container) {
    this.container = container;
    this.disposed = false;
    this._resizeObserver = null;
    this._rafId = null;
    this._clock = new THREE.Clock();
    this._fps = 0;
    this._fpsFrames = 0;
    this._fpsLast = performance.now();
    this._running = false;

    this._buildRenderer();
    this._buildScene();

    this.anatomyCamera = new AnatomyCamera(this.renderer.domElement, this._aspect());
    buildLightingRig(this.scene, { enableShadows: !this._isLowPowerDevice() });

    this.modelRoot = new THREE.Group();
    this.modelRoot.name = 'anatomy-model-root';
    this.scene.add(this.modelRoot);

    this._ground();
    this._observeResize();
  }

  // ---- setup -------------------------------------------------------------

  _isLowPowerDevice() {
    const mem = navigator.deviceMemory; // not on all browsers
    return (mem && mem <= 4) || /Android|iPhone|iPad/i.test(navigator.userAgent);
  }

  _aspect() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    return w / h;
  }

  _buildRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    const dpr = this._isLowPowerDevice() ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = !this._isLowPowerDevice();
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);
  }

  _buildScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1620);
    this.scene.fog = new THREE.Fog(0x0e1620, 6, 16);
  }

  _ground() {
    const geo = new THREE.CircleGeometry(3, 32);
    const mat = new THREE.MeshStandardMaterial({ color: 0x141d29, roughness: 1, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.name = 'anatomy-ground';
    this.scene.add(mesh);
  }

  _observeResize() {
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this.container);
  }

  _onResize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.anatomyCamera.setAspect(w / h);
  }

  // ---- render loop ---------------------------------------------------

  start(onFrame) {
    if (this._running) return;
    this._running = true;
    const loop = () => {
      if (!this._running) return;
      this._rafId = requestAnimationFrame(loop);
      this.anatomyCamera.update();
      this.renderer.render(this.scene, this.anatomyCamera.camera);

      this._fpsFrames++;
      const now = performance.now();
      if (now - this._fpsLast >= 1000) {
        this._fps = this._fpsFrames;
        this._fpsFrames = 0;
        this._fpsLast = now;
        if (onFrame) onFrame(this._fps);
      }
    };
    loop();
  }

  stop() {
    this._running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  // ---- model loading -----------------------------------------------------

  // Tries to load a real GLB from the given URL. On any failure (404, parse
  // error, etc.) it resolves with `{ placeholder: true }` and builds a
  // procedural stand-in body instead — it NEVER throws up to the caller and
  // never pretends the placeholder is a verified anatomical model.
  async loadModel(url, { onProgress } = {}) {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath(THREE_VERSION_PATH);
    loader.setDRACOLoader(draco);

    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(
          url,
          resolve,
          (evt) => {
            if (onProgress && evt.total) onProgress(evt.loaded / evt.total);
          },
          reject
        );
      });
      this._ingestModel(gltf.scene);
      return { placeholder: false };
    } catch (err) {
      console.info('[Anatomy] Real model not found/failed to load — using placeholder body.', err && err.message);
      this.buildPlaceholderBody();
      return { placeholder: true };
    }
  }

  // Walks the loaded model, tags each mesh with userData.layer / userData.partId
  // by matching its node name against data/anatomy-map.js, and enables shadows.
  _ingestModel(root) {
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      const layer = findLayerByNodeName(obj.name);
      const part = findPartByNodeName(obj.name);
      if (layer) obj.userData.layer = layer.id;
      if (part) obj.userData.partId = part.id;
    });
    this.modelRoot.add(root);
  }

  // A low-poly procedural stand-in so the FULL pipeline (layers, raycast
  // selection, camera focus, info panel) is demonstrably working before a
  // licensed anatomical model is available. Clearly named per the layer
  // system's conventions so swapping in a real GLB later needs no code change.
  buildPlaceholderBody() {
    const group = new THREE.Group();
    group.name = 'placeholder-body';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b48c, roughness: 0.7 });
    const muscleMat = new THREE.MeshStandardMaterial({ color: 0xb23b3b, roughness: 0.6 });
    const boneMat = new THREE.MeshStandardMaterial({ color: 0xf2eee0, roughness: 0.5 });
    const organMat = new THREE.MeshStandardMaterial({ color: 0x9c3b52, roughness: 0.4 });

    const add = (mesh, name, layer, partId) => {
      mesh.name = name;
      mesh.userData.layer = layer;
      if (partId) mesh.userData.partId = partId;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    // Skin layer — simple humanoid silhouette (capsules).
    const skin = new THREE.Group();
    skin.name = 'skin_layer';
    add(new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 4, 12), skinMat), 'skin_torso', 'skin').position.set(0, 1.15, 0);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat), 'skin_head', 'skin').position.set(0, 1.78, 0);
    add(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), skinMat), 'skin_arm_l', 'skin').position.set(-0.42, 1.15, 0);
    add(new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), skinMat), 'skin_arm_r', 'skin').position.set(0.42, 1.15, 0);
    add(new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.65, 4, 8), skinMat), 'skin_leg_l', 'skin').position.set(-0.15, 0.45, 0);
    add(new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.65, 4, 8), skinMat), 'skin_leg_r', 'skin').position.set(0.15, 0.45, 0);
    group.add(skin);

    // Muscle layer (slightly smaller, hidden by default).
    const muscles = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.5, 4, 12), muscleMat);
    add(muscles, 'muscle_torso', 'muscles').position.set(0, 1.15, 0);
    muscles.visible = false;

    // Skeleton layer (spine placeholder).
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.0, 8), boneMat);
    add(spine, 'skeleton_spine', 'skeleton').position.set(0, 1.15, -0.05);
    spine.visible = false;

    // Organs — approximate anatomical positions inside the torso.
    const heart = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), organMat);
    add(heart, 'organ_heart', 'organs', 'heart').position.set(-0.05, 1.35, 0.12);
    heart.visible = false;

    const lungL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), organMat);
    add(lungL, 'organ_lung_l', 'organs', 'lungs').position.set(-0.14, 1.35, 0.05);
    lungL.visible = false;
    const lungR = lungL.clone();
    add(lungR, 'organ_lung_r', 'organs', 'lungs').position.set(0.14, 1.35, 0.05);
    lungR.visible = false;

    const liver = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), organMat);
    add(liver, 'organ_liver', 'organs', 'liver').position.set(0.1, 1.05, 0.1);
    liver.visible = false;

    const stomach = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), organMat);
    add(stomach, 'organ_stomach', 'organs', 'stomach').position.set(-0.08, 1.02, 0.1);
    stomach.visible = false;

    const kidneyL = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.06, 4, 8), organMat);
    add(kidneyL, 'organ_kidney_l', 'organs', 'kidneys').position.set(-0.12, 0.95, -0.05);
    kidneyL.visible = false;
    const kidneyR = kidneyL.clone();
    add(kidneyR, 'organ_kidney_r', 'organs', 'kidneys').position.set(0.12, 0.95, -0.05);
    kidneyR.visible = false;

    const brain = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), organMat);
    add(brain, 'organ_brain', 'organs', 'brain').position.set(0, 1.82, 0);
    brain.visible = false;

    // Region anchors (invisible helpers used by the Region Navigator's camera focus).
    const regionAnchors = {
      region_head: [0, 1.78, 0],
      region_thorax: [0, 1.35, 0],
      region_abdomen: [0, 1.0, 0],
      region_pelvis: [0, 0.8, 0],
      region_arm_r: [0.42, 1.15, 0],
      region_leg_r: [0.15, 0.45, 0],
      region_spine: [0, 1.15, -0.1],
    };
    Object.entries(regionAnchors).forEach(([name, pos]) => {
      const anchor = new THREE.Object3D();
      anchor.name = name;
      anchor.position.set(...pos);
      group.add(anchor);
    });

    this.modelRoot.add(group);
    this._placeholderGroup = group;
    return group;
  }

  findRegionAnchor(id) {
    const region = REGIONS.find((r) => r.id === id || r.target === id);
    if (!region) return null;
    return this.modelRoot.getObjectByName(region.target) || null;
  }

  findObjectByPartId(partId) {
    let found = null;
    this.modelRoot.traverse((obj) => {
      if (!found && obj.userData && obj.userData.partId === partId) found = obj;
    });
    return found;
  }

  // ---- disposal (memory-safe) --------------------------------------------

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this.anatomyCamera.dispose();

    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => {
            if (v && v.isTexture) v.dispose();
          });
          m.dispose();
        });
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
