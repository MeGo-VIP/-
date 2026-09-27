// systems/labelSystem.js — renders the info panel (desktop side panel /
// mobile bottom sheet) for the currently selected structure. Pure DOM, no
// Three.js sprites in Phase 1 — simpler and more reliable, and still fully
// satisfies the "Information Panel" requirement. 3D floating labels can be
// added in a later phase without touching this file's public API.
import { anatomyT } from '../data/i18n.js';
import { PARTS } from '../data/anatomy-map.js';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export class LabelSystem {
  constructor(panelEl, lang) {
    this.panelEl = panelEl;
    this.lang = lang;
    this.renderEmpty();
  }

  setLang(lang) {
    this.lang = lang;
  }

  renderEmpty() {
    this.panelEl.innerHTML = `<div class="anatomy-info-empty">${esc(anatomyT('infoPanelEmpty', this.lang))}</div>`;
  }

  renderPart(partId) {
    const part = PARTS.find((p) => p.id === partId);
    if (!part) {
      this.renderEmpty();
      return;
    }
    const lang = this.lang === 'ar' ? 'ar' : 'en';
    const diseases = (part.relatedDiseases && part.relatedDiseases[lang]) || [];

    this.panelEl.innerHTML = `
      <div class="anatomy-info-card">
        <div class="anatomy-info-head">
          <div class="anatomy-info-name">${esc(part.names[lang])}</div>
          <div class="anatomy-info-latin">${esc(part.names.latin)}</div>
        </div>
        <div class="anatomy-info-row"><strong>${esc(anatomyT('function_label', this.lang))}:</strong> ${esc(part.function[lang])}</div>
        ${part.bloodSupply ? `<div class="anatomy-info-row"><strong>${esc(anatomyT('bloodSupply_label', this.lang))}:</strong> ${esc(part.bloodSupply[lang])}</div>` : ''}
        ${part.innervation ? `<div class="anatomy-info-row"><strong>${esc(anatomyT('innervation_label', this.lang))}:</strong> ${esc(part.innervation[lang])}</div>` : ''}
        ${diseases.length ? `<div class="anatomy-info-row"><strong>${esc(anatomyT('diseases_label', this.lang))}:</strong> ${diseases.map(esc).join('، ')}</div>` : ''}
      </div>`;
  }
}
