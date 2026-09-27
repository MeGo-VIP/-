// data/anatomy-map.js — the single source of truth describing:
//   1) which visual LAYERS exist and how the loader recognizes them, and
//   2) the metadata shown in the info panel for each selectable structure.
//
// IMPORTANT (per project rules): this file must never invent unverified
// medical detail. Every entry below is a well-established, textbook-level
// fact (organ function / basic blood supply / basic innervation). Anything
// more specific (dosages, precise clinical values, etc.) must come from a
// reviewed source before being added here — do not extend this file with
// unverified specifics.
//
// HOW A REAL MODEL BINDS TO THIS FILE:
// When you drop a real body.glb into /anatomy/models/, name its meshes/groups
// using the `nodeNames` arrays below (case-insensitive substring match against
// each mesh's `name` or its glTF `extras.layer` / `extras.partId` if present).
// No code changes are required — layerSystem.js and anatomy.js both read
// this map to auto-bind whatever the model provides.

export const LAYERS = [
  { id: 'skin', nodeNames: ['skin', 'jild'], defaultVisible: true, defaultOpacity: 1 },
  { id: 'fat', nodeNames: ['fat', 'adipose'], defaultVisible: false, defaultOpacity: 0.85 },
  { id: 'muscles', nodeNames: ['muscle'], defaultVisible: false, defaultOpacity: 1 },
  { id: 'skeleton', nodeNames: ['bone', 'skeleton'], defaultVisible: false, defaultOpacity: 1 },
  { id: 'organs', nodeNames: ['organ'], defaultVisible: false, defaultOpacity: 1 },
  { id: 'vessels', nodeNames: ['vessel', 'artery', 'vein'], defaultVisible: false, defaultOpacity: 1 },
  { id: 'nerves', nodeNames: ['nerve'], defaultVisible: false, defaultOpacity: 1 },
];

// Body regions used by the Region Navigator (camera focus targets).
// `target` is a placeholder-body anchor name (see core/engine.js placeholder
// group naming) so region focus already works before a real model exists.
export const REGIONS = [
  { id: 'head_neck', ar: 'الرأس والرقبة', en: 'Head & Neck', target: 'region_head' },
  { id: 'thorax', ar: 'الصدر', en: 'Thorax', target: 'region_thorax' },
  { id: 'abdomen', ar: 'البطن', en: 'Abdomen', target: 'region_abdomen' },
  { id: 'pelvis', ar: 'الحوض', en: 'Pelvis', target: 'region_pelvis' },
  { id: 'upper_limb', ar: 'الطرف العلوي', en: 'Upper Limb', target: 'region_arm_r' },
  { id: 'lower_limb', ar: 'الطرف السفلي', en: 'Lower Limb', target: 'region_leg_r' },
  { id: 'spine', ar: 'العمود الفقري', en: 'Spine & Back', target: 'region_spine' },
];

// Selectable structures. `nodeNames` lets the raycaster resolve a clicked
// mesh back to this entry even on the placeholder body (best-effort match)
// and, later, on the real model without any code change.
export const PARTS = [
  {
    id: 'heart',
    layer: 'organs',
    nodeNames: ['heart', 'qalb'],
    names: { ar: 'القلب', en: 'Heart', latin: 'Cor' },
    function: { ar: 'ضخ الدم إلى الرئتين وبقية الجسم عبر انقباضات إيقاعية.', en: 'Pumps blood to the lungs and the rest of the body through rhythmic contractions.' },
    bloodSupply: { ar: 'الشرايين التاجية (يمنى ويسرى).', en: 'Coronary arteries (right and left).' },
    innervation: { ar: 'الجهاز العصبي الذاتي (متعاطف ونظير متعاطف).', en: 'Autonomic nervous system (sympathetic and parasympathetic).' },
    relatedDiseases: { ar: ['احتشاء عضلة القلب', 'قصور القلب', 'اضطراب النظم'], en: ['Myocardial infarction', 'Heart failure', 'Arrhythmia'] },
    vitalsLink: 'heart_rate',
  },
  {
    id: 'lungs',
    layer: 'organs',
    nodeNames: ['lung', 'rea'],
    names: { ar: 'الرئتان', en: 'Lungs', latin: 'Pulmones' },
    function: { ar: 'تبادل الأكسجين وثاني أكسيد الكربون بين الهواء والدم.', en: 'Exchange oxygen and carbon dioxide between inhaled air and the blood.' },
    bloodSupply: { ar: 'الشرايين والأوردة الرئوية.', en: 'Pulmonary arteries and veins.' },
    innervation: { ar: 'الضفيرة الرئوية (متعاطفة ونظيرة متعاطفة).', en: 'Pulmonary plexus (sympathetic and parasympathetic).' },
    relatedDiseases: { ar: ['الربو', 'الالتهاب الرئوي', 'الانسداد الرئوي المزمن'], en: ['Asthma', 'Pneumonia', 'COPD'] },
    vitalsLink: 'spo2',
  },
  {
    id: 'brain',
    layer: 'organs',
    nodeNames: ['brain', 'mukh'],
    names: { ar: 'المخ', en: 'Brain', latin: 'Cerebrum' },
    function: { ar: 'مركز التحكم في الجهاز العصبي: الإدراك والحركة والوظائف الحيوية.', en: 'Central control of the nervous system: cognition, movement, and vital functions.' },
    bloodSupply: { ar: 'الشرايين السباتية والفقرية (دائرة ويليس).', en: 'Carotid and vertebral arteries (Circle of Willis).' },
    innervation: { ar: 'الأعصاب القحفية الاثنا عشر تنشأ منه.', en: 'Origin of the twelve cranial nerves.' },
    relatedDiseases: { ar: ['السكتة الدماغية', 'الصرع', 'إصابات الرأس'], en: ['Stroke', 'Epilepsy', 'Head injury'] },
    vitalsLink: 'gcs',
  },
  {
    id: 'liver',
    layer: 'organs',
    nodeNames: ['liver', 'kabid'],
    names: { ar: 'الكبد', en: 'Liver', latin: 'Hepar' },
    function: { ar: 'الاستقلاب، تصنيع البروتينات وعوامل التخثر، وإزالة السموم.', en: 'Metabolism, synthesis of proteins and clotting factors, and detoxification.' },
    bloodSupply: { ar: 'الشريان الكبدي والوريد البابي.', en: 'Hepatic artery and portal vein.' },
    innervation: { ar: 'الضفيرة الكبدية (متعاطفة ونظيرة متعاطفة).', en: 'Hepatic plexus (sympathetic and parasympathetic).' },
    relatedDiseases: { ar: ['تليف الكبد', 'التهاب الكبد', 'اليرقان'], en: ['Cirrhosis', 'Hepatitis', 'Jaundice'] },
    vitalsLink: 'inr',
  },
  {
    id: 'kidneys',
    layer: 'organs',
    nodeNames: ['kidney', 'kidnaya'],
    names: { ar: 'الكليتان', en: 'Kidneys', latin: 'Renes' },
    function: { ar: 'ترشيح الدم، تنظيم السوائل والكهارل، وإنتاج البول.', en: 'Filter blood, regulate fluids and electrolytes, and produce urine.' },
    bloodSupply: { ar: 'الشرايين والأوردة الكلوية.', en: 'Renal arteries and veins.' },
    innervation: { ar: 'الضفيرة الكلوية (جهاز عصبي ذاتي).', en: 'Renal plexus (autonomic).' },
    relatedDiseases: { ar: ['الفشل الكلوي', 'حصوات الكلى', 'التهاب الكلية'], en: ['Renal failure', 'Kidney stones', 'Nephritis'] },
    vitalsLink: 'creatinine',
  },
  {
    id: 'stomach',
    layer: 'organs',
    nodeNames: ['stomach', 'maeda'],
    names: { ar: 'المعدة', en: 'Stomach', latin: 'Gaster' },
    function: { ar: 'تخزين الطعام وبدء الهضم عبر الأحماض والإنزيمات.', en: 'Stores food and begins digestion via acid and enzymes.' },
    bloodSupply: { ar: 'الشريان المعدي الأيسر والأيمن والشرايين المعدية المعوية.', en: 'Left/right gastric and gastro-omental arteries.' },
    innervation: { ar: 'العصب المبهم والضفيرة الزعترية.', en: 'Vagus nerve and celiac plexus.' },
    relatedDiseases: { ar: ['قرحة المعدة', 'التهاب المعدة', 'الارتجاع المريئي'], en: ['Peptic ulcer', 'Gastritis', 'GERD'] },
  },
  {
    id: 'skeleton_full',
    layer: 'skeleton',
    nodeNames: ['skeleton', 'bone'],
    names: { ar: 'الهيكل العظمي', en: 'Skeleton', latin: 'Systema skeletale' },
    function: { ar: 'الدعامة، حماية الأعضاء، وتخزين الكالسيوم، ومكان تكوّن خلايا الدم.', en: 'Support, organ protection, calcium storage, and blood cell formation.' },
    bloodSupply: { ar: 'شرايين مغذية للعظم (Nutrient arteries) لكل عظمة.', en: 'Periosteal and nutrient arteries per bone.' },
    innervation: { ar: 'أعصاب حسية في السمحاق (الغشاء المحيط بالعظم).', en: 'Sensory nerves in the periosteum.' },
    relatedDiseases: { ar: ['هشاشة العظام', 'الكسور', 'التهاب المفاصل'], en: ['Osteoporosis', 'Fractures', 'Arthritis'] },
  },
  {
    id: 'muscles_full',
    layer: 'muscles',
    nodeNames: ['muscle'],
    names: { ar: 'الجهاز العضلي', en: 'Muscular System', latin: 'Systema musculare' },
    function: { ar: 'إنتاج الحركة، الحفاظ على الوضعية، وإنتاج الحرارة.', en: 'Produces movement, maintains posture, and generates heat.' },
    bloodSupply: { ar: 'شرايين وأوردة خاصة بكل مجموعة عضلية.', en: 'Dedicated arteries and veins per muscle group.' },
    innervation: { ar: 'أعصاب حركية جسدية (Somatic motor nerves).', en: 'Somatic motor nerves.' },
    relatedDiseases: { ar: ['التشنج العضلي', 'الضمور العضلي', 'الإجهاد العضلي'], en: ['Muscle spasm', 'Muscular dystrophy', 'Strain'] },
  },
  {
    id: 'skin_full',
    layer: 'skin',
    nodeNames: ['skin'],
    names: { ar: 'الجلد', en: 'Skin', latin: 'Cutis' },
    function: { ar: 'الحماية، تنظيم الحرارة، والإحساس.', en: 'Protection, thermoregulation, and sensation.' },
    bloodSupply: { ar: 'الضفيرة الجلدية تحت الأدمة.', en: 'Subdermal plexus.' },
    innervation: { ar: 'مستقبلات حسية جلدية متعددة (لمس، ألم، حرارة).', en: 'Multiple cutaneous sensory receptors (touch, pain, temperature).' },
    relatedDiseases: { ar: ['الإكزيما', 'الحروق', 'قرح الفراش'], en: ['Eczema', 'Burns', 'Pressure ulcers'] },
  },
];

export function findPartByNodeName(name) {
  const n = (name || '').toLowerCase();
  return PARTS.find((p) => p.nodeNames.some((k) => n.includes(k)));
}

export function findLayerByNodeName(name) {
  const n = (name || '').toLowerCase();
  return LAYERS.find((l) => l.nodeNames.some((k) => n.includes(k)));
}
