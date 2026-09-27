// anatomy.js — Phase 1 (3D core viewer) + Phase 2 (Injection Master) entry
// point + public window.AnatomyAPI.
// Loaded as a <script type="module">. Builds nothing until AnatomyAPI.open()
// is called (lazy init — first call to switchTab('anatomy') in the host site).
import * as THREE from 'three';
import { anatomyBus } from './core/eventBus.js';
import { AnatomyEngine } from './core/engine.js';
import { AnatomySelector } from './core/raycast.js';
import { LayerSystem } from './systems/layerSystem.js';
import { LabelSystem } from './systems/labelSystem.js';
import { InjectionSystem } from './systems/injectionSystem.js';
import { anatomyT } from './data/i18n.js';
import { LAYERS, REGIONS, PARTS } from './data/anatomy-map.js';
import { INJECTION_CATEGORIES, INJECTION_SITES, DEPTH_LEVEL_LABEL, findInjectionSite } from './data/injection-sites.js';

const MODEL_URL = 'anatomy/models/body.glb';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

class AnatomySystem {
  constructor() {
    this.built = false;
    this.engine = null;
    this.layerSystem = null;
    this.labelSystem = null;
    this.injectionSystem = null;
    this.selector = null;
    this.mode = 'explore'; // 'explore' | 'injection'
    this.lang = (window.currentLang === 'ar') ? 'ar' : 'en';
  }

  // ---- public API ---------------------------------------------------

  async open(options = {}) {
    const containerId = options.container || 'anatomy-viewer-root';
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('[Anatomy] container not found:', containerId);
      return;
    }
    if (options.language) this.lang = options.language === 'ar' ? 'ar' : 'en';

    if (!this.built) {
      await this._build();
      this.built = true;
    } else {
      this.engine.start((fps) => this._updateFps(fps));
    }
    if (options.injectionSite) this.showInjectionSite(options.injectionSite);
    anatomyBus.emit('open');
  }

  close() {
    if (this.engine) this.engine.stop();
    anatomyBus.emit('close');
  }

  focusOn(name) {
    if (!this.built) return;
    const part = PARTS.find((p) => p.id === name || p.names.en.toLowerCase() === String(name).toLowerCase() || p.names.ar === name);
    if (part) {
      const obj = this.engine.findObjectByPartId(part.id);
      if (obj) {
        this.engine.anatomyCamera.focusOnObject3D(obj);
        this._select(part.id);
        return;
      }
    }
    const region = REGIONS.find((r) => r.id === name);
    if (region) {
      const anchor = this.engine.findRegionAnchor(region.id);
      if (anchor) this.engine.anatomyCamera.flyTo(
        [anchor.position.x + 0.8, anchor.position.y + 0.3, anchor.position.z + 1.2],
        [anchor.position.x, anchor.position.y, anchor.position.z]
      );
    }
  }

  // Phase 2 — now implemented for real.
  showInjectionSite(siteId) {
    if (!this.built) return;
    this._setMode('injection');
    const site = findInjectionSite(siteId);
    if (!site) {
      console.warn('[Anatomy] unknown injection site id:', siteId);
      return;
    }
    this._selectCategory(site.category);
    this._selectInjectionSite(site.id);
  }

  on(event, cb) {
    anatomyBus.on(event, cb);
  }

  // Phase 3+ methods — intentionally NOT faked. They log clearly instead of
  // pretending to work, per the project's "no placeholders for core features"
  // rule (this only applies to features that ARE in scope right now; these
  // are explicitly out of scope until their own phase).
  highlightMultiple() { this._notImplemented('highlightMultiple', 'a later phase'); }
  runProcedure() { this._notImplemented('runProcedure', 'Phase 3 (Procedure Simulator)'); }
  compareOrgans() { this._notImplemented('compareOrgans', 'a later phase'); }
  showDrugMechanism() { this._notImplemented('showDrugMechanism', 'the World Nursing integration phase'); }
  getProgress() { this._notImplemented('getProgress', 'the polish phase'); return null; }
  resetProgress() { this._notImplemented('resetProgress', 'the polish phase'); }

  _notImplemented(name, phase) {
    console.info(`🧬 AnatomyAPI.${name}() ships in ${phase} — not part of this build yet.`);
  }

  // ---- internal build -----------------------------------------------

  async _build() {
    this._renderShell();

    if (!this._webglAvailable()) {
      this._showWebglFallback();
      return;
    }

    const viewport = this.container.querySelector('.anatomy-viewport');
    const loadingEl = this.container.querySelector('.anatomy-loading');
    const noticeEl = this.container.querySelector('.anatomy-notice');
    const fpsEl = this.container.querySelector('.anatomy-fps');
    const infoPanel = this.container.querySelector('.anatomy-info-panel');

    this.engine = new AnatomyEngine(viewport);
    this.labelSystem = new LabelSystem(infoPanel, this.lang);

    const { placeholder } = await this.engine.loadModel(MODEL_URL, {
      onProgress: (p) => {
        if (loadingEl) loadingEl.querySelector('.anatomy-loading-text').textContent =
          `${anatomyT('loading', this.lang)} ${Math.round(p * 100)}%`;
      },
    });

    this.layerSystem = new LayerSystem(this.engine.modelRoot);
    this.layerSystem.refresh();

    this.selector = new AnatomySelector(this.engine.anatomyCamera.camera, this.engine.scene, this.engine.renderer.domElement);
    this.injectionSystem = new InjectionSystem(this.engine);

    if (loadingEl) loadingEl.remove();
    if (placeholder && noticeEl) {
      noticeEl.textContent = anatomyT('placeholderNotice', this.lang);
      noticeEl.style.display = 'block';
    } else if (noticeEl) {
      noticeEl.remove();
    }

    this._wireLayerButtons();
    this._wireViewButtons();
    this._wireModeButtons();
    this._wireSearch();
    this._wireInjectionUI();
    this._wireInjectionPicking();

    anatomyBus.on('select', (payload) => { if (this.mode === 'explore') this._select(payload.partId); });
    anatomyBus.on('select-none', () => { if (this.mode === 'explore') this.labelSystem.renderEmpty(); });

    this.engine.start((fps) => this._updateFps(fps, fpsEl));
  }

  _select(partId) {
    this.labelSystem.renderPart(partId);
    anatomyBus.emit('part-selected', { partId });
  }

  _updateFps(fps, fpsEl) {
    const el = fpsEl || (this.container && this.container.querySelector('.anatomy-fps'));
    if (el) el.textContent = `${fps} ${anatomyT('fps', this.lang)}`;
  }

  _webglAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  _showWebglFallback() {
    this.container.innerHTML = `<div class="anatomy-webgl-fallback">⚠️ ${esc(anatomyT('webglUnsupported', this.lang))}</div>`;
  }

  _renderShell() {
    const t = (k) => esc(anatomyT(k, this.lang));
    const isAr = this.lang === 'ar';
    this.container.innerHTML = `
      <div class="anatomy-root">
        <div class="anatomy-topbar">
          <div class="anatomy-mode-switch">
            <button class="anatomy-mode-btn active" data-mode="explore">🔎 ${isAr ? 'استكشاف' : 'Explore'}</button>
            <button class="anatomy-mode-btn" data-mode="injection">💉 ${isAr ? 'محاكي الحقن' : 'Injection Master'}</button>
          </div>
          <input type="text" class="anatomy-search" placeholder="${t('searchPlaceholder')}">
        </div>
        <div class="anatomy-body">
          <div class="anatomy-viewport">
            <div class="anatomy-loading"><div class="anatomy-spinner"></div><div class="anatomy-loading-text">${t('loading')}</div></div>
            <div class="anatomy-notice" style="display:none;"></div>
            <div class="anatomy-layers">
              ${LAYERS.map((l) => `<button class="anatomy-layer-btn${l.defaultVisible ? ' active' : ''}" data-layer="${l.id}">● ${t('layer_' + l.id)}</button>`).join('')}
            </div>
            <div class="anatomy-viewctrl">
              <button data-view="reset">${t('view_reset')}</button>
              <button data-view="front">${t('view_front')}</button>
              <button data-view="back">${t('view_back')}</button>
              <button data-view="left">${t('view_left')}</button>
              <button data-view="right">${t('view_right')}</button>
            </div>
            <div class="anatomy-fps"></div>
          </div>
          <div class="anatomy-info-panel"></div>
          <div class="anatomy-injection-panel" style="display:none;">
            <div class="anatomy-inj-categories">
              ${INJECTION_CATEGORIES.map((c) => `<button class="anatomy-inj-cat-btn" data-cat="${c.id}">${isAr ? c.ar : c.en}</button>`).join('')}
            </div>
            <div class="anatomy-inj-sitelist"></div>
            <div class="anatomy-inj-controls" style="display:none;">
              <div class="anatomy-inj-sitename"></div>
              <div class="anatomy-inj-landmark"></div>
              <label class="anatomy-inj-label">${isAr ? 'زاوية الدخول' : 'Entry Angle'}: <span class="anatomy-inj-angle-val">90°</span></label>
              <input type="range" min="0" max="90" value="90" class="anatomy-inj-angle-slider">
              <label class="anatomy-inj-label">${isAr ? 'مستوى العمق' : 'Depth Level'}</label>
              <div class="anatomy-inj-depth-btns">
                <button data-depth="shallow">${isAr ? DEPTH_LEVEL_LABEL.shallow.ar : DEPTH_LEVEL_LABEL.shallow.en}</button>
                <button data-depth="medium">${isAr ? DEPTH_LEVEL_LABEL.medium.ar : DEPTH_LEVEL_LABEL.medium.en}</button>
                <button data-depth="deep">${isAr ? DEPTH_LEVEL_LABEL.deep.ar : DEPTH_LEVEL_LABEL.deep.en}</button>
              </div>
              <button class="anatomy-inj-insert-btn">💉 ${isAr ? 'حقن' : 'Insert'}</button>
            </div>
            <div class="anatomy-inj-feedback"></div>
          </div>
        </div>
        <div class="anatomy-disclaimer">${t('disclaimer')}</div>
      </div>`;
  }

  _wireLayerButtons() {
    this.container.querySelectorAll('.anatomy-layer-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-layer');
        this.layerSystem.toggle(id);
        btn.classList.toggle('active', this.layerSystem.state[id].visible);
      });
    });
  }

  _wireViewButtons() {
    this.container.querySelectorAll('.anatomy-viewctrl button').forEach((btn) => {
      btn.addEventListener('click', () => this.engine.anatomyCamera.goToPreset(btn.getAttribute('data-view')));
    });
  }

  _wireSearch() {
    const input = this.container.querySelector('.anatomy-search');
    if (!input) return;
    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        if (this.mode !== 'explore') return;
        const q = input.value.trim().toLowerCase();
        if (!q) return;
        const match = PARTS.find((p) =>
          p.names.ar.includes(q) || p.names.en.toLowerCase().includes(q) || p.names.latin.toLowerCase().includes(q) || p.id.includes(q)
        );
        if (match) this.focusOn(match.id);
      }, 250);
    });
  }

  // ---- mode switching (Explore <-> Injection Master) ----------------

  _wireModeButtons() {
    this.container.querySelectorAll('.anatomy-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => this._setMode(btn.getAttribute('data-mode')));
    });
  }

  _setMode(mode) {
    this.mode = mode;
    this.container.querySelectorAll('.anatomy-mode-btn').forEach((b) =>
      b.classList.toggle('active', b.getAttribute('data-mode') === mode));

    const infoPanel = this.container.querySelector('.anatomy-info-panel');
    const injPanel = this.container.querySelector('.anatomy-injection-panel');
    const layersUI = this.container.querySelector('.anatomy-layers');

    if (mode === 'injection') {
      infoPanel.style.display = 'none';
      injPanel.style.display = 'block';
      layersUI.style.display = 'none';
      this.layerSystem.isolate('skin');
    } else {
      infoPanel.style.display = '';
      injPanel.style.display = 'none';
      layersUI.style.display = '';
      this.injectionSystem.hide();
      this.layerSystem.setVisible('skin', true);
    }
  }

  // ---- Injection Master UI -------------------------------------------

  _wireInjectionUI() {
    const isAr = this.lang === 'ar';
    this.container.querySelectorAll('.anatomy-inj-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.anatomy-inj-cat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this._selectCategory(btn.getAttribute('data-cat'));
      });
    });

    const angleSlider = this.container.querySelector('.anatomy-inj-angle-slider');
    const angleVal = this.container.querySelector('.anatomy-inj-angle-val');
    angleSlider.addEventListener('input', () => {
      const deg = parseInt(angleSlider.value, 10);
      angleVal.textContent = `${deg}°`;
      this.injectionSystem.setAngle(deg);
    });

    this.container.querySelectorAll('.anatomy-inj-depth-btns button').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.anatomy-inj-depth-btns button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.injectionSystem.setDepth(btn.getAttribute('data-depth'));
      });
    });

    this.container.querySelector('.anatomy-inj-insert-btn').addEventListener('click', () => {
      const result = this.injectionSystem.insert();
      if (result) this._renderInjectionFeedback(result);
    });
  }

  _selectCategory(catId) {
    this.container.querySelectorAll('.anatomy-inj-cat-btn').forEach((b) =>
      b.classList.toggle('active', b.getAttribute('data-cat') === catId));
    const isAr = this.lang === 'ar';
    const sites = INJECTION_SITES.filter((s) => s.category === catId);
    const listEl = this.container.querySelector('.anatomy-inj-sitelist');
    listEl.innerHTML = sites.map((s) => `<button class="anatomy-inj-site-btn" data-site="${s.id}">${esc(isAr ? s.names.ar : s.names.en)}</button>`).join('');
    listEl.querySelectorAll('.anatomy-inj-site-btn').forEach((btn) => {
      btn.addEventListener('click', () => this._selectInjectionSite(btn.getAttribute('data-site')));
    });
    this.injectionSystem.showSitePicker(catId);
    this.container.querySelector('.anatomy-inj-controls').style.display = 'none';
    this.container.querySelector('.anatomy-inj-feedback').innerHTML = '';
  }

  _selectInjectionSite(siteId) {
    const site = this.injectionSystem.selectSite(siteId);
    if (!site) return;
    const isAr = this.lang === 'ar';

    this.container.querySelectorAll('.anatomy-inj-site-btn').forEach((b) =>
      b.classList.toggle('active', b.getAttribute('data-site') === siteId));

    this.container.querySelector('.anatomy-inj-sitename').textContent = isAr ? site.names.ar : site.names.en;
    this.container.querySelector('.anatomy-inj-landmark').textContent = isAr ? site.landmarks.ar : site.landmarks.en;

    const angleSlider = this.container.querySelector('.anatomy-inj-angle-slider');
    angleSlider.value = site.angle.max;
    this.container.querySelector('.anatomy-inj-angle-val').textContent = `${site.angle.max}°`;

    this.container.querySelectorAll('.anatomy-inj-depth-btns button').forEach((b) =>
      b.classList.toggle('active', b.getAttribute('data-depth') === site.depthLevel));

    this.container.querySelector('.anatomy-inj-controls').style.display = 'block';
    this.container.querySelector('.anatomy-inj-feedback').innerHTML = '';
  }

  _renderInjectionFeedback(result) {
    const isAr = this.lang === 'ar';
    const site = result.site;
    const errors = (site.commonErrors && (isAr ? site.commonErrors.ar : site.commonErrors.en)) || [];
    const danger = site.dangerNote ? (isAr ? site.dangerNote.ar : site.dangerNote.en) : '';
    const seconds = (result.elapsedMs / 1000).toFixed(1);

    this.container.querySelector('.anatomy-inj-feedback').innerHTML = `
      <div class="anatomy-inj-score">${isAr ? 'النتيجة' : 'Score'}: ${result.total}/100</div>
      <div class="anatomy-inj-row ${result.angleOk ? 'ok' : 'bad'}">${result.angleOk ? '✅' : '❌'} ${isAr ? 'الزاوية' : 'Angle'}: ${result.chosenAngle}° (${isAr ? 'المطلوب' : 'target'} ${site.angle.min}–${site.angle.max}°)</div>
      <div class="anatomy-inj-row ${result.depthOk ? 'ok' : 'bad'}">${result.depthOk ? '✅' : '❌'} ${isAr ? 'العمق' : 'Depth'}: ${esc((isAr ? DEPTH_LEVEL_LABEL[result.chosenDepth].ar : DEPTH_LEVEL_LABEL[result.chosenDepth].en))} (${isAr ? 'المطلوب' : 'target'} ${esc(isAr ? DEPTH_LEVEL_LABEL[site.depthLevel].ar : DEPTH_LEVEL_LABEL[site.depthLevel].en)})</div>
      <div class="anatomy-inj-row">⏱ ${isAr ? 'الوقت' : 'Time'}: ${seconds}s</div>
      ${danger ? `<div class="anatomy-inj-danger">⚠️ ${esc(danger)}</div>` : ''}
      ${errors.length ? `<div class="anatomy-inj-errors"><strong>${isAr ? 'أخطاء شائعة' : 'Common errors'}:</strong> ${errors.map(esc).join('، ')}</div>` : ''}
      <button class="anatomy-inj-studymore-btn">${isAr ? '📖 اقرأ المزيد في قسم الحقن' : '📖 Study more in Injections section'}</button>
    `;

    const studyBtn = this.container.querySelector('.anatomy-inj-studymore-btn');
    if (studyBtn) {
      studyBtn.addEventListener('click', () => {
        if (typeof window.switchTab === 'function') window.switchTab('injections');
        const searchInput = document.getElementById('injections-search');
        if (searchInput) {
          searchInput.value = isAr ? site.names.ar : site.names.en;
          if (typeof window.filterInjections === 'function') window.filterInjections();
        }
      });
    }
  }

  // Raycasts against injection anchor markers (separate from AnatomySelector,
  // which only resolves userData.partId — anchors use userData.injectionSiteId).
  _wireInjectionPicking() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dom = this.engine.renderer.domElement;
    let downPos = null;

    dom.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; }, { passive: true });
    dom.addEventListener('pointerup', (e) => {
      if (this.mode !== 'injection') return;
      if (downPos) {
        const dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > 6) { downPos = null; return; }
      }
      downPos = null;

      const rect = dom.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, this.engine.anatomyCamera.camera);
      const hits = raycaster.intersectObjects(this.injectionSystem.anchorMarkers.children, false);
      if (hits.length) {
        const siteId = hits[0].object.userData.injectionSiteId;
        this._selectInjectionSite(siteId);
      }
    }, { passive: true });
  }
}

const system = new AnatomySystem();

window.AnatomyAPI = {
  open: (opts) => system.open(opts),
  close: () => system.close(),
  focusOn: (name) => system.focusOn(name),
  highlightMultiple: (...a) => system.highlightMultiple(...a),
  showInjectionSite: (siteId) => system.showInjectionSite(siteId),
  runProcedure: (...a) => system.runProcedure(...a),
  compareOrgans: (...a) => system.compareOrgans(...a),
  showDrugMechanism: (...a) => system.showDrugMechanism(...a),
  getProgress: (...a) => system.getProgress(...a),
  resetProgress: (...a) => system.resetProgress(...a),
  on: (evt, cb) => system.on(evt, cb),
};

