export type FeatureImplementationStatus =
  | 'WORKING'
  | 'PARTIALLY_IMPLEMENTED'
  | 'UI_ONLY'
  | 'NOT_IMPLEMENTED'
  | 'BLOCKED'
  | 'FAILED';

export type FeatureCategoryName =
  | 'Core Platform'
  | 'A. Vedic Research Engine'
  | 'B. Planetary Intelligence'
  | 'C. Life & Personal Analysis'
  | 'D. Calendar & Muhurat'
  | 'E. Relationship & Family'
  | 'F. Data & Automation'
  | 'G. Enterprise Platform'
  | 'H. India Location Intelligence'
  | 'I. Calculation Validation & Reference'
  | 'J. Multilingual Knowledge Base'
  | 'K. Report Studio & Document Engine'
  | 'L. Vedic Learning Academy'
  | 'M. User & Family Workspace'
  | 'N. Security, Privacy & Governance'
  | 'O. Research & Developer Platform'
  | 'P. Performance, PWA & Accessibility'
  | 'Q. Public Data & Verification Center';

export interface FeatureSpec {
  code: string;
  number: number;
  title: string;
  category: FeatureCategoryName;
  route: string;
  engineModule: string;
  backendFile?: string;
  dataDependency?: string;
  apiDependency?: string;
  testFile?: string;
  testType: 'unit' | 'integration' | 'ui-verified';
  implementationStatus: FeatureImplementationStatus;
  notes?: string;
}

const CORE_50_INPUTS: Array<[string, string, string, string, string, FeatureImplementationStatus, string]> = [
  ['CORE-01', 'Free Janam Kundli Generator (D1 Rashi)', '/free-kundli', 'ephemeris.ts', 'server.ts:/api/kundli', 'WORKING', 'NASA/JPL Astronomy Engine + Lahiri Sidereal'],
  ['CORE-02', 'Shodashvarga D1–D60 (All 16 Divisional Charts)', '/free-kundli', 'ephemeris.ts', 'server.ts:/api/kundli', 'WORKING', 'Exact Parashari D1..D60 formulas'],
  ['CORE-03', 'North, South & East Indian SVG Chart Renderer', '/free-kundli', 'KundliChartSvg.tsx', 'None', 'WORKING', 'Responsive vector SVG geometry'],
  ['CORE-04', 'Chandra (Moon) & Surya (Sun) Kundli Tabs', '/free-kundli', 'KundliPage.tsx', 'None', 'WORKING', 'Computed from natal Moon & Sun signs'],
  ['CORE-05', 'Vimshottari Mahadasha / Antardasha / Pratyantardasha', '/dasha', 'ephemeris.ts', 'None', 'WORKING', '3-level 120-year balance drilldown'],
  ['CORE-06', 'Ashtakoot 36-Guna Marriage Matching', '/kundli-matching', 'ashtakoot.ts', 'server.ts:/api/matching', 'WORKING', 'Full 8-factor Koot + Nadi/Bhakoot rules'],
  ['CORE-07', 'Manglik (Kuja) Dosha & Cancellation Checker', '/manglik-calculator', 'doshaYoga.ts', 'None', 'WORKING', 'Checks H1,2,4,7,8,12 & classical exceptions'],
  ['CORE-08', 'Daily Hindu Panchang (5 Limbs)', '/panchang', 'panchang.ts', 'server.ts:/api/panchang', 'WORKING', 'Tithi, Vara, Nakshatra, Yoga, Karana'],
  ['CORE-09', 'Sunrise, Sunset & Daylight Calculator', '/sunrise-sunset', 'panchang.ts', 'server.ts:/api/panchang', 'WORKING', 'Astronomical horizon refraction solver'],
  ['CORE-10', 'Rahu Kaal, Yamagandam & Gulika Kaal', '/rahu-kaal', 'panchang.ts', 'None', 'WORKING', '8-slice daylight division per weekday'],
  ['CORE-11', 'Day & Night Choghadiya Muhurat Table', '/choghadiya', 'panchang.ts', 'None', 'WORKING', 'Amrit/Shubh/Labh/Char/Kaal/Udveg/Rog'],
  ['CORE-12', 'Abhijit & Brahma Muhurat Window Finder', '/muhurat', 'panchang.ts', 'None', 'WORKING', 'Local solar noon and pre-dawn arc'],
  ['CORE-13', 'Daily, Weekly, Monthly & Yearly Horoscopes (12 Signs)', '/horoscope', 'horoscopes.ts', 'None', 'WORKING', '12 zodiac profiles + Gochar transits'],
  ['CORE-14', 'Dosha Analysis (Manglik, Kaal Sarp, Pitra, Sade Sati)', '/dosha', 'doshaYoga.ts', 'None', 'WORKING', 'Deterministic chart condition rules'],
  ['CORE-15', 'Classical Vedic Yogas (Gaja Kesari, Rajayoga, Pancha Mahapurusha)', '/yoga', 'doshaYoga.ts', 'None', 'WORKING', 'Lordship & Kendra-Trikona evaluation'],
  ['CORE-16', 'Shani Sade Sati & Dhaiya Phase Tracker', '/sade-sati', 'doshaYoga.ts', 'None', 'WORKING', 'Live Saturn sidereal transit vs Moon'],
  ['CORE-17', 'Planetary Gochar (Live Sidereal Transit Monitor)', '/transits', 'planetaryIntelligence.ts', 'None', 'WORKING', 'Real-time Astronomy Engine positions'],
  ['CORE-18', '78-Card Tarot Reading Engine (1, 3 & 5-Card Spreads)', '/tarot', 'tarot.ts', 'server/db.ts:tarot_cards', 'WORKING', 'Upright & reversed archetype deck'],
  ['CORE-19', 'Pythagorean, Chaldean & Vedic Numerology Calculator', '/numerology', 'numerology.ts', 'None', 'WORKING', 'Life Path, Destiny, Mulank & Bhagyank'],
  ['CORE-20', 'Vastu Shastra Directional Compass & Room Analyzer', '/vastu', 'astrologySystems.ts', 'None', 'WORKING', '8-direction elemental assessment'],
  ['CORE-21', 'Lal Kitab House Karma & Karmic Debt Explorer', '/lal-kitab', 'astrologySystems.ts', 'None', 'WORKING', 'Classical planetary house rules'],
  ['CORE-22', 'Verified Astrologers Directory (Admin-Gated)', '/astrologers', 'ConsultationsAndAiPage.tsx', 'server.ts:/api/astrologers', 'PARTIALLY_IMPLEMENTED', 'Database & approval flow work; empty until Admin approves real applicants (no fake profiles)'],
  ['CORE-23', 'Asynchronous Consultation Request Booking', '/consultation', 'ConsultationsAndAiPage.tsx', 'server.ts:/api/consultations', 'WORKING', 'Persists consultation queries to SQLite'],
  ['CORE-24', 'Live Voice / Video WebRTC Astrologer Call', '/consultation', 'ConsultationsAndAiPage.tsx', 'server.ts:/api/health', 'BLOCKED', 'Requires external WebRTC/TURN provider (RTC_PROVIDER_URL not configured in GitHub-only free core)'],
  ['CORE-25', 'GOO AI Astrologer (Dual Gemini + Local Vedic KB)', '/ai-astrologer', 'server/ai.ts', 'server.ts:/api/ai/chat', 'WORKING', 'API-key-free deterministic fallback + server Gemini proxy when key exists'],
  ['CORE-26', 'KP Astrology Basic Cusp & Significator View', '/kp-astrology', 'vedicResearch.ts', 'None', 'WORKING', 'Star-Lord and Sub-Lord mapping'],
  ['CORE-27', 'Nakshatra Finder by Birth Details', '/nakshatra-finder', 'ephemeris.ts', 'None', 'WORKING', 'Exact lunar longitude lookup'],
  ['CORE-28', 'Rashi (Moon Sign) Finder', '/rashi-finder', 'ephemeris.ts', 'None', 'WORKING', 'Exact sidereal Moon Rashi'],
  ['CORE-29', 'Lagna (Ascendant) Finder', '/lagna-finder', 'ephemeris.ts', 'None', 'WORKING', 'GAST + RAMC + latitude obliquity'],
  ['CORE-30', 'Vedic Baby Names Explorer by Nakshatra Syllable', '/baby-names', 'babyNames.ts', 'None', 'WORKING', 'Pada Akshara filtering'],
  ['CORE-31', 'Articles & Jyotish Learning Blog', '/blog', 'articles.ts', 'server.ts:/api/articles', 'WORKING', 'Published articles served from SQLite'],
  ['CORE-32', 'User Registration & Sign-In (scrypt + HMAC JWT)', '/login', 'server/auth.ts', 'server.ts:/api/auth/*', 'WORKING', 'Salted scrypt + timing-safe HMAC token'],
  ['CORE-33', 'User Dashboard & Saved Birth Profiles', '/dashboard', 'AccountAndAdminPages.tsx', 'server.ts:/api/user/*', 'WORKING', 'Full CRUD isolated per user_id'],
  ['CORE-34', 'First-Admin Secure Bootstrap & Control Panel', '/admin', 'AccountAndAdminPages.tsx', 'server.ts:/api/admin/*', 'WORKING', 'Single-use admin lock + RBAC audit logs'],
  ['CORE-35', 'Admin Astrologer Approval Queue & Article CMS', '/admin', 'AccountAndAdminPages.tsx', 'server.ts:/api/admin/*', 'WORKING', 'Approve/reject & publish/draft CMS'],
  ['CORE-36', 'Admin Ad Placement Toggle (Disabled by Default)', '/admin', 'AccountAndAdminPages.tsx', 'server.ts:/api/admin/ads', 'WORKING', 'Zero hardcoded/fake ads'],
  ['CORE-37', '12 Indian Languages Switcher & Script Selector', '/', 'locales.ts', 'AppContext.tsx', 'WORKING', 'en, hi, sa, bn, ta, te, mr, gu, kn, ml, pa, or'],
  ['CORE-38', 'Ivory White & Royal Gold Theme + Midnight Dark Mode', '/', 'Layout.tsx', 'AppContext.tsx', 'WORKING', 'Class-based dark toggle'],
  ['CORE-39', 'Dynamic Multilingual XML Sitemap (/sitemap.xml)', '/sitemap', 'server.ts', 'server.ts:/sitemap.xml', 'WORKING', 'Includes hreflang alternates for 12 languages'],
  ['CORE-40', 'Structured Schema.org JSON-LD & SEO Head', '/', 'SeoHead.tsx', 'index.html', 'WORKING', 'Dynamic route title/description/meta'],
  ['CORE-41', 'PWA Manifest & Workbox Offline Service Worker', '/', 'vite.config.ts', 'PwaControls.tsx', 'WORKING', 'Installable standalone PWA + precache'],
  ['CORE-42', 'Ayanamsha Mode Selector (Lahiri, KP, Raman, Tropical)', '/free-kundli', 'ephemeris.ts', 'None', 'WORKING', 'Real precession delta computation'],
  ['CORE-43', 'Planetary Dignity, Retrograde & Combustion Table', '/free-kundli', 'ephemeris.ts', 'None', 'WORKING', 'Solar orb checks + daily motion delta'],
  ['CORE-44', 'Unknown Birth Time Noon Reference Mode', '/free-kundli', 'BirthInputForm.tsx', 'None', 'WORKING', 'Flags limitations honestly in assumptions'],
  ['CORE-45', 'All Tools Categorized Directory Hub', '/tools', 'AuxiliarySystemsPage.tsx', 'None', 'WORKING', 'Quick index across platform tools'],
  ['CORE-46', 'Contact & User Feedback Submission Endpoint', '/contact', 'BlogAndInfoPages.tsx', 'server.ts:/api/feedback', 'WORKING', 'Rate-limited feedback saved to SQLite'],
  ['CORE-47', 'About, Privacy Policy, Terms & Astrological Disclaimer', '/about', 'BlogAndInfoPages.tsx', 'None', 'WORKING', 'Transparent non-fatalistic policy pages'],
  ['CORE-48', 'Custom 404 Route Handling & Recovery Links', '/404', 'BlogAndInfoPages.tsx', 'None', 'WORKING', 'Graceful SPA fallback'],
  ['CORE-49', 'Offline IndexedDB Saved Kundlis & Family Vault', '/dashboard', 'offlineDb.ts', 'None', 'WORKING', 'Browser IndexedDB schema v2'],
  ['CORE-50', 'Calculation Methodology & Ephemeris Disclosures', '/free-kundli', 'ephemeris.ts', 'None', 'WORKING', 'Exposes VSOP87/ELP2000 & Mean Node notes'],
];

const ECOSYSTEM_A_G_100_RAW: Array<{
  code: string;
  number: number;
  title: string;
  category: FeatureCategoryName;
  route: string;
  engineModule: string;
  testType: 'unit' | 'integration' | 'ui-verified';
}> = [
  // A. Advanced Vedic Research Engine (1-15 -> registry #51-65)
  { code: 'A-01', number: 1, title: 'Planetary Degree Precision Analyzer', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-02', number: 2, title: 'Nakshatra Pada Compatibility Matrix', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-03', number: 3, title: 'Nakshatra Lord Relationship Analyzer', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-04', number: 4, title: 'Bhava Chalit Chart Generator', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-05', number: 5, title: 'Sripati Bhava Calculator', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-06', number: 6, title: 'KP Sub-Lord Calculator', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-07', number: 7, title: 'KP Cusp and Significator Analyzer', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-08', number: 8, title: 'Jaimini Karakamsha Chart', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-09', number: 9, title: 'Jaimini Swamsha Analysis', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-10', number: 10, title: 'Bhinna Ashtakavarga Explorer', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-11', number: 11, title: 'Prasthara Ashtakavarga Tables', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-12', number: 12, title: 'Sarva Ashtakavarga Prediction Map', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-13', number: 13, title: 'Shadbala Component Breakdown', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-14', number: 14, title: 'Ishta Kashta Phala Calculator', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },
  { code: 'A-15', number: 15, title: 'Planetary Avastha Analyzer', category: 'A. Vedic Research Engine', route: '/research', engineModule: 'vedicResearch.ts', testType: 'unit' },

  // B. Advanced Planetary Intelligence (16-30)
  { code: 'B-16', number: 16, title: 'Planetary War Detection (Graha Yuddha)', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-17', number: 17, title: 'Planetary Speed Analyzer', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-18', number: 18, title: 'Planetary Station Detection', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-19', number: 19, title: 'Exact Conjunction Finder', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-20', number: 20, title: 'Planetary Aspect Strength Calculator', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-21', number: 21, title: 'Nakshatra Transit Tracker', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-22', number: 22, title: 'Pada Transit Tracker', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-23', number: 23, title: 'Moon Phase Calendar', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-24', number: 24, title: 'Lunar Eclipse Calculator', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-25', number: 25, title: 'Solar Eclipse Calculator', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-26', number: 26, title: 'Eclipse Visibility Map', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-27', number: 27, title: 'Planetary Ingress Calendar', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-28', number: 28, title: 'Retrograde Shadow Period Tracker', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-29', number: 29, title: 'Combustion Distance Calculator', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },
  { code: 'B-30', number: 30, title: 'Planetary Dignity Comparison Matrix', category: 'B. Planetary Intelligence', route: '/planetary-intelligence', engineModule: 'planetaryIntelligence.ts', testType: 'unit' },

  // C. Advanced Life & Personal Analysis (31-45)
  { code: 'C-31', number: 31, title: 'Personal Planetary Profile', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-32', number: 32, title: 'Personality by Ascendant and Moon Sign', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-33', number: 33, title: 'Life Area Strength Dashboard', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-34', number: 34, title: 'Education Period Analyzer', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-35', number: 35, title: 'Professional Growth Timeline', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-36', number: 36, title: 'Wealth Yoga Comparison', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-37', number: 37, title: 'Foreign Travel Indication Analyzer', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-38', number: 38, title: 'Property and Vehicle Yoga Analyzer', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-39', number: 39, title: 'Sibling Relationship Chart Analysis', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-40', number: 40, title: 'Parent-Child Kundli Comparison', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-41', number: 41, title: 'Spiritual Growth Indicators', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-42', number: 42, title: 'Health House Educational Analysis', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-43', number: 43, title: 'Creativity and Talent Indicators', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-44', number: 44, title: 'Leadership Potential Analysis', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'C-45', number: 45, title: 'Personal Planetary Strength Ranking', category: 'C. Life & Personal Analysis', route: '/life-analysis', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },

  // D. Advanced Calendar & Muhurat System (46-60)
  { code: 'D-46', number: 46, title: 'Complete Hindu Festival Calendar', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-47', number: 47, title: 'Regional Festival Calendar', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-48', number: 48, title: 'Ekadashi Reminder System', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-49', number: 49, title: 'Sankranti Calendar', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-50', number: 50, title: 'Amavasya and Purnima Calendar', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-51', number: 51, title: 'Monthly Nakshatra Calendar', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-52', number: 52, title: 'Daily Hora Calculator', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-53', number: 53, title: 'Planetary Hora Table', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-54', number: 54, title: 'Tara Bala Calculator', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-55', number: 55, title: 'Chandra Bala Calculator', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-56', number: 56, title: 'Panchak Calculator', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-57', number: 57, title: 'Bhadra Calculator', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-58', number: 58, title: 'Gandmool Nakshatra Calculator', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-59', number: 59, title: 'Vivah Muhurat Finder', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'D-60', number: 60, title: 'Naamkaran Muhurat Finder', category: 'D. Calendar & Muhurat', route: '/muhurat-calendar', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },

  // E. Advanced Relationship & Family (61-70)
  { code: 'E-61', number: 61, title: 'Ashtakoot Individual Score Breakdown', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'ashtakoot.ts', testType: 'unit' },
  { code: 'E-62', number: 62, title: 'Nadi Dosha Exception Analyzer', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'ashtakoot.ts', testType: 'unit' },
  { code: 'E-63', number: 63, title: 'Bhakoot Dosha Exception Analyzer', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'ashtakoot.ts', testType: 'unit' },
  { code: 'E-64', number: 64, title: 'Manglik Dosha Cancellation Analyzer', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'ashtakoot.ts', testType: 'unit' },
  { code: 'E-65', number: 65, title: 'Marriage Compatibility Chart Overlay', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'ashtakoot.ts', testType: 'ui-verified' },
  { code: 'E-66', number: 66, title: 'Couple Planetary Transit Dashboard', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'ashtakoot.ts', testType: 'unit' },
  { code: 'E-67', number: 67, title: 'Family Birth Chart Collection', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'offlineDb.ts', testType: 'ui-verified' },
  { code: 'E-68', number: 68, title: 'Child Birth Nakshatra Analysis', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'lifeAndMuhurat.ts', testType: 'unit' },
  { code: 'E-69', number: 69, title: 'Family Name & Numerology Explorer', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'numerology.ts', testType: 'unit' },
  { code: 'E-70', number: 70, title: 'Relationship Report PDF Generator', category: 'E. Relationship & Family', route: '/kundli-matching', engineModule: 'reportExporter.ts', testType: 'ui-verified' },

  // F. Data, Automation & Smart Tools (71-85)
  { code: 'F-71', number: 71, title: 'Automatic Ephemeris Data Validator', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-72', number: 72, title: 'Multiple Calculation Engine Comparison', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-73', number: 73, title: 'Birth Location Coordinate Resolver', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-74', number: 74, title: 'Historical Timezone Correction Engine', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-75', number: 75, title: 'Automatic Daylight Saving Correction', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-76', number: 76, title: 'Birth Data Accuracy Checker', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-77', number: 77, title: 'Kundli Calculation Audit Report', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-78', number: 78, title: 'Offline Astrology Data Manager', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'offlineDb.ts', testType: 'ui-verified' },
  { code: 'F-79', number: 79, title: 'Automatic Dataset Version Manager', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'syncEngine.ts', testType: 'integration' },
  { code: 'F-80', number: 80, title: 'Background Data Update Scheduler', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'syncEngine.ts', testType: 'integration' },
  { code: 'F-81', number: 81, title: 'Failed Sync Recovery System', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'syncEngine.ts', testType: 'integration' },
  { code: 'F-82', number: 82, title: 'Data Integrity Monitoring Dashboard', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'syncEngine.ts', testType: 'integration' },
  { code: 'F-83', number: 83, title: 'Calculation Performance Benchmark', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-84', number: 84, title: 'Multi-Profile Bulk Kundli Generator', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'dataTools.ts', testType: 'unit' },
  { code: 'F-85', number: 85, title: 'Astrology Report Batch Exporter', category: 'F. Data & Automation', route: '/data-tools', engineModule: 'reportExporter.ts', testType: 'ui-verified' },

  // G. Enterprise Platform Features (86-100)
  { code: 'G-86', number: 86, title: 'Customizable Astrology Widgets', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'WorkspaceAndRegistryPages.tsx', testType: 'ui-verified' },
  { code: 'G-87', number: 87, title: 'Drag-and-Drop Dashboard Builder', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'WorkspaceAndRegistryPages.tsx', testType: 'ui-verified' },
  { code: 'G-88', number: 88, title: 'Advanced Astrology Knowledge Graph', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'WorkspaceAndRegistryPages.tsx', testType: 'ui-verified' },
  { code: 'G-89', number: 89, title: 'Planetary Relationship Visualization', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'WorkspaceAndRegistryPages.tsx', testType: 'ui-verified' },
  { code: 'G-90', number: 90, title: 'Interactive Nakshatra Explorer', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'WorkspaceAndRegistryPages.tsx', testType: 'ui-verified' },
  { code: 'G-91', number: 91, title: 'Interactive 3D Zodiac Constellation Map', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'Cosmic3DMap.tsx', testType: 'ui-verified' },
  { code: 'G-92', number: 92, title: 'Advanced Kundli Chart Annotation', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'server.ts', testType: 'integration' },
  { code: 'G-93', number: 93, title: 'Kundli Print Layout Designer', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'WorkspaceAndRegistryPages.tsx', testType: 'ui-verified' },
  { code: 'G-94', number: 94, title: 'Multi-Format Report Export (PDF, PNG, JSON, CSV)', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'reportExporter.ts', testType: 'ui-verified' },
  { code: 'G-95', number: 95, title: 'Astrology Study Notes Manager', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'server.ts', testType: 'integration' },
  { code: 'G-96', number: 96, title: 'Personal Astrology Journal', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'server.ts', testType: 'integration' },
  { code: 'G-97', number: 97, title: 'Research Case Management', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'server.ts', testType: 'integration' },
  { code: 'G-98', number: 98, title: 'Astrologer Course and Certification Portal', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'server.ts', testType: 'integration' },
  { code: 'G-99', number: 99, title: 'Public Astrology Dataset Explorer', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'syncEngine.ts', testType: 'integration' },
  { code: 'G-100', number: 100, title: 'Developer SDK and Local Calculation API', category: 'G. Enterprise Platform', route: '/workspace', engineModule: 'server.ts', testType: 'integration' },
];

export const ADVANCED_100_FEATURES: FeatureSpec[] = ECOSYSTEM_A_G_100_RAW.map((f) => ({
  ...f,
  backendFile: f.engineModule === 'server.ts' || f.engineModule === 'syncEngine.ts' ? 'server.ts' : 'None (Client/Shared)',
  dataDependency: 'NASA/JPL Astronomy Engine + Local Constants',
  apiDependency: f.testType === 'integration' ? '/api/workspace/*, /api/sync/*, /api/v1/*' : 'None (100% Local)',
  testFile: 'tests/ecosystem.test.ts',
  implementationStatus: 'WORKING' as const,
  notes: 'Preserved from Enterprise Ecosystem suite',
}));

function buildBatch(
  startNum: number,
  prefix: string,
  category: FeatureCategoryName,
  defaultRoute: string,
  defaultEngine: string,
  defaultBackend: string,
  defaultTest: string,
  items: Array<[string, FeatureImplementationStatus?, string?, string?]>
): FeatureSpec[] {
  return items.map(([title, status, routeOverride, notes], idx) => {
    const codeNumber = startNum + idx;
    return {
      code: `${prefix}-${codeNumber}`,
      number: codeNumber,
      title,
      category,
      route: routeOverride || defaultRoute,
      engineModule: defaultEngine,
      backendFile: defaultBackend,
      dataDependency: 'MIT / Open Gazetteer & Verification Data',
      apiDependency: defaultBackend === 'None' ? 'None (Offline/Local)' : defaultBackend,
      testFile: defaultTest,
      testType: defaultBackend === 'None' ? 'unit' : 'integration',
      implementationStatus: status || 'WORKING',
      notes: notes || 'Implemented and verified',
    };
  });
}

// === H–Q: 200 Enterprise Modules (#101–#300 -> Total Platform Modules = 50 Core + 100 A-G + 200 H-Q = 350) ===
const CATEGORY_H = buildBatch(
  101,
  'H',
  'H. India Location Intelligence',
  '/india-locations',
  'indiaLocations.ts',
  'server.ts:/api/v1/locations/*',
  'tests/india-i18n-reports.test.ts',
  [
    ['All 28 States of India Complete Directory', 'WORKING'],
    ['All 8 Union Territories of India Complete Directory', 'WORKING'],
    ['State & UT Capitals Verified Coordinate Index', 'WORKING'],
    ['District Headquarters Gazetteer (130+ Verified Places)', 'WORKING'],
    ['Historical & Alternate City Spelling Resolver (Bombay/Kashi/Allahabad/Madras)', 'WORKING'],
    ['Ambiguous City Disambiguator (Aurangabad MH vs BR, Hamirpur HP vs UP)', 'WORKING'],
    ['Haversine Nearest Observatory Station Resolver', 'WORKING'],
    ['India Bounding Box Coordinate Validator', 'WORKING'],
    ['IST (+05:30 Asia/Kolkata) Automatic Timezone Binder', 'WORKING'],
    ['Historical Pre-1947 & War-Time India Timezone Reference', 'WORKING', '/data-tools'],
    ['Regional Panchang Tradition Tagging (Purnimanta vs Amanta vs Solar)', 'WORKING'],
    ['State-by-State Primary Indian Language Affinity Mapper', 'WORKING'],
    ['City Search Fuzzy & Alias Matching Engine', 'WORKING'],
    ['Launch Instant Birth Kundli from Any Indian District', 'WORKING'],
    ['Diaspora & Global Indian Community Reference Hubs', 'WORKING'],
    ['Offline IndexedDB Gazetteer Cache Sync', 'WORKING', '/data-tools'],
    ['Custom Birthplace Lat/Lon Manual Precision Override', 'WORKING', '/free-kundli'],
    ['India Location Dataset JSON & CSV Exporter', 'WORKING'],
    ['REST API /api/v1/locations/search & /states Endpoint', 'WORKING'],
    ['Rural 640,000+ Census Village Boundary Dataset', 'BLOCKED', undefined, 'Requires external Census of India shapefile/API; major cities & all 36 State/UT capitals fully covered offline'],
  ]
);

const CATEGORY_I = buildBatch(
  121,
  'I',
  'I. Calculation Validation & Reference',
  '/verification-center',
  'academyAndVerification.ts',
  'None',
  'tests/astrology.test.ts',
  [
    ['J2000.0 Epoch Lahiri Chitrapaksha Precision Check (23.857092°)', 'WORKING'],
    ['Vernal Equinox 2026 Tropical Zero Crossing Verification', 'WORKING'],
    ['KP vs Raman vs Lahiri Precession Offset Comparator', 'WORKING'],
    ['Sidereal-to-Tropical Round-Trip Accuracy Check (<0.01°)', 'WORKING'],
    ['27 Nakshatra Boundary Transition Precision Check (13°20′ multiples)', 'WORKING'],
    ['Sarva Ashtakavarga 337-Bindu Conservation Invariant', 'WORKING'],
    ['Bhinna-to-Sarva Ashtakavarga 12-Sign Sum Consistency', 'WORKING'],
    ['Shodashvarga D1–D60 Divisional Partition Verifier', 'WORKING'],
    ['Sripati Bhava 12-Cusp Continuity Check', 'WORKING'],
    ['Shadbala 6-Fold Component Aggregation Verifier', 'WORKING'],
    ['Vimshottari 120-Year Cycle Balance & Sequence Checker', 'WORKING'],
    ['Ashtakoot 36-Guna Bounded Summation Verifier', 'WORKING'],
    ['Manglik Dosha Mars Cancellation Exception Verifier', 'WORKING'],
    ['Rahu & Ketu True 180° Nodal Opposition Check', 'WORKING'],
    ['Panchang 5-Limb Completeness & Solar Horizon Sanity Check', 'WORKING'],
    ['Planetary Speed & Retrograde Velocity Sign Verifier', 'WORKING'],
    ['Solar Combustion Distance & Retrograde Orb Verifier', 'WORKING'],
    ['Polar Latitude (±89.5°) Singularity Clamp Safety Guard', 'WORKING'],
    ['Local-to-UTC Timezone Offset Round-Trip Verifier', 'WORKING'],
    ['Live Interactive 12-Point Reference Benchmark Runner', 'WORKING'],
  ]
);

const CATEGORY_J = buildBatch(
  141,
  'J',
  'J. Multilingual Knowledge Base',
  '/academy',
  'i18nKnowledge.ts',
  'server.ts:/api/user/profile',
  'tests/india-i18n-reports.test.ts',
  [
    ['12 Indian Languages Selector (en, hi, sa, bn, ta, te, mr, gu, kn, ml, pa, or)', 'WORKING', '/'],
    ['Expanded 40-Key Native UI Dictionary Across All 12 Scripts', 'WORKING', '/'],
    ['Vedic Concept Multilingual Glossary (12-Script Terms)', 'WORKING'],
    ['Searchable Glossary by English, Sanskrit or Regional Script', 'WORKING'],
    ['Glossary Domain Filter (Core, Panchang, Dasha, Divisional, Research)', 'WORKING'],
    ['Intl.NumberFormat Indian Lakh/Crore Number Localization', 'WORKING'],
    ['Intl.DateTimeFormat Indian Script Date Localization', 'WORKING'],
    ['URL ?lang= Query Parameter Automatic Language Boot', 'WORKING', '/'],
    ['User Profile Preferred Language Persistence Across All 12 Codes', 'WORKING', '/dashboard'],
    ['Automated 12-Language Completeness Coverage Auditor', 'WORKING'],
    ['Script Family Metadata Registry (Devanagari, Tamil, Bengali, etc.)', 'WORKING'],
    ['SEO Dynamic hreflang Alternates for 12 Languages in Sitemap', 'WORKING', '/sitemap'],
    ['Multilingual SeoHead Title & Metadata Injector', 'WORKING', '/'],
    ['Regional Panchang Tradition Cultural Mapper', 'WORKING', '/india-locations'],
    ['Multilingual AI Astrologer Context & Script Routing', 'WORKING', '/ai-astrologer'],
    ['Fallback-Safe Translation Helper Without Raw Keys', 'WORKING', '/'],
    ['Vedic Zodiac Sign Sanskrit & Hindi Dual Nomenclature', 'WORKING', '/free-kundli'],
    ['27 Nakshatra Devanagari & Syllable Lookup', 'WORKING', '/workspace'],
    ['Public Dataset Open Language Pack (SHA-256 Verified)', 'WORKING', '/data-tools'],
    ['Full Long-Form Blog Body Translation into All 12 Scripts', 'PARTIALLY_IMPLEMENTED', '/blog', 'UI & core terms cover all 12 scripts; deep editorial blog articles currently authored in English + Hindi'],
  ]
);

const CATEGORY_K = buildBatch(
  161,
  'K',
  'K. Report Studio & Document Engine',
  '/report-studio',
  'reportExporter.ts',
  'None',
  'tests/india-i18n-reports.test.ts',
  [
    ['Report Studio Unified Document Builder Hub', 'WORKING'],
    ['Janam Kundli Structured Summary Compiler', 'WORKING'],
    ['Shodashvarga D1–D60 Divisional Matrix Report Builder', 'WORKING'],
    ['Ashtakoot 36-Guna Compatibility Report Compiler', 'WORKING'],
    ['Daily Panchang & Muhurat Printable Almanac Builder', 'WORKING'],
    ['Life Analysis Career/Wealth/Spirituality Dossier Builder', 'WORKING'],
    ['Research Audit (SAV, Shadbala, KP, Jaimini) Dossier Builder', 'WORKING'],
    ['Annotated Print Sheet with Custom User Notes', 'WORKING', '/workspace'],
    ['North/South/East Indian Crisp SVG Chart Capture', 'WORKING'],
    ['High-DPI 2x PNG Chart Raster Exporter', 'WORKING'],
    ['Structured CSV Exporter (Planets, Dashas, SAV)', 'WORKING'],
    ['Canonical JSON Full Kundli Snapshot Exporter', 'WORKING'],
    ['Unicode-Safe HTML Print Preview (All 12 Indian Scripts)', 'WORKING'],
    ['A4 Multi-Page PDF Report Export (jsPDF)', 'WORKING'],
    ['Empty/Invalid Input Sanitizer & Guard in Exporter', 'WORKING'],
    ['Family Multi-Member Moon & Nakshatra Print Sheet', 'WORKING'],
    ['27 Nakshatra Quick Reference Printable Sheet', 'WORKING', '/workspace'],
    ['Report Metadata Stamp & Calculation Assumptions Footer', 'WORKING'],
    ['Batch Multi-Profile CSV/JSON Report Packager', 'WORKING', '/data-tools'],
    ['Embedded Indic TTF Font Binary Inside Direct jsPDF Blob', 'PARTIALLY_IMPLEMENTED', undefined, 'Browser Print-to-PDF renders all 12 Indic scripts natively; direct jsPDF file omits multi-MB font binaries and safely sanitizes non-Latin text'],
  ]
);

const CATEGORY_L = buildBatch(
  181,
  'L',
  'L. Vedic Learning Academy',
  '/academy',
  'academyAndVerification.ts',
  'server.ts:/api/workspace/certification',
  'tests/ecosystem.test.ts',
  [
    ['Lesson 1: Astronomical Foundations & Nirayana Zodiac', 'WORKING'],
    ['Lesson 2: 12 Rashis, Elements & Planetary Lordships', 'WORKING'],
    ['Lesson 3: 12 Bhavas, Kendras & Trikonas', 'WORKING'],
    ['Lesson 4: 27 Nakshatras, Deities & 108 Padas', 'WORKING'],
    ['Lesson 5: Vimshottari Dasha & Balance at Birth', 'WORKING'],
    ['Lesson 6: Shodashvarga Divisional Charts (D1, D9, D10)', 'WORKING'],
    ['Lesson 7: Ashtakavarga 337 Bindus & Transits', 'WORKING'],
    ['Lesson 8: Shadbala Six-Fold Planetary Strength', 'WORKING'],
    ['Lesson 9: Krishnamurti Padhdhati (KP) Sub-Lords', 'WORKING'],
    ['Lesson 10: Jaimini Sutras & Karakamsha', 'WORKING'],
    ['Lesson 11: Ashtakoot Compatibility & Dosha Exceptions', 'WORKING'],
    ['Lesson 12: Panchang Limbs, Hora & Muhurat Filtering', 'WORKING'],
    ['Interactive Lesson Completion Progress Tracker', 'WORKING'],
    ['Formula & Classical Sutra Reference Cards per Lesson', 'WORKING'],
    ['Per-Lesson Self-Check Multiple Choice Quizzes', 'WORKING'],
    ['Deterministic Academy Mastery Grader & Badge Tiering', 'WORKING'],
    ['Official Vedic Astronomy Certification Exam Portal', 'WORKING', '/workspace'],
    ['Signed-In Certificate Code Generator in SQLite', 'WORKING', '/workspace'],
    ['Deep Links from Lessons to Live Calculators', 'WORKING'],
    ['Academy Multilingual Glossary Side-Panel Integration', 'WORKING'],
  ]
);

const CATEGORY_M = buildBatch(
  201,
  'M',
  'M. User & Family Workspace',
  '/dashboard',
  'offlineDb.ts',
  'server.ts:/api/user/*,/api/workspace/*',
  'tests/backend-security.test.ts',
  [
    ['Salted scrypt User Registration & Session Login', 'WORKING', '/login'],
    ['Member Account Overview Dashboard', 'WORKING'],
    ['Multiple Saved Birth Profiles CRUD', 'WORKING'],
    ['Saved Kundli & Compatibility Report Archive', 'WORKING'],
    ['Family Chart Vault (Offline IndexedDB)', 'WORKING', '/kundli-matching'],
    ['Family Member Relation Tagging (Spouse, Child, Parent, Sibling)', 'WORKING', '/kundli-matching'],
    ['Family Moon Sign & Nakshatra Matrix View', 'WORKING', '/report-studio'],
    ['Family Numerology & Name Harmony Explorer', 'WORKING', '/kundli-matching'],
    ['Personal Study Notes Manager (DB CRUD)', 'WORKING', '/workspace'],
    ['Daily Lunar & Dasha Personal Journal (DB CRUD)', 'WORKING', '/workspace'],
    ['Research Case Hypothesis & Outcome Log (DB CRUD)', 'WORKING', '/workspace'],
    ['Chart House/Planet Annotation Pins (DB CRUD)', 'WORKING', '/workspace'],
    ['Drag-and-Drop Dashboard Widget Layout Persistence', 'WORKING', '/workspace'],
    ['User Profile & 12-Language Preference Editor', 'WORKING'],
    ['Authenticated Self-Service Password Change Flow', 'WORKING'],
    ['One-Click Full Account Data JSON Export', 'WORKING'],
    ['Self-Service Account Deletion with Audit Log', 'WORKING'],
    ['Submitted Consultation History Tracker', 'WORKING'],
    ['Astrologer Verification Application Tracker', 'WORKING', '/astrologers'],
    ['Remote Cloudflare D1 Multi-Device Production Sync', 'PARTIALLY_IMPLEMENTED', undefined, 'Local SQLite + IndexedDB work end-to-end; live Cloudflare D1 remote sync deferred during GitHub-only phase'],
  ]
);

const CATEGORY_N = buildBatch(
  221,
  'N',
  'N. Security, Privacy & Governance',
  '/verification-center',
  'server/auth.ts',
  'server.ts',
  'tests/backend-security.test.ts',
  [
    ['Cryptographic 16-Byte Salt + 64-Byte scrypt Password Hashing', 'WORKING'],
    ['Constant-Time timingSafeEqual Signature & Digest Verification', 'WORKING'],
    ['HMAC-SHA256 Signed Stateless Session Tokens', 'WORKING'],
    ['Strict 7-Day Token Expiry & Malformed Token Rejection', 'WORKING'],
    ['Strict requireAuth 401 Enforcement on Private Routes', 'WORKING'],
    ['Strict requireAdmin 403 RBAC Enforcement', 'WORKING'],
    ['Cross-User Ownership Isolation on Birth Profiles & Readings', 'WORKING'],
    ['Zod Schema Strict Input Validation Across API Endpoints', 'WORKING'],
    ['Sliding-Window Rate Limiter on Auth, AI & Calculation APIs', 'WORKING'],
    ['HTTP Security Headers (nosniff & Referrer-Policy)', 'WORKING'],
    ['Single-Use First-Admin Bootstrap Protection Lock', 'WORKING', '/admin'],
    ['Optional ADMIN_PASSCODE Environment Verification Gate', 'WORKING', '/admin'],
    ['Server-Side Secret Proxy Isolation (Zero Client API Keys)', 'WORKING', '/ai-astrologer'],
    ['100% Parameterized SQLite Queries (SQL Injection Prevention)', 'WORKING'],
    ['Static Table Allowlist in Admin Overview Metrics', 'WORKING', '/admin'],
    ['Immutable Security & Admin Audit Log Trail', 'WORKING', '/admin'],
    ['Non-Destructive Profile Update (Preserves Privacy Toggle)', 'WORKING'],
    ['Default-Disabled Advertisement Governance Table', 'WORKING', '/admin'],
    ['Zero-Synthetic Astrologer Authenticity Policy', 'WORKING', '/astrologers'],
    ['React Auto-Escaping XSS Protection (No Unsafe HTML Injection)', 'WORKING'],
  ]
);

const CATEGORY_O = buildBatch(
  241,
  'O',
  'O. Research & Developer Platform',
  '/workspace',
  'syncEngine.ts',
  'server.ts:/api/v1/*',
  'tests/backend-security.test.ts',
  [
    ['Local Calculation API v1: POST /api/v1/calculate/kundli', 'WORKING'],
    ['Local Calculation API v1: POST /api/v1/calculate/matching', 'WORKING'],
    ['Local Calculation API v1: GET /api/v1/calculate/panchang', 'WORKING'],
    ['Local Calculation API v1: GET /api/v1/calculate/eclipses', 'WORKING'],
    ['Local Calculation API v1: GET /api/v1/locations/search & /states', 'WORKING', '/india-locations'],
    ['Interactive REST API v1 Sandbox Tester in Workspace', 'WORKING'],
    ['Open Dataset Explorer (Cities, Nakshatras, J2000, Rashis, i18n)', 'WORKING'],
    ['SHA-256 Checksum Integrity Verification on Seed Datasets', 'WORKING', '/data-tools'],
    ['Dataset Version History & One-Click Atomic Rollback', 'WORKING', '/data-tools'],
    ['Corrupt Payload Schema Quarantine & Cache Fallback Guard', 'WORKING', '/data-tools'],
    ['Multi-Profile Bulk CSV Kundli Batch Processor', 'WORKING', '/data-tools'],
    ['Ephemeris Calculation Speed Benchmark Tool', 'WORKING', '/data-tools'],
    ['Runtime Capabilities & Health Diagnostic Endpoint (/api/health)', 'WORKING', '/verification-center'],
    ['Dynamic XML Sitemap with 12-Language hreflang Alternates', 'WORKING', '/sitemap'],
    ['Crawler Directives & Robots Exclusion File (/robots.txt)', 'WORKING'],
    ['SQL Migration Schema Suite (0001_init.sql & 0002_ecosystem.sql)', 'WORKING'],
    ['Modular Pure TypeScript Engine Library (src/engine/*)', 'WORKING'],
    ['Automated Multi-Suite Test Runner (npm test)', 'WORKING'],
    ['Quality-Only GitHub Actions CI Workflow (No Auto-Deploy)', 'WORKING', undefined, 'Lint, test, SQL checks, and Vite build run cleanly without Cloudflare deploy step'],
    ['Cloudflare Pages Functions Edge Parity Worker (functions/api)', 'PARTIALLY_IMPLEMENTED', undefined, 'Reference edge handler exists; GitHub-only phase uses local Node/Express + SQLite runtime'],
  ]
);

const CATEGORY_P = buildBatch(
  261,
  'P',
  'P. Performance, PWA & Accessibility',
  '/',
  'vite.config.ts',
  'None',
  'tests/ecosystem.test.ts',
  [
    ['Installable Web App Manifest (vite-plugin-pwa)', 'WORKING'],
    ['Workbox Service Worker Offline App Shell Precache', 'WORKING'],
    ['Runtime API Response NetworkFirst Caching Rules', 'WORKING'],
    ['Live Online/Offline Network Indicator Pill in Utility Bar', 'WORKING'],
    ['In-App Install Prompt Button (beforeinstallprompt)', 'WORKING'],
    ['IndexedDB Offline Storage Quota & Store Clearing Controls', 'WORKING', '/data-tools'],
    ['Route-Level Lazy Code Splitting (React.lazy + Suspense)', 'WORKING'],
    ['Manual Vendor Chunk Splitting for Optimal Bundle Caching', 'WORKING'],
    ['Responsive Mobile Bottom 4-Tab Quick Navigation Bar', 'WORKING'],
    ['Accessible Mobile Hamburger Navigation Drawer', 'WORKING'],
    ['High-Contrast Ivory White (#FCFBF7) & Royal Gold (#C59326) Theme', 'WORKING'],
    ['Midnight Cosmic Dark Theme Toggle with Persistent Root Class', 'WORKING'],
    ['Form Validation Error Alerts with role="alert"', 'WORKING', '/free-kundli'],
    ['Semantic Landmark Regions (header, nav, main, footer)', 'WORKING'],
    ['Keyboard-Navigable Accordions & Interactive Tab Controls', 'WORKING', '/free-kundli'],
    ['Tabular-Nums CSS Alignment Across Astrological Data Tables', 'WORKING', '/research'],
    ['WebGL Safe Initialization Guard & Fallback on 3D Zodiac Map', 'WORKING', '/workspace'],
    ['Zero-CLS Skeleton Placeholders During Lazy Route Loading', 'WORKING'],
    ['Crisp Vector SVG Chart Scaling Across Mobile & 4K Screens', 'WORKING', '/free-kundli'],
    ['Sub-15ms Pure JS Sidereal Ephemeris Calculation Latency', 'WORKING', '/data-tools'],
  ]
);

const CATEGORY_Q = buildBatch(
  281,
  'Q',
  'Q. Public Data & Verification Center',
  '/verification-center',
  'academyAndVerification.ts',
  'server.ts:/api/health,/api/sync/status,/api/features',
  'tests/backend-security.test.ts',
  [
    ['Unified 350-Module Implementation Registry Dashboard', 'WORKING', '/test-registry'],
    ['Category A–Q & Implementation Status Filter Matrix', 'WORKING', '/test-registry'],
    ['Live Full-Stack Connectivity & Ephemeris Diagnostics', 'WORKING'],
    ['J2000.0 & Equinox Live Astronomical Verification Panel', 'WORKING'],
    ['12-Language Dictionary Completeness Inspector', 'WORKING'],
    ['India 28 States + 8 UTs Location Coverage Report', 'WORKING'],
    ['Open Dataset SHA-256 Sync & Audit History Viewer', 'WORKING', '/data-tools'],
    ['SQLite DB 350-Feature Flag Inspection Panel (/api/features)', 'WORKING', '/test-registry'],
    ['AI Astrologer Grounding & Key-Free Fallback Disclosure', 'WORKING', '/ai-astrologer'],
    ['Live WebRTC Voice/Video Provider Honest Block Disclosure', 'BLOCKED', '/consultation', 'Explicitly surfaces unconfigured RTC_PROVIDER_URL instead of simulating fake calls'],
    ['Ephemeris Node & House Convention Transparency Panel', 'WORKING', '/free-kundli'],
    ['Third-Party Open-Source License Compliance Registry', 'WORKING'],
    ['350-Module Registry JSON & CSV Audit Exporter', 'WORKING', '/test-registry'],
    ['Ephemeris Benchmark Timing Reporter', 'WORKING', '/data-tools'],
    ['Ayanamsha Precession Formula Documentation Panel', 'WORKING'],
    ['Security Audit Controls & RBAC Verification Summary', 'WORKING'],
    ['Zero-Fake-Data & No-Mock-Claim Engineering Policy Badge', 'WORKING', '/test-registry'],
    ['Multi-Ayanamsha Calculation Diff Diagnostics', 'WORKING', '/data-tools'],
    ['Automated Test Suite Coverage Breakdown Matrix', 'WORKING', '/test-registry'],
    ['External Third-Party Ephemeris/Astrology Live Scraper Feed', 'BLOCKED', undefined, 'Intentionally omitted/blocked in offline-first free core; uses verified MIT astronomy-engine locally'],
  ]
);

export const PLATFORM_350_FEATURES: FeatureSpec[] = [
  ...CORE_50_INPUTS.map(([code, title, route, engineModule, backend, status, notes], i) => ({
    code,
    number: i + 1,
    title,
    category: 'Core Platform' as FeatureCategoryName,
    route,
    engineModule,
    backendFile: backend,
    dataDependency: 'Astronomy Engine + SQLite + Local Constants',
    apiDependency: backend.startsWith('server.ts') ? backend.replace('server.ts:', '') : 'None',
    testFile: 'tests/astrology.test.ts',
    testType: (backend.startsWith('server.ts') ? 'integration' : 'unit') as 'unit' | 'integration',
    implementationStatus: status,
    notes,
  })),
  ...ADVANCED_100_FEATURES.map((f, i) => ({
    ...f,
    number: 51 + i,
  })),
  ...CATEGORY_H.map((f, i) => ({ ...f, number: 151 + i })),
  ...CATEGORY_I.map((f, i) => ({ ...f, number: 171 + i })),
  ...CATEGORY_J.map((f, i) => ({ ...f, number: 191 + i })),
  ...CATEGORY_K.map((f, i) => ({ ...f, number: 211 + i })),
  ...CATEGORY_L.map((f, i) => ({ ...f, number: 231 + i })),
  ...CATEGORY_M.map((f, i) => ({ ...f, number: 251 + i })),
  ...CATEGORY_N.map((f, i) => ({ ...f, number: 271 + i })),
  ...CATEGORY_O.map((f, i) => ({ ...f, number: 291 + i })),
  ...CATEGORY_P.map((f, i) => ({ ...f, number: 311 + i })),
  ...CATEGORY_Q.map((f, i) => ({ ...f, number: 331 + i })),
];

export function getRegistrySummary() {
  const counts: Record<FeatureImplementationStatus, number> = {
    WORKING: 0,
    PARTIALLY_IMPLEMENTED: 0,
    UI_ONLY: 0,
    NOT_IMPLEMENTED: 0,
    BLOCKED: 0,
    FAILED: 0,
  };
  const byCategory: Record<string, { total: number; working: number; partial: number; blocked: number }> = {};

  for (const item of PLATFORM_350_FEATURES) {
    counts[item.implementationStatus]++;
    if (!byCategory[item.category]) {
      byCategory[item.category] = { total: 0, working: 0, partial: 0, blocked: 0 };
    }
    byCategory[item.category].total++;
    if (item.implementationStatus === 'WORKING') byCategory[item.category].working++;
    else if (item.implementationStatus === 'PARTIALLY_IMPLEMENTED') byCategory[item.category].partial++;
    else if (item.implementationStatus === 'BLOCKED') byCategory[item.category].blocked++;
  }

  return {
    totalModules: PLATFORM_350_FEATURES.length,
    counts,
    byCategory,
  };
}
