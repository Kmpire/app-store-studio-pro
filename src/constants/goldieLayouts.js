export const LAYOUT_KEYS = [
  'classic',
  'copy-below',
  'hero',
  'offset',
  'tilt',
  'tilt-right',
  'duo',
  'duo-tilt',
  'panorama',
  'panorama-duo',
  'minimal'
];

export const GOLDIE_LAYOUTS = {
  'classic': {
    key: 'classic',
    name: 'Classic Centered',
    nameAr: 'تقليدي في المنتصف',
    description: 'Headline and subhead on top, centered device underneath.',
    descriptionAr: 'عنوان في الأعلى وجهاز في المنتصف.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'primary', widthRatio: 0.84, x: 0, y: 320, rotate: 0, scale: 1.8 }
    ]
  },
  'copy-below': {
    key: 'copy-below',
    name: 'Copy Below',
    nameAr: 'النص في الأسفل',
    description: 'Device positioned at top, headline and subhead at bottom.',
    descriptionAr: 'الجهاز في الأعلى والنصوص التسويقية في الأسفل.',
    span: 1,
    copyPosition: 'bottom',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'primary', widthRatio: 0.84, x: 0, y: -260, rotate: 0, scale: 1.8 }
    ]
  },
  'hero': {
    key: 'hero',
    name: 'Hero Focus',
    nameAr: 'تركيز بطل (Hero)',
    description: 'Prominent, larger device with elevated presence.',
    descriptionAr: 'جهاز بحجم أكبر وبارز لجذب الانتباه.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.20,
    devices: [
      { capture: 'primary', widthRatio: 0.94, x: 0, y: 360, rotate: 0, scale: 2.1 }
    ]
  },
  'offset': {
    key: 'offset',
    name: 'Offset Left/Right',
    nameAr: 'إزاحة جانبية',
    description: 'Left-aligned text with device shifted to the side.',
    descriptionAr: 'نص محاذي لليسار مع إزاحة الجهاز للجانب.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'left',
    copyHeightRatio: 0.24,
    devices: [
      { capture: 'primary', widthRatio: 0.86, x: 160, y: 340, rotate: 0, scale: 1.85 }
    ]
  },
  'tilt': {
    key: 'tilt',
    name: 'Tilted Left 3D',
    nameAr: 'مائل لليسار 3D',
    description: 'Isometric 3D rotation tilted counter-clockwise.',
    descriptionAr: 'دوران ثلاثي الأبعاد مائل لليسار بشكل ديناميكي.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'primary', widthRatio: 0.85, x: 40, y: 330, rotate: -12, scale: 1.85 }
    ]
  },
  'tilt-right': {
    key: 'tilt-right',
    name: 'Tilted Right 3D',
    nameAr: 'مائل لليمين 3D',
    description: 'Isometric 3D rotation tilted clockwise.',
    descriptionAr: 'دوران ثلاثي الأبعاد مائل لليمين.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'primary', widthRatio: 0.85, x: -40, y: 330, rotate: 12, scale: 1.85 }
    ]
  },
  'duo': {
    key: 'duo',
    name: 'Duo Devices',
    nameAr: 'جهازان متداخلان',
    description: 'Two devices in one slide showcasing related screens.',
    descriptionAr: 'جهازان في شاشة واحدة لعرض شاشتين متكاملتين.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'secondary', widthRatio: 0.74, x: -160, y: 380, rotate: -6, scale: 1.55, zIndex: 5 },
      { capture: 'primary', widthRatio: 0.78, x: 140, y: 320, rotate: 4, scale: 1.7, zIndex: 10 }
    ]
  },
  'duo-tilt': {
    key: 'duo-tilt',
    name: 'Duo Tilted 3D',
    nameAr: 'جهازان مائلان 3D',
    description: 'Two heavily tilted perspective devices side-by-side.',
    descriptionAr: 'جهازان بدوران ثلاثي الأبعاد وزاوية عميقة.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'secondary', widthRatio: 0.76, x: -180, y: 390, rotate: -14, scale: 1.6, zIndex: 5 },
      { capture: 'primary', widthRatio: 0.80, x: 130, y: 310, rotate: -10, scale: 1.75, zIndex: 10 }
    ]
  },
  'panorama': {
    key: 'panorama',
    name: 'Panorama Span (2 Slides)',
    nameAr: 'بانوراما ممتدة (شاشتان)',
    description: 'One continuous composition across 2 slides; sliced into 2 PNGs on export.',
    descriptionAr: 'تصميم عريض ممتد عبر شاشتين يتقطع تلقائياً لملفين عند التصدير.',
    span: 2,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'primary', widthRatio: 0.92, x: 0, y: 300, rotate: 0, scale: 2.2, spanCenter: true }
    ]
  },
  'panorama-duo': {
    key: 'panorama-duo',
    name: 'Panorama Duo (2 Slides)',
    nameAr: 'بانوراما بجهازين (شاشتان)',
    description: 'Two distinct devices spread across a seamless 2-slide panorama.',
    descriptionAr: 'جهازان موزعان بتناسق عبر شريحتين ممتدتين.',
    span: 2,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.22,
    devices: [
      { capture: 'primary', widthRatio: 0.84, x: -320, y: 320, rotate: -8, scale: 1.85, zIndex: 10 },
      { capture: 'secondary', widthRatio: 0.84, x: 320, y: 340, rotate: 8, scale: 1.85, zIndex: 5 }
    ]
  },
  'minimal': {
    key: 'minimal',
    name: 'Minimal Screen Focus',
    nameAr: 'تركيز بسيط وبدون حواف',
    description: 'Clean, distraction-free screen focus with minimal typography.',
    descriptionAr: 'تركيز خالص على التطبيق بتصميم بسيط ونظيف.',
    span: 1,
    copyPosition: 'top',
    copyAlign: 'center',
    copyHeightRatio: 0.15,
    devices: [
      { capture: 'primary', widthRatio: 0.88, x: 0, y: 280, rotate: 0, scale: 1.9 }
    ]
  }
};

export const TEMPLATE_SEQUENCES = {
  editorial: {
    key: 'editorial',
    name: 'Editorial Flow',
    nameAr: 'تدفق تحريري (Editorial)',
    description: 'Starts with a stunning Panorama, followed by Hero, Tilt, and Minimal.',
    descriptionAr: 'يبدأ ببانوراما رائعة متبوعة بـ Hero ومائل وMinimal.',
    layouts: ['panorama', 'hero', 'tilt', 'minimal', 'classic']
  },
  showcase: {
    key: 'showcase',
    name: 'Feature Showcase',
    nameAr: 'عرض الميزات (Showcase)',
    description: 'Highlight features with Hero, Duo, Tilt, and Classic layouts.',
    descriptionAr: 'استعراض قوي للميزات مع Hero و Duo و Tilt.',
    layouts: ['hero', 'duo', 'tilt', 'classic', 'minimal']
  },
  magazine: {
    key: 'magazine',
    name: 'Modern Magazine',
    nameAr: 'مجلة عصرية (Magazine)',
    description: 'Dynamic editorial rhythm with Offset, Tilt, Hero, and Copy-Below.',
    descriptionAr: 'تنسيق عصري بإزاحات وتدرجات نصية متنوعة.',
    layouts: ['offset', 'tilt', 'hero', 'copy-below', 'classic']
  },
  storyboard: {
    key: 'storyboard',
    name: 'User Storyboard',
    nameAr: 'قصة المستخدم (Storyboard)',
    description: 'Narrative sequence from Classic intro to Duo-Tilt actions and Minimal finish.',
    descriptionAr: 'سرد متسلسل لقصة استخدام التطبيق خطوة بخطوة.',
    layouts: ['classic', 'tilt', 'duo-tilt', 'hero', 'minimal']
  },
  dynamic: {
    key: 'dynamic',
    name: 'Dynamic 3D',
    nameAr: 'ديناميكي ثلاثي الأبعاد',
    description: 'Energetic composition with 3D tilts, Panorama-Duo, and Hero.',
    descriptionAr: 'حيوية عالية مع زوايا ثلاثية الأبعاد وبانوراما ثنائية.',
    layouts: ['tilt', 'panorama-duo', 'offset', 'hero', 'tilt-right']
  }
};

export const BADGE_PRESETS = [
  { id: 'editors-choice', text: "🏆 Editors' Choice", textAr: '🏆 اختيار المحررين', bg: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '#ffd700' },
  { id: 'top-1', text: '#1 Productivity App', textAr: '#1 في الإنتاجية', bg: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '#3b82f6' },
  { id: 'rated-5', text: '⭐️ 4.9 Star Rating', textAr: '⭐️ تقييم 4.9 نجوم', bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '#f59e0b' },
  { id: 'new-update', text: '✨ Major Update 2.0', textAr: '✨ تحديث جديد 2.0', bg: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '#a855f7' },
  { id: 'privacy-first', text: '🔒 100% Private & Secure', textAr: '🔒 آمن ومحمي 100%', bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '#10b981' }
];

export const SUPPORTED_LOCALES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar-SA', name: 'العربية (Arabic)', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es-ES', name: 'Español (Spanish)', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr-FR', name: 'Français (French)', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de-DE', name: 'Deutsch (German)', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ja-JP', name: '日本語 (Japanese)', flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh-CN', name: '简体中文 (Chinese)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'pt-BR', name: 'Português (Portuguese)', flag: '🇧🇷', dir: 'ltr' },
  { code: 'it-IT', name: 'Italiano (Italian)', flag: '🇮🇹', dir: 'ltr' },
  { code: 'ru-RU', name: 'Русский (Russian)', flag: '🇷🇺', dir: 'ltr' },
  { code: 'tr-TR', name: 'Türkçe (Turkish)', flag: '🇹🇷', dir: 'ltr' },
  { code: 'ko-KR', name: '한국어 (Korean)', flag: '🇰🇷', dir: 'ltr' },
  { code: 'nl-NL', name: 'Nederlands (Dutch)', flag: '🇳🇱', dir: 'ltr' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)', flag: '🇮🇳', dir: 'ltr' }
];
