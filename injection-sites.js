// data/injection-sites.js — Injection Master (Phase 2 of this build).
//
// SCOPE & HONESTY NOTE: angles/depth-levels below are standard, widely-taught
// nursing-fundamentals ranges (the same kind of figures already used in this
// site's own Injections section), not patient-specific prescriptions. Depth
// is modeled as three discrete levels (shallow/medium/deep) rather than a
// fabricated centimeter value, because real depth depends on patient body
// habitus and needle length and must follow institutional protocol — this is
// stated in the UI disclaimer and repeated per-site below.
//
// Anchor coordinates are approximate points on the Phase-1 PLACEHOLDER body
// (a single-capsule limb, not a segmented arm/forearm/hand). They are close
// enough for site-selection practice but are not precise landmark geometry —
// once a real segmented model is added (see /anatomy/models/README.md) these
// anchors should be re-authored against its actual mesh landmarks.

export const INJECTION_CATEGORIES = [
  { id: 'IM', ar: 'عضلي (IM)', en: 'Intramuscular (IM)' },
  { id: 'SC', ar: 'تحت الجلد (SC)', en: 'Subcutaneous (SC)' },
  { id: 'ID', ar: 'داخل الأدمة (ID)', en: 'Intradermal (ID)' },
  { id: 'IV', ar: 'وريدي (IV)', en: 'Intravenous (IV)' },
];

// angle in degrees from the skin surface; depthLevel is one of shallow/medium/deep.
export const INJECTION_SITES = [
  {
    id: 'deltoid', category: 'IM', anchor: [0.42, 1.45, 0.05],
    names: { ar: 'العضلة الدالية', en: 'Deltoid' },
    landmarks: { ar: 'أسفل الأخرم بمقدار 2-3 أصابع، مثلث بين العضلة الدالية.', en: '2–3 finger-widths below the acromion process, within the deltoid triangle.' },
    angle: { min: 72, max: 90 }, depthLevel: 'deep',
    commonErrors: { ar: ['الحقن قريبًا جدًا من الكتف (خطر العصب الإبطي)', 'زاوية غير كافية'], en: ['Injecting too high (risk to axillary nerve)', 'Insufficient angle'] },
    dangerNote: { ar: 'تجنب المنطقة العلوية القريبة من الأخرم — خطر إصابة العصب الإبطي.', en: 'Avoid the area high near the acromion — risk to the axillary nerve.' },
  },
  {
    id: 'vastus_lateralis', category: 'IM', anchor: [0.2, 0.55, 0.02],
    names: { ar: 'الفخذ الوحشي المتسع', en: 'Vastus Lateralis' },
    landmarks: { ar: 'الثلث الأوسط من السطح الأمامي الوحشي للفخذ.', en: 'Middle third of the anterolateral thigh.' },
    angle: { min: 72, max: 90 }, depthLevel: 'deep',
    commonErrors: { ar: ['الحقن قريبًا جدًا من الركبة أو الورك'], en: ['Injecting too close to knee or hip'] },
    dangerNote: { ar: 'موقع آمن نسبيًا؛ يُفضّل للرضع والأطفال.', en: 'Relatively safe site; preferred in infants and young children.' },
  },
  {
    id: 'ventrogluteal', category: 'IM', anchor: [0.12, 0.85, -0.03],
    names: { ar: 'الأرداف الأمامية (Ventrogluteal)', en: 'Ventrogluteal' },
    landmarks: { ar: 'راحة اليد على المدور الأكبر، السبابة على الشوكة الحرقفية الأمامية العلوية.', en: 'Palm on the greater trochanter, index finger on the anterior superior iliac spine.' },
    angle: { min: 80, max: 90 }, depthLevel: 'deep', zTrackApplicable: true,
    commonErrors: { ar: ['عدم تحديد المعالم بشكل صحيح', 'عدم استخدام تقنية Z-track عند الحاجة'], en: ['Incorrect landmarking', 'Not using Z-track technique when indicated'] },
    dangerNote: { ar: 'يُعتبر من أكثر مواقع IM أمانًا؛ بعيد عن العصب الوركي.', en: 'Considered one of the safest IM sites; away from the sciatic nerve.' },
  },
  {
    id: 'dorsogluteal', category: 'IM', anchor: [0.12, 0.8, -0.15],
    names: { ar: 'الأرداف الخلفية (Dorsogluteal)', en: 'Dorsogluteal' },
    landmarks: { ar: 'الربع العلوي الوحشي فقط — لتجنب العصب الوركي.', en: 'Upper outer quadrant only — to avoid the sciatic nerve.' },
    angle: { min: 80, max: 90 }, depthLevel: 'deep', zTrackApplicable: true,
    commonErrors: { ar: ['الحقن خارج الربع العلوي الوحشي (خطر مباشر على العصب الوركي)'], en: ['Injecting outside the upper outer quadrant (direct sciatic nerve risk)'] },
    dangerNote: { ar: '⚠️ أعلى خطورة من ناحية العصب الوركي — أقل استخدامًا حاليًا لصالح Ventrogluteal.', en: '⚠️ Highest sciatic-nerve risk among IM sites — largely superseded by Ventrogluteal in current practice.' },
  },
  {
    id: 'rectus_femoris', category: 'IM', anchor: [0.15, 0.55, 0.08],
    names: { ar: 'مستقيمة الفخذ (Rectus Femoris)', en: 'Rectus Femoris' },
    landmarks: { ar: 'الثلث الأوسط من السطح الأمامي للفخذ.', en: 'Middle third of the anterior thigh.' },
    angle: { min: 72, max: 90 }, depthLevel: 'deep',
    commonErrors: { ar: ['غير مفضل للحقن الذاتي المتكرر لصعوبة الوصول'], en: ['Less preferred for self-injection due to access difficulty'] },
    dangerNote: { ar: 'يُستخدم غالبًا عند تعذّر المواقع الأخرى.', en: 'Often used when other sites are unavailable.' },
  },
  {
    id: 'abdomen_sc', category: 'SC', anchor: [0.1, 1.0, 0.13],
    names: { ar: 'البطن (تحت الجلد)', en: 'Abdomen (SC)' },
    landmarks: { ar: 'على بعد 5 سم على الأقل من السرة، بالتناوب بين المواقع.', en: 'At least 5 cm from the umbilicus, rotating sites.' },
    angle: { min: 45, max: 90 }, depthLevel: 'medium',
    commonErrors: { ar: ['الحقن مباشرة في السرة', 'عدم تدوير مواقع الحقن'], en: ['Injecting directly at the umbilicus', 'Not rotating injection sites'] },
    dangerNote: { ar: 'الموقع الأسرع امتصاصًا للأنسولين مقارنة بمواقع أخرى.', en: 'Fastest insulin absorption compared to other SC sites.' },
  },
  {
    id: 'upper_arm_sc', category: 'SC', anchor: [0.42, 1.45, -0.05],
    names: { ar: 'الذراع العلوية (تحت الجلد)', en: 'Upper Arm (SC)' },
    landmarks: { ar: 'السطح الخلفي الوحشي للذراع العلوية.', en: 'Posterolateral surface of the upper arm.' },
    angle: { min: 45, max: 90 }, depthLevel: 'medium',
    commonErrors: { ar: ['قرص الجلد بقوة زائدة قد يصل للعضلة'], en: ['Over-pinching the skin can reach muscle'] },
    dangerNote: { ar: 'تأكد من قرص طيّة جلدية كافية إذا كان المريض نحيفًا.', en: 'Ensure an adequate skin fold in thin patients.' },
  },
  {
    id: 'thigh_sc', category: 'SC', anchor: [0.15, 0.55, 0.09],
    names: { ar: 'الفخذ (تحت الجلد)', en: 'Thigh (SC)' },
    landmarks: { ar: 'السطح الأمامي الوحشي للفخذ.', en: 'Anterolateral surface of the thigh.' },
    angle: { min: 45, max: 90 }, depthLevel: 'medium',
    commonErrors: { ar: ['اختيار نفس النقطة بشكل متكرر (ضمور شحمي)'], en: ['Repeatedly using the same spot (lipodystrophy)'] },
    dangerNote: { ar: 'موقع شائع للحقن الذاتي (مثل الإنسولين).', en: 'Common self-injection site (e.g., insulin).' },
  },
  {
    id: 'scapular_sc', category: 'SC', anchor: [0, 1.4, -0.12],
    names: { ar: 'منطقة لوح الكتف (تحت الجلد)', en: 'Scapular Region (SC)' },
    landmarks: { ar: 'الطية الجلدية أسفل زاوية لوح الكتف.', en: 'Skin fold below the scapular angle.' },
    angle: { min: 45, max: 90 }, depthLevel: 'medium',
    commonErrors: { ar: ['صعوبة الوصول الذاتي — يحتاج مساعدة غالبًا'], en: ['Hard for self-injection — usually needs assistance'] },
    dangerNote: { ar: 'أقل استخدامًا من مواقع البطن والذراع.', en: 'Less commonly used than abdomen/arm sites.' },
  },
  {
    id: 'forearm_id', category: 'ID', anchor: [0.42, 1.0, 0.03],
    names: { ar: 'الساعد الداخلي (داخل الأدمة)', en: 'Inner Forearm (ID)' },
    landmarks: { ar: 'السطح البطني للساعد، بعيدًا عن الشعر والأوردة الظاهرة.', en: 'Volar forearm surface, away from hair and visible veins.' },
    angle: { min: 5, max: 15 }, depthLevel: 'shallow',
    commonErrors: { ar: ['زاوية كبيرة جدًا (يتحول لتحت الجلد)', 'عدم ظهور حبة (bleb) بعد الحقن'], en: ['Angle too steep (becomes subcutaneous)', 'No visible bleb/wheal after injection'] },
    dangerNote: { ar: 'الموقع القياسي لاختبارات الحساسية (مثل PPD).', en: 'Standard site for skin/allergy testing (e.g., PPD/Mantoux).' },
  },
  {
    id: 'upper_chest_id', category: 'ID', anchor: [0.15, 1.35, 0.12],
    names: { ar: 'أعلى الصدر (داخل الأدمة)', en: 'Upper Chest (ID)' },
    landmarks: { ar: 'أسفل الترقوة مباشرة.', en: 'Just below the clavicle.' },
    angle: { min: 5, max: 15 }, depthLevel: 'shallow',
    commonErrors: { ar: ['اختيار جلد سميك أو مصطبغ يصعّب رؤية النتيجة'], en: ['Choosing thick/pigmented skin makes reading results harder'] },
    dangerNote: { ar: 'بديل عند تعذّر الساعد.', en: 'Alternative when the forearm is unavailable.' },
  },
  {
    id: 'median_cubital', category: 'IV', anchor: [0.42, 0.95, 0.05],
    names: { ar: 'الوريد المرفقي المتوسط', en: 'Median Cubital Vein' },
    landmarks: { ar: 'منتصف الحفرة المرفقية الأمامية؛ أكبر وأكثر الأوردة ثباتًا.', en: 'Middle of the antecubital fossa; largest and most stable vein.' },
    angle: { min: 15, max: 30 }, depthLevel: 'medium',
    commonErrors: { ar: ['زاوية دخول حادة جدًا تخترق الوريد من الجهة المقابلة'], en: ['Too steep an angle punctures through the far vein wall'] },
    dangerNote: { ar: 'الموقع المفضل الأول لسحب الدم والوصول الوريدي الروتيني.', en: 'First-choice site for routine blood draw and venous access.' },
  },
  {
    id: 'cephalic', category: 'IV', anchor: [0.44, 0.9, 0.02],
    names: { ar: 'الوريد الرأسي (Cephalic)', en: 'Cephalic Vein' },
    landmarks: { ar: 'الجانب الكعبري (الإبهامي) من الساعد والذراع.', en: 'Radial (thumb) side of the forearm and arm.' },
    angle: { min: 15, max: 30 }, depthLevel: 'medium',
    commonErrors: { ar: ['تجاهل تدحرج الوريد قبل الثبات الجيد'], en: ['Not stabilizing a "rolling" vein before puncture'] },
    dangerNote: { ar: 'جيد للكانولات الأكبر حجمًا.', en: 'Good for larger-bore cannulas.' },
  },
  {
    id: 'basilic', category: 'IV', anchor: [0.4, 0.9, -0.02],
    names: { ar: 'الوريد القاعدي (Basilic)', en: 'Basilic Vein' },
    landmarks: { ar: 'الجانب الزندي (الخنصري) من الذراع.', en: 'Ulnar (little-finger) side of the arm.' },
    angle: { min: 15, max: 30 }, depthLevel: 'medium',
    commonErrors: { ar: ['قريب من الشريان العضدي والعصب المتوسط — يحتاج حذرًا'], en: ['Close to brachial artery and median nerve — needs care'] },
    dangerNote: { ar: 'أعمق وأقل ثباتًا من الأوردة الأخرى — غالبًا خيار لاحق.', en: 'Deeper and less stable than other veins — often a later choice.' },
  },
  {
    id: 'dorsal_hand', category: 'IV', anchor: [0.42, 0.55, 0.05],
    names: { ar: 'أوردة ظهر اليد', en: 'Dorsal Hand Veins' },
    landmarks: { ar: 'الشبكة الوريدية على ظهر اليد.', en: 'Venous network on the back of the hand.' },
    angle: { min: 10, max: 25 }, depthLevel: 'shallow',
    commonErrors: { ar: ['اختيار قطر صغير جدًا لكانولا كبيرة'], en: ['Choosing too small a vein for a large cannula'] },
    dangerNote: { ar: 'مناسب للاستخدام قصير المدى؛ أكثر إزعاجًا لحركة المريض.', en: 'Suitable for short-term use; more restrictive to patient movement.' },
  },
];

export const DEPTH_LEVEL_LABEL = {
  shallow: { ar: 'سطحي (داخل الأدمة)', en: 'Shallow (intradermal)' },
  medium: { ar: 'متوسط (تحت الجلد)', en: 'Medium (subcutaneous)' },
  deep: { ar: 'عميق (داخل العضلة)', en: 'Deep (intramuscular)' },
};

export function findInjectionSite(id) {
  return INJECTION_SITES.find((s) => s.id === id);
}
