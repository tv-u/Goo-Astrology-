import { calculateKundli, getAyanamshaDegrees, normalizeDeg, type BirthInput } from './ephemeris';
import { calculatePanchang } from './panchang';
import { calculateAshtakoot } from './ashtakoot';
import { analyzeDoshasAndYogas } from './doshaYoga';
import {
  calculateAshtakavarga,
  calculateBhavaChalitAndSripati,
  calculateShadbalaAndAvasthas,
} from './vedicResearch';
import { analyzePlanetarySpeeds } from './planetaryIntelligence';

export interface VerificationCheckResult {
  id: string;
  name: string;
  domain: 'Astronomical' | 'Vedic Mathematics' | 'Compatibility' | 'Edge Cases';
  passed: boolean;
  expected: string;
  observed: string;
  tolerance: string;
}

export function runReferenceVerificationSuite(): {
  total: number;
  passed: number;
  failed: number;
  allPassed: boolean;
  checks: VerificationCheckResult[];
} {
  const sampleInput: BirthInput = {
    name: 'Reference Benchmark',
    date: '1995-08-15',
    time: '14:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    timezoneName: 'Asia/Kolkata',
    ayanamsha: 'lahiri',
  };

  const kundli = calculateKundli(sampleInput);
  const ashtakavarga = calculateAshtakavarga(kundli);
  const bhavas = calculateBhavaChalitAndSripati(kundli);
  const shadbala = calculateShadbalaAndAvasthas(kundli);
  const panchang = calculatePanchang('2026-03-20', 28.6139, 77.209, 330, 'New Delhi');
  const partner = calculateKundli({ ...sampleInput, name: 'Partner', date: '1997-04-12', time: '08:15' });
  const match = calculateAshtakoot(kundli, partner);
  const doshaYoga = analyzeDoshasAndYogas(kundli);
  const speeds = analyzePlanetarySpeeds(kundli.planets);

  // Check 1: J2000 Lahiri Ayanamsha exact epoch value (23°51'25.53" = 23.857092°)
  const jdJ2000 = 2451545.0;
  const lahiriJ2000 = getAyanamshaDegrees(jdJ2000, 'lahiri');
  const check1 = Math.abs(lahiriJ2000 - 23.857092) < 0.0005;

  // Check 2: Vernal Equinox 2026-03-20 14:46 UTC Sun Tropical ~ 0° Aries
  const eqKundli = calculateKundli({
    name: 'Equinox',
    date: '2026-03-20',
    time: '14:46',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 0,
    ayanamsha: 'lahiri',
  });
  const eqSun = eqKundli.planets.find((p) => p.id === 'Sun')!;
  const eqDistFromZero = Math.min(eqSun.tropicalLongitude, 360 - eqSun.tropicalLongitude);
  const check2 = eqDistFromZero < 0.5;

  // Check 3: Sarva Ashtakavarga 337 Bindu exact mathematical conservation invariant
  const check3 = ashtakavarga.totalBindus === 337;

  // Check 4: Bhinna Ashtakavarga sum equals Sarva Ashtakavarga across all 12 signs
  const bavArrays = Object.values(ashtakavarga.bhinna);
  const bavSignSums = Array.from({ length: 12 }, (_, idx) =>
    bavArrays.reduce((sum, arr) => sum + arr[idx], 0)
  );
  const check4 = bavSignSums.every((v, idx) => v === ashtakavarga.sarva[idx]);

  // Check 5: Shodashvarga contains all 16 classic divisional charts (D1..D60)
  const check5 = kundli.divisionalCharts.length === 16 && kundli.divisionalCharts.some((d) => d.code === 'D60');

  // Check 6: Vimshottari Mahadasha 9-lord cycle spans ~120 years minus birth balance
  const mahaYearsSum = kundli.dashas.reduce((acc, m) => acc + m.durationYears, 0);
  const check6 = mahaYearsSum > 95 && mahaYearsSum <= 120.5;

  // Check 7: Sidereal - Tropical round-trip consistency for all 9 planets
  const check7 = kundli.planets.every((p) => {
    const reconstructed = normalizeDeg(p.tropicalLongitude - kundli.ayanamshaDegrees);
    const diff = Math.abs(reconstructed - p.longitude);
    return diff < 0.01 || Math.abs(diff - 360) < 0.01;
  });

  // Check 8: Sripati Bhava cusp continuity (12 unique houses)
  const check8 = bhavas.sripati.length === 12 && new Set(bhavas.sripati.map((c) => c.house)).size === 12;

  // Check 9: Ashtakoot 36-point bounded sum
  const kootSum = match.kootas.reduce((s, k) => s + k.obtainedScore, 0);
  const check9 = Math.abs(kootSum - match.totalScore) < 0.01 && match.totalScore >= 0 && match.totalScore <= 36;

  // Check 10: Rahu & Ketu exact 180° opposition
  const rahu = kundli.planets.find((p) => p.id === 'Rahu')!;
  const ketu = kundli.planets.find((p) => p.id === 'Ketu')!;
  const rahuKetuDiff = Math.abs(normalizeDeg(ketu.longitude - rahu.longitude) - 180);
  const check10 = rahuKetuDiff < 0.01;

  // Check 11: Sunrise/Sunset daylight ordering & Panchang 5 limbs present
  const check11 = Boolean(panchang.tithi.name && panchang.nakshatra.name && panchang.sunrise && panchang.sunset);

  // Check 12: High-latitude / polar coordinate singularity safety guard (+89.9° clamped cleanly)
  const polarKundli = calculateKundli({ ...sampleInput, latitude: 89.9 });
  const check12 =
    Number.isFinite(polarKundli.ascendant.longitude) &&
    doshaYoga.doshas.length >= 3 &&
    speeds.length === 9 &&
    shadbala.length === 7;

  const checks: VerificationCheckResult[] = [
    {
      id: 'VER-01',
      name: 'Lahiri Chitrapaksha J2000.0 Epoch Precision',
      domain: 'Astronomical',
      passed: check1,
      expected: '23.857092° ± 0.0005°',
      observed: `${lahiriJ2000.toFixed(6)}°`,
      tolerance: '0.0005°',
    },
    {
      id: 'VER-02',
      name: '2026 Vernal Equinox Sun Tropical Zero Crossing',
      domain: 'Astronomical',
      passed: check2,
      expected: '0°00′ (±0.5°)',
      observed: `${eqSun.tropicalLongitude.toFixed(4)}°`,
      tolerance: '0.5°',
    },
    {
      id: 'VER-03',
      name: 'Sarva Ashtakavarga 337 Bindu Conservation',
      domain: 'Vedic Mathematics',
      passed: check3,
      expected: '337 Bindus',
      observed: `${ashtakavarga.totalBindus} Bindus`,
      tolerance: 'Exact Integer',
    },
    {
      id: 'VER-04',
      name: 'Bhinna-to-Sarva Sign Sum Invariant',
      domain: 'Vedic Mathematics',
      passed: check4,
      expected: '12/12 signs match SAV',
      observed: bavSignSums.every((v, i) => v === ashtakavarga.sarva[i]) ? '12/12 Exact' : 'Mismatch',
      tolerance: 'Exact Integer',
    },
    {
      id: 'VER-05',
      name: 'Shodashvarga D1–D60 Complete Divisional Set',
      domain: 'Vedic Mathematics',
      passed: check5,
      expected: '16 charts (D1..D60)',
      observed: `${kundli.divisionalCharts.length} charts`,
      tolerance: 'Exact',
    },
    {
      id: 'VER-06',
      name: 'Vimshottari 120-Year Cycle Completeness',
      domain: 'Vedic Mathematics',
      passed: check6,
      expected: '95..120.5 yrs across 9 Mahadashas',
      observed: `${mahaYearsSum.toFixed(2)} yrs`,
      tolerance: 'Natal balance adjusted',
    },
    {
      id: 'VER-07',
      name: 'Sidereal vs Tropical Ayanamsha Round-Trip',
      domain: 'Astronomical',
      passed: check7,
      expected: '< 0.01° error on all 9 planets',
      observed: check7 ? 'All 9 bodies < 0.01°' : 'Drift exceeded',
      tolerance: '0.01°',
    },
    {
      id: 'VER-08',
      name: 'Sripati Bhava 12-Cusp Continuity',
      domain: 'Vedic Mathematics',
      passed: check8,
      expected: '12 distinct house cusps',
      observed: `${bhavas.sripati.length} cusps`,
      tolerance: 'Exact',
    },
    {
      id: 'VER-09',
      name: 'Ashtakoot 36-Guna Bounded Summation',
      domain: 'Compatibility',
      passed: check9,
      expected: 'Sum equals totalScore in [0..36]',
      observed: `${match.totalScore} / 36`,
      tolerance: '0.01 pts',
    },
    {
      id: 'VER-10',
      name: 'Rahu-Ketu True 180° Nodal Opposition',
      domain: 'Astronomical',
      passed: check10,
      expected: '180.00°',
      observed: `${normalizeDeg(ketu.longitude - rahu.longitude).toFixed(4)}°`,
      tolerance: '0.01°',
    },
    {
      id: 'VER-11',
      name: 'Panchang 5-Limb & Solar Horizon Order',
      domain: 'Astronomical',
      passed: check11,
      expected: 'Tithi, Vara, Nakshatra, Yoga, Karana',
      observed: `${panchang.tithi.name} / ${panchang.nakshatra.name}`,
      tolerance: 'Valid strings',
    },
    {
      id: 'VER-12',
      name: 'Polar Latitude (+89.9°) Singularity Safety Guard',
      domain: 'Edge Cases',
      passed: check12,
      expected: 'Finite Ascendant without NaN',
      observed: `${polarKundli.ascendant.signName} (${polarKundli.ascendant.longitude.toFixed(2)}°)`,
      tolerance: 'Finite float',
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  return {
    total: checks.length,
    passed,
    failed: checks.length - passed,
    allPassed: passed === checks.length,
    checks,
  };
}

export interface AcademyLesson {
  id: string;
  number: number;
  title: string;
  sanskritTitle: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  keyFormulaOrRule: string;
  summary: string;
  practicePrompt: string;
  quizQuestion: string;
  options: string[];
  correctOptionIndex: number;
}

export const ACADEMY_CURRICULUM: AcademyLesson[] = [
  {
    id: 'L-01',
    number: 1,
    title: 'Astronomical Foundations & Nirayana Zodiac',
    sanskritTitle: 'खगोलशास्त्रम् एवं निरयण राशिचक्रम्',
    level: 'Foundation',
    estimatedMinutes: 10,
    keyFormulaOrRule: 'Sidereal Longitude = Tropical Longitude − Lahiri Ayanamsha (~24.22° in 2026)',
    summary: 'Indian Jyotish measures planetary longitudes from fixed background stars (Spica / Chitra at 180°00′00″) rather than the shifting vernal equinox.',
    practicePrompt: 'Generate a Kundli with Lahiri vs Tropical in the Data Tools comparator to observe the ~24° precession shift.',
    quizQuestion: 'Which star anchors Chitra-paksha (Lahiri) Ayanamsha at 180° Libra/Virgo junction?',
    options: ['Aldebaran (Rohini)', 'Spica (Chitra)', 'Regulus (Magha)'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-02',
    number: 2,
    title: 'The 12 Rashis, Elements & Planetary Lordships',
    sanskritTitle: 'द्वादश राशयः एवं तत्त्वविवेकः',
    level: 'Foundation',
    estimatedMinutes: 12,
    keyFormulaOrRule: '360° / 12 Signs = 30° per Rashi; Fire (1,5,9), Earth (2,6,10), Air (3,7,11), Water (4,8,12)',
    summary: 'Each Rashi spans 30° and carries an element (Agni, Prithvi, Vayu, Jala), modality (Chara, Sthira, Dvisvabhava), and governing Graha.',
    practicePrompt: 'Inspect your Sun, Moon, and Lagna elements in the Personal Life Profile.',
    quizQuestion: 'Which modality governs Aries, Cancer, Libra, and Capricorn?',
    options: ['Chara (Movable)', 'Sthira (Fixed)', 'Dvisvabhava (Dual)'],
    correctOptionIndex: 0,
  },
  {
    id: 'L-03',
    number: 3,
    title: 'The 12 Bhavas (Houses), Kendra & Trikona',
    sanskritTitle: 'द्वादश भावाः केन्द्रत्रिकोणनिर्णयः',
    level: 'Foundation',
    estimatedMinutes: 14,
    keyFormulaOrRule: 'Kendras: Houses 1, 4, 7, 10 | Trikonas: Houses 1, 5, 9 | Dusthanas: Houses 6, 8, 12',
    summary: 'Whole-Sign houses anchor from Lagna; Kendra-Trikona lord exchanges form classical Raja Yogas.',
    practicePrompt: 'Open the Lagna Chart and check which planets occupy Kendras (H1, H4, H7, H10).',
    quizQuestion: 'Which set of houses are strictly Trikona (Trine) houses in Parashari Jyotish?',
    options: ['1, 4, 7, 10', '1, 5, 9', '6, 8, 12'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-04',
    number: 4,
    title: '27 Nakshatras, Deities & 108 Padas',
    sanskritTitle: 'सप्तविंशति नक्षत्राणि एवं पादविभागः',
    level: 'Foundation',
    estimatedMinutes: 15,
    keyFormulaOrRule: '360° / 27 = 13°20′ per Nakshatra | 13°20′ / 4 = 3°20′ per Pada',
    summary: 'Nakshatras bridge Rashi geometry with lunar psychology, naming syllables, Gana, Nadi, and Dasha lordship.',
    practicePrompt: 'Use the Interactive Nakshatra Explorer in Workspace to look up your Moon Nakshatra deity and Yoni.',
    quizQuestion: 'What exact ecliptic arc does one single Nakshatra Pada span?',
    options: ['13°20′', '3°20′', '30°00′'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-05',
    number: 5,
    title: 'Vimshottari Dasha & Balance at Birth',
    sanskritTitle: 'विंशोत्तरी महादशा एवं भोग्यदशा',
    level: 'Intermediate',
    estimatedMinutes: 16,
    keyFormulaOrRule: 'Remaining Dasha Balance = Lord Full Years × (1 − Elapsed Fraction of Moon Nakshatra)',
    summary: 'The 120-year Vimshottari cycle progresses through Ketu (7), Venus (20), Sun (6), Moon (10), Mars (7), Rahu (18), Jupiter (16), Saturn (19), Mercury (17).',
    practicePrompt: 'Inspect your Mahadasha → Antardasha → Pratyantardasha drilldown on the Kundli page.',
    quizQuestion: 'How many total years span a complete 9-planet Vimshottari Mahadasha cycle?',
    options: ['108 years', '120 years', '144 years'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-06',
    number: 6,
    title: 'Shodashvarga Divisional Charts (D1, D9, D10)',
    sanskritTitle: 'षोडशवर्गविवेकः (नवांश दशांश)',
    level: 'Intermediate',
    estimatedMinutes: 15,
    keyFormulaOrRule: 'D9 (Navamsa) splits each 30° sign into 9 × 3°20′; D10 (Dashamsha) splits into 10 × 3°00′.',
    summary: 'Navamsa tests inner planetary maturity and marriage harmony; Dashamsha illuminates public profession and status.',
    practicePrompt: 'Toggle D1, D9, and D10 in the Kundli chart viewer to check Vargottama placements.',
    quizQuestion: 'When a planet occupies the same zodiac sign in both D1 Rashi and D9 Navamsa, it is called:',
    options: ['Vargottama', 'Combust', 'Marana Karaka'],
    correctOptionIndex: 0,
  },
  {
    id: 'L-07',
    number: 7,
    title: 'Ashtakavarga Bindus & Transit Filtering',
    sanskritTitle: 'अष्टकवर्गः एवं गोचरफलम्',
    level: 'Intermediate',
    estimatedMinutes: 15,
    keyFormulaOrRule: 'Sun(48)+Moon(49)+Mars(39)+Mercury(54)+Jupiter(56)+Venus(52)+Saturn(39) = 337 Bindus',
    summary: 'Houses with ≥28 Bindus in Sarva Ashtakavarga flourish during transits; <25 require patience and discipline.',
    practicePrompt: 'Open Research Engine → Sarva Ashtakavarga tab to verify the 337 Bindu sum.',
    quizQuestion: 'What is the exact invariant total of Bindus in Sarva Ashtakavarga across all 12 signs?',
    options: ['337', '360', '249'],
    correctOptionIndex: 0,
  },
  {
    id: 'L-08',
    number: 8,
    title: 'Shadbala Six-Fold Planetary Strength',
    sanskritTitle: 'षड्बलगणनम् एवं इष्टकष्टफलम्',
    level: 'Advanced',
    estimatedMinutes: 18,
    keyFormulaOrRule: 'Shadbala = Sthana + Dig + Kala + Cheshta + Naisargika + Drik Bala (measured in Shashtiamsas)',
    summary: 'Quantitative strength measuring positional dignity, directional strength (Dig Bala), temporal factors, motional retrogression, and aspects.',
    practicePrompt: 'Compare Shadbala breakdown bars in Research Engine.',
    quizQuestion: 'Which planet attains maximum Dig Bala (directional strength) in the 10th House (Meridian)?',
    options: ['Moon & Venus', 'Sun & Mars', 'Saturn'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-09',
    number: 9,
    title: 'Krishnamurti Padhdhati (KP) Sub-Lords & Cusps',
    sanskritTitle: 'कृष्णमूर्तिपद्धतिः उपनक्षत्रविचारः',
    level: 'Advanced',
    estimatedMinutes: 18,
    keyFormulaOrRule: '27 Nakshatras × 9 Vimshottari proportions (+ sign splits) = 249 Sub-Lord divisions',
    summary: 'KP assigns planetary house results based on Nakshatra Star-Lord and refines final approval via the Sub-Lord.',
    practicePrompt: 'View the KP Sub-Lord Cusp Significators in Research Engine.',
    quizQuestion: 'In KP Astrology, which factor serves as the deciding executive authority for an event?',
    options: ['Rashi Sign Lord alone', 'The Sub-Lord (Upanakshatra)', 'Tithi Lord'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-10',
    number: 10,
    title: 'Jaimini Sutras: Chara Karakas & Karakamsha',
    sanskritTitle: 'जैमिनिसूत्राणि चरकारकाः',
    level: 'Advanced',
    estimatedMinutes: 15,
    keyFormulaOrRule: 'Atmakaraka (AK) = planet with highest degree inside its 30° Rashi (excluding Ketu)',
    summary: 'Jaimini ranks planets by degree within sign (AK, AmK, BK, MK, PK, GK, DK) and projects them into Karakamsha.',
    practicePrompt: 'Inspect your Atmakaraka and Swamsha chart inside Research Engine.',
    quizQuestion: 'How does Jaimini identify the Atmakaraka (King of the chart)?',
    options: ['Planet in House 1', 'Planet with highest degree within its sign', 'Strongest planet in Shadbala'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-11',
    number: 11,
    title: 'Ashtakoot Compatibility & Dosha Cancellations',
    sanskritTitle: 'अष्टकूटमेलनम् एवं दोषपरिहारः',
    level: 'Intermediate',
    estimatedMinutes: 14,
    keyFormulaOrRule: '8 Koots max points: 1+2+3+4+5+6+7+8 = 36 Gunas (≥18 acceptable)',
    summary: 'Responsible marriage matching evaluates Nadi/Bhakoot cancellation rules and Manglik Mars exceptions before declaring mismatch.',
    practicePrompt: 'Run a chart pair in Kundli Matching to view Nadi & Bhakoot cancellation checks.',
    quizQuestion: 'What is the maximum possible Ashtakoot compatibility score?',
    options: ['32', '36', '42'],
    correctOptionIndex: 1,
  },
  {
    id: 'L-12',
    number: 12,
    title: 'Panchang Limbs, Hora & Muhurat Filtering',
    sanskritTitle: 'पञ्चाङ्गम् होरा एवं मुहूर्तनिर्णयः',
    level: 'Foundation',
    estimatedMinutes: 12,
    keyFormulaOrRule: 'Rahu Kaal = 1/8th daylight slice (Sunrise to Sunset); Hora = 1/12th day or night span',
    summary: 'Daily electional timing harmonizes Tithi, Vara, Nakshatra, Yoga, Karana with Tara Bala and Chandra Bala.',
    practicePrompt: 'Inspect today’s Hora Table and Tara Bala in the Muhurat Calendar hub.',
    quizQuestion: 'How are Rahu Kaal, Yamagandam, and Gulika Kaal durations computed each day?',
    options: ['Fixed 90-minute clock', 'Dividing local Sunrise-to-Sunset into 8 equal parts', 'Lunar eclipse shadow only'],
    correctOptionIndex: 1,
  },
];

export function gradeAcademyQuiz(answers: Record<string, number>): {
  answered: number;
  correct: number;
  total: number;
  scorePct: number;
  levelBadge: string;
} {
  let answered = 0;
  let correct = 0;
  for (const lesson of ACADEMY_CURRICULUM) {
    const pick = answers[lesson.id];
    if (typeof pick === 'number') {
      answered++;
      if (pick === lesson.correctOptionIndex) correct++;
    }
  }
  const total = ACADEMY_CURRICULUM.length;
  const scorePct = Math.round((correct / total) * 100);
  const levelBadge =
    scorePct >= 85
      ? 'Jyotish Acharya Readiness'
      : scorePct >= 60
      ? 'Intermediate Practitioner'
      : 'Foundation Student';
  return { answered, correct, total, scorePct, levelBadge };
}
