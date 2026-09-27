// data/i18n.js — minimal i18n layer for the Anatomy system.
// Phase 1 ships full Arabic + English. The lookup function falls back to
// English (then to the raw key) so adding more languages later never breaks
// anything — just add another top-level key below.

export const ANATOMY_STRINGS = {
  ar: {
    title: 'المستكشف التشريحي 3D',
    loading: 'جارِ تحميل النموذج...',
    placeholderNotice: '🧬 نموذج تجريبي مبدئي — بانتظار رفع النموذج التشريحي الحقيقي',
    webglUnsupported: 'المتصفح لا يدعم WebGL. جرّب متصفحًا أحدث لعرض المستكشف ثلاثي الأبعاد.',
    searchPlaceholder: '🔍 ابحث عن عضو (قلب، رئة...)',
    layers: 'الطبقات',
    layer_skin: 'الجلد',
    layer_fat: 'الدهون',
    layer_muscles: 'العضلات',
    layer_skeleton: 'الهيكل العظمي',
    layer_organs: 'الأعضاء',
    layer_vessels: 'الأوعية الدموية',
    layer_nerves: 'الأعصاب',
    views: 'زوايا العرض',
    view_reset: 'إعادة ضبط',
    view_front: 'أمام',
    view_back: 'خلف',
    view_left: 'يسار',
    view_right: 'يمين',
    infoPanelEmpty: 'اضغط على أي عضو لعرض تفاصيله هنا.',
    function_label: 'الوظيفة',
    bloodSupply_label: 'التروية الدموية',
    innervation_label: 'التعصيب',
    diseases_label: 'أمراض مرتبطة',
    disclaimer: 'للأغراض التعليمية فقط — ليس بديلًا عن التدريب السريري أو بروتوكولات المؤسسة.',
    close: 'إغلاق',
    regionNavigator: 'مناطق الجسم',
    fps: 'إطار/ث',
  },
  en: {
    title: '3D Anatomy Explorer',
    loading: 'Loading model...',
    placeholderNotice: '🧬 Placeholder demo model — real anatomical model pending upload',
    webglUnsupported: 'Your browser does not support WebGL. Try a newer browser to view the 3D explorer.',
    searchPlaceholder: '🔍 Search a structure (heart, lung...)',
    layers: 'Layers',
    layer_skin: 'Skin',
    layer_fat: 'Fat',
    layer_muscles: 'Muscles',
    layer_skeleton: 'Skeleton',
    layer_organs: 'Organs',
    layer_vessels: 'Blood Vessels',
    layer_nerves: 'Nerves',
    views: 'Views',
    view_reset: 'Reset',
    view_front: 'Front',
    view_back: 'Back',
    view_left: 'Left',
    view_right: 'Right',
    infoPanelEmpty: 'Tap any structure to see its details here.',
    function_label: 'Function',
    bloodSupply_label: 'Blood Supply',
    innervation_label: 'Innervation',
    diseases_label: 'Related Conditions',
    disclaimer: 'Educational use only — not a substitute for clinical training or institutional protocols.',
    close: 'Close',
    regionNavigator: 'Body Regions',
    fps: 'FPS',
  },
};

export function anatomyT(key, lang) {
  const l = ANATOMY_STRINGS[lang] ? lang : 'en';
  return ANATOMY_STRINGS[l][key] ?? ANATOMY_STRINGS.en[key] ?? key;
}
