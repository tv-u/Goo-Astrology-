import { NAKSHATRAS, ZODIAC_SIGNS } from './constants';
import { calculateKundli, type BirthInput, type KundliResult } from './ephemeris';
import { calculatePanchang } from './panchang';

// ============================================================================
// 1. TAMIL 10-PORUTHAM MARRIAGE COMPATIBILITY (Astronomical Moon Nakshatra)
// ============================================================================

export interface TamilPoruthamItem {
  name: string;
  tamilName: string;
  status: 'Uttamam' | 'Madhyamam' | 'Adhamam';
  passed: boolean;
  points: number;
  note: string;
}

export interface TamilPoruthamReport {
  brideNakshatra: string;
  brideRashi: string;
  groomNakshatra: string;
  groomRashi: string;
  items: TamilPoruthamItem[];
  totalPassed: number;
  maxCount: 10;
  rajjuCategory: string;
  rajjuSafe: boolean;
  verdict: string;
}

const RAJJU_GROUPS = ['Padha', 'Kati', 'Nabhi', 'Kanta', 'Sira'] as const;

function getRajjuGroup(nakIndex: number): string {
  // Classical Aroha-Avaroha Rajju cycle across 27 Nakshatras
  const cycle = [0, 1, 2, 3, 4, 3, 2, 1, 0];
  return RAJJU_GROUPS[cycle[nakIndex % 9]];
}

// Traditional Tamil Vedhai incompatible Nakshatra index pairs (0-based)
const VEDHAI_PAIRS: Array<[number, number]> = [
  [0, 17],  // Ashwini - Jyeshtha
  [1, 16],  // Bharani - Anuradha
  [2, 15],  // Krittika - Vishakha
  [3, 14],  // Rohini - Swati
  [5, 21],  // Ardra - Shravana
  [6, 20],  // Punarvasu - Uttara Ashadha
  [7, 19],  // Pushya - Purva Ashadha
  [8, 18],  // Ashlesha - Mula
  [9, 26],  // Magha - Revati
  [10, 25], // Purva Phalguni - Uttara Bhadrapada
  [11, 24], // Uttara Phalguni - Purva Bhadrapada
  [12, 23], // Hasta - Shatabhisha
  [4, 13],  // Mrigashira - Chitra
  [4, 22],  // Mrigashira - Dhanishta
  [13, 22], // Chitra - Dhanishta
];

export function calculateTamilPorutham(brideInput: BirthInput, groomInput: BirthInput): TamilPoruthamReport {
  const brideK = calculateKundli(brideInput);
  const groomK = calculateKundli(groomInput);
  const bMoon = brideK.planets[1];
  const gMoon = groomK.planets[1];

  const bNak = bMoon.nakshatraIndex;
  const gNak = gMoon.nakshatraIndex;
  const bRasi = bMoon.signIndex;
  const gRasi = gMoon.signIndex;

  // Count from Bride's Nakshatra to Groom's (1..27)
  const nakCount = ((gNak - bNak + 27) % 27) + 1;
  const nakMod9 = nakCount % 9;
  const rasiCount = ((gRasi - bRasi + 12) % 12) + 1;

  // 1. Dinam Porutham (2, 4, 6, 8, 9 modulo 9)
  const dinamGood = [2, 4, 6, 8, 0].includes(nakMod9);
  // 2. Ganam Porutham
  const bGana = NAKSHATRAS[bNak].gana;
  const gGana = NAKSHATRAS[gNak].gana;
  const ganamGood =
    bGana === gGana ||
    (bGana === 'Deva' && gGana === 'Manushya') ||
    (bGana === 'Manushya' && gGana === 'Deva');
  // 3. Mahendram Porutham (4, 7, 10, 13, 16, 19, 22, 25)
  const mahendramGood = [4, 7, 10, 13, 16, 19, 22, 25].includes(nakCount);
  // 4. Stree Deergham (count >= 13)
  const streeGood = nakCount >= 13;
  // 5. Yoni Porutham
  const bYoni = NAKSHATRAS[bNak].yoni;
  const gYoni = NAKSHATRAS[gNak].yoni;
  const yoniEnemies: Record<string, string> = {
    Horse: 'Buffalo',
    Buffalo: 'Horse',
    Elephant: 'Lion',
    Lion: 'Elephant',
    Sheep: 'Monkey',
    Monkey: 'Sheep',
    Serpent: 'Mongoose',
    Mongoose: 'Serpent',
    Dog: 'Deer',
    Deer: 'Dog',
    Cat: 'Rat',
    Rat: 'Cat',
    Cow: 'Tiger',
    Tiger: 'Cow',
  };
  const yoniGood = yoniEnemies[bYoni] !== gYoni;
  // 6. Rasi Porutham (rasiCount >= 7 or 1 or specific favorable counts)
  const rasiGood = rasiCount === 1 || rasiCount >= 7 || rasiCount === 3 || rasiCount === 4;
  // 7. Rasiyathipathi (Rashi lord friendliness)
  const bLord = ZODIAC_SIGNS[bRasi].ruler;
  const gLord = ZODIAC_SIGNS[gRasi].ruler;
  const rasiLordGood = bLord === gLord || !((bLord === 'Sun' && gLord === 'Saturn') || (bLord === 'Saturn' && gLord === 'Sun'));
  // 8. Vasya Porutham (mutual attraction pairs simplified by classical sign groups)
  const vasyaGood = bRasi === gRasi || [2, 5, 7, 9, 10, 11].includes(rasiCount);
  // 9. Rajju Porutham (critical: must NOT share same Rajju body zone)
  const bRajju = getRajjuGroup(bNak);
  const gRajju = getRajjuGroup(gNak);
  const rajjuSafe = bRajju !== gRajju;
  // 10. Vedhai Porutham (must NOT fall in enemy Vedhai pair)
  const hasVedhai = VEDHAI_PAIRS.some(([a, c]) => (a === bNak && c === gNak) || (a === gNak && c === bNak));
  const vedhaiSafe = !hasVedhai;

  const items: TamilPoruthamItem[] = [
    {
      name: 'Dinam Porutham',
      tamilName: 'தினம் பொருத்தம்',
      status: dinamGood ? 'Uttamam' : 'Adhamam',
      passed: dinamGood,
      points: dinamGood ? 1 : 0,
      note: `Nakshatra count ${nakCount} (mod 9 = ${nakMod9 || 9}) — governs daily harmony & longevity.`,
    },
    {
      name: 'Ganam Porutham',
      tamilName: 'கணம் பொருத்தம்',
      status: bGana === gGana ? 'Uttamam' : ganamGood ? 'Madhyamam' : 'Adhamam',
      passed: ganamGood,
      points: ganamGood ? 1 : 0,
      note: `Bride: ${bGana} · Groom: ${gGana} — temperament and spiritual alignment.`,
    },
    {
      name: 'Mahendram Porutham',
      tamilName: 'மகேந்திரம் பொருத்தம்',
      status: mahendramGood ? 'Uttamam' : 'Madhyamam',
      passed: mahendramGood,
      points: mahendramGood ? 1 : 0,
      note: `Count ${nakCount} — progeny prosperity and family continuity.`,
    },
    {
      name: 'Stree Deergham',
      tamilName: 'ஸ்திரீ தீர்க்கம்',
      status: streeGood ? 'Uttamam' : 'Adhamam',
      passed: streeGood,
      points: streeGood ? 1 : 0,
      note: `Nakshatra span ${nakCount} (13+ preferred for auspicious household abundance).`,
    },
    {
      name: 'Yoni Porutham',
      tamilName: 'யோனி பொருத்தம்',
      status: bYoni === gYoni ? 'Uttamam' : yoniGood ? 'Madhyamam' : 'Adhamam',
      passed: yoniGood,
      points: yoniGood ? 1 : 0,
      note: `${bYoni} & ${gYoni} — instinctual intimacy and physical rapport.`,
    },
    {
      name: 'Rasi Porutham',
      tamilName: 'ராசி பொருத்தம்',
      status: rasiGood ? 'Uttamam' : 'Adhamam',
      passed: rasiGood,
      points: rasiGood ? 1 : 0,
      note: `${bMoon.signName} to ${gMoon.signName} (count ${rasiCount}) — clan growth & peace.`,
    },
    {
      name: 'Rasiyathipathi',
      tamilName: 'ராசியதிபதி',
      status: rasiLordGood ? 'Uttamam' : 'Adhamam',
      passed: rasiLordGood,
      points: rasiLordGood ? 1 : 0,
      note: `Moon lords ${bLord} & ${gLord} — mutual friendship between sign rulers.`,
    },
    {
      name: 'Vasya Porutham',
      tamilName: 'வசியம் பொருத்தம்',
      status: vasyaGood ? 'Uttamam' : 'Madhyamam',
      passed: vasyaGood,
      points: vasyaGood ? 1 : 0,
      note: `Mutual magnetic affection across ${bMoon.signName} & ${gMoon.signName}.`,
    },
    {
      name: 'Rajju Porutham',
      tamilName: 'ரஜ்ஜு பொருத்தம்',
      status: rajjuSafe ? 'Uttamam' : 'Adhamam',
      passed: rajjuSafe,
      points: rajjuSafe ? 1 : 0,
      note: rajjuSafe
        ? `Distinct Rajju zones (Bride: ${bRajju}, Groom: ${gRajju}) — auspicious marital strength.`
        : `Same ${bRajju} Rajju detected — consult full Bhakoot/Navamsha chart check.`,
    },
    {
      name: 'Vedhai Porutham',
      tamilName: 'வேதை பொருத்தம்',
      status: vedhaiSafe ? 'Uttamam' : 'Adhamam',
      passed: vedhaiSafe,
      points: vedhaiSafe ? 1 : 0,
      note: vedhaiSafe
        ? 'No Vedhai affliction between birth stars.'
        : 'Traditional Vedhai star pair detected — evaluate full D1 & D9 balance.',
    },
  ];

  const totalPassed = items.filter((i) => i.passed).length;
  const verdict =
    rajjuSafe && totalPassed >= 7
      ? 'Uttam Porutham (Highly Compatible Tamil Match)'
      : rajjuSafe && totalPassed >= 5
        ? 'Madhyam Porutham (Good Match with Standard Horoscope Review)'
        : 'Challenging Porutham — Verify Lagna, Manglik & D9 Navamsha Charts';

  return {
    brideNakshatra: `${bMoon.nakshatraName} (Pada ${bMoon.pada})`,
    brideRashi: bMoon.signName,
    groomNakshatra: `${gMoon.nakshatraName} (Pada ${gMoon.pada})`,
    groomRashi: gMoon.signName,
    items,
    totalPassed,
    maxCount: 10,
    rajjuCategory: `${bRajju} / ${gRajju}`,
    rajjuSafe,
    verdict,
  };
}

// ============================================================================
// 2. RAMSHALAKA PRASHNAVALI (15x15 Ramcharitmanas Grid), HANUMAN 49 & SACRED TEXTS
// ============================================================================

const CHAUPAIS = [
  {
    verse: 'सुनु सिय सत्य असीस हमारी। पूजिहि मन कामना तुम्हारी॥',
    meaning: 'Auspicious Verdict (Uttam): Your sincere intention shall reach fulfillment with grace and steady effort.',
    verdict: 'Highly Auspicious — Proceed with Faith',
  },
  {
    verse: 'प्रबिसि नगर कीजे सब काजा। हृदयँ राखि कोसलपुर राजा॥',
    meaning: 'Success Assured: Begin the task keeping righteousness and clarity in heart; obstacles clear naturally.',
    verdict: 'Favorable — Ideal Time to Act',
  },
  {
    verse: 'उघरहिं बिमल बिलोचन ही के। मिटहिं दोष दुख भव रजनी के॥',
    meaning: 'Clarity & Relief: Past confusion and delays lift; seek wise counsel and act transparently.',
    verdict: 'Positive Turn — Confusion Clears',
  },
  {
    verse: 'बिधि बस सुजन कुसंगत परहीं। फनि मनि सम निज गुन अनुसरहीं॥',
    meaning: 'Caution & Patience: Environment is mixed; uphold integrity and wait for cleaner alignment before committing.',
    verdict: 'Wait & Protect Integrity',
  },
  {
    verse: 'होइहि सोइ जो राम रचि राखा। को करि तर्क बढ़ावै साखा॥',
    meaning: 'Surrender Overthinking: Release excessive anxiety and focus calmly on present duty.',
    verdict: 'Steady Patience Required',
  },
  {
    verse: 'मुद मंगलमय संत समाजू। जो जग जंगम तीरथराजू॥',
    meaning: 'Community & Mentorship: Good news arrives through family, teachers, or noble associates.',
    verdict: 'Auspicious Support Nearby',
  },
  {
    verse: 'गरल सुधा रिपु करहिं मिताई। गोपद सिंधु अनल सितलाई॥',
    meaning: 'Graceful Resolution: Even stubborn hurdles turn favorable through calm perseverance.',
    verdict: 'Breakthrough After Persistence',
  },
  {
    verse: 'बिनु सतसंग बिबेक न होई। राम कृपा बिनु सुलभ न सोई॥',
    meaning: 'Reflect & Prepare: Strengthen fundamentals and seek experienced guidance before major steps.',
    verdict: 'Preparation Before Action',
  },
  {
    verse: 'मंगल भवन अमंगल हारी। द्रवहु सुदसरथ अजिर बिहारी॥',
    meaning: 'Protective Grace: Harmony returns to home and work; perform quiet prayer and act steadily.',
    verdict: 'Auspicious Blessing',
  },
];

const AKSHARA_POOL = ['सु', 'प्र', 'उ', 'बि', 'हो', 'मु', 'ग', 'सं', 'मं', 'रा', 'सी', 'ह', 'भ', 'क', 'न'];

export const RAMSHALAKA_GRID: string[][] = Array.from({ length: 15 }, (_, r) =>
  Array.from({ length: 15 }, (_, c) => AKSHARA_POOL[(r * 15 + c) % AKSHARA_POOL.length])
);

export function consultRamshalaka(row: number, col: number) {
  const safeR = Math.max(0, Math.min(14, Math.floor(row)));
  const safeC = Math.max(0, Math.min(14, Math.floor(col)));
  const idx = (safeR * 15 + safeC) % CHAUPAIS.length;
  const chosen = CHAUPAIS[idx];
  return {
    row: safeR + 1,
    col: safeC + 1,
    akshara: RAMSHALAKA_GRID[safeR][safeC],
    ...chosen,
  };
}

export function consultHanumanPrashna(cellNumber: number) {
  const safeCell = Math.max(1, Math.min(49, Math.floor(cellNumber)));
  const outcomes = [
    {
      verdict: 'Sankatmochan Victory — Obstacle Clears',
      guidance: 'Courageous, ethical action brings victory within 7 to 21 days. Avoid anger and stay focused.',
    },
    {
      verdict: 'Steady Progress Through Discipline',
      guidance: 'Results arrive steadily if you honor promises and complete pending responsibilities first.',
    },
    {
      verdict: 'Pause & Re-evaluate Terms',
      guidance: 'Wait briefly before signing or confronting; hidden facts will surface soon.',
    },
    {
      verdict: 'Protection & Family Peace',
      guidance: 'Health and household peace improve; Tuesday recitation or charitable service helps clarity.',
    },
    {
      verdict: 'Favorable Journey & Work Gains',
      guidance: 'Travel, interviews, and scholarly efforts carry supportive momentum.',
    },
    {
      verdict: 'Seek Elder or Guru Guidance',
      guidance: 'Do not decide in haste; ask a trusted mentor before changing direction.',
    },
    {
      verdict: 'Fulfillment After Sincere Effort',
      guidance: 'What felt stalled begins moving when approached with humility and persistence.',
    },
  ];
  const pick = outcomes[(safeCell - 1) % outcomes.length];
  return {
    cellNumber: safeCell,
    ...pick,
  };
}

export function consultDevotionalOracle(tradition: 'ganesha' | 'saibaba', question: string) {
  const cleanQ = question.trim() || 'Seeking peace and right direction';
  const hash = cleanQ.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const ganeshaCards = [
    'Shraddha & Vighnaharta Blessing: Remove self-doubt first; break the goal into one clear daily step.',
    'Buddhi (Discernment): Verify numbers and commitments calmly—wisdom defeats haste.',
    'Mangal Aarambh: An auspicious new chapter opens when undertaken with gratitude and humility.',
    'Siddhi Through Patience: Keep working quietly for 21 days before judging outcomes.',
  ];
  const saiCards = [
    'Shraddha & Saburi (Faith & Patience): Do not rush events out of fear; your timing is protected.',
    'Seva & Kindness: Help someone silently today; mental heaviness dissolves.',
    'Clear Conscience: Speak truth gently and let go of resentment—peace follows quickly.',
    'Steady Focus: Complete your current duty faithfully; new doors open in due course.',
  ];
  const list = tradition === 'ganesha' ? ganeshaCards : saiCards;
  const message = list[hash % list.length];
  return {
    tradition,
    question: cleanQ,
    message,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
}

export interface SacredTextItem {
  id: string;
  title: string;
  hindiTitle: string;
  deity: string;
  lines: string[];
  meaningSummary: string;
}

export const SACRED_TEXTS: SacredTextItem[] = [
  {
    id: 'hanuman-chalisa',
    title: 'Shri Hanuman Chalisa (Key Doha & Chaupais)',
    hindiTitle: 'श्री हनुमान चालीसा',
    deity: 'Lord Hanuman (Tuesday / Saturday)',
    lines: [
      'दोहा: श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥',
      'बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार। बल बुद्धि बिद्या देहु मोहिं, हरहु कलेस बिकार॥',
      'जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥',
      'राम दूत अतुलित बल धामा। अंजनि-पुत्र पवनसुत नामा॥',
      'महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥',
      'नासै रोग हरै सब पीरा। जपत निरंतर हनुमत बीरा॥',
      'दोहा: पवनतनय संकट हरन, मंगल मूरति रूप। राम लखन सीता सहित, हृदय बसहु सुर भूप॥',
    ],
    meaningSummary: 'Invoke inner courage, clear intellect, freedom from fear, and steady Saturn/Mars balance.',
  },
  {
    id: 'gayatri-mantra',
    title: 'Vedic Gayatri Mantra',
    hindiTitle: 'गायत्री महामंत्र',
    deity: 'Surya / Savitr (Sunrise)',
    lines: [
      'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं।',
      'भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥',
    ],
    meaningSummary: 'Meditation on cosmic solar illumination to sharpen intellect (Dhi), clarity, and vitality.',
  },
  {
    id: 'ganesh-aarti',
    title: 'Shri Ganesh Aarti',
    hindiTitle: 'श्री गणेश आरती',
    deity: 'Lord Ganesha (Wednesday / Chaturthi)',
    lines: [
      'जय गणेश जय गणेश जय गणेश देवा। माता जाकी पार्वती पिता महादेवा॥',
      'एकदंत दयावंत चार भुजा धारी। माथे सिंदूर सोहे मूसे की सवारी॥',
      'अंधन को आंख देत, कोढ़िन को काया। बांझन को पुत्र देत, निर्धन को माया॥',
    ],
    meaningSummary: 'Traditional invocation before study, business initiatives, or Ketu/Mercury remedies.',
  },
  {
    id: 'navagraha-stotra',
    title: 'Vedic Navagraha Peace Invocation',
    hindiTitle: 'नवग्रह शांति मंत्र',
    deity: 'Nine Celestial Planets',
    lines: [
      'जपाकुसुम संकाशं काश्यपेयं महाद्युतिम्। तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥ (सूर्य)',
      'दधिशङ्खतुषाराभं क्षीरोदार्णव सम्भवम्। नमामि शशिनं सोमं शम्भोर्मुकुट भूषणम्॥ (चंद्र)',
      'नीलांजन समाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्ड संभूतं तं नमामि शनैश्चरम्॥ (शनि)',
    ],
    meaningSummary: 'Classical Vyasa Navagraha verses for calming planetary imbalances across all nine Grahas.',
  },
];

// ============================================================================
// 3. FENG SHUI KUA NUMBER, SWARODAYA VIGYAN & AYURVEDIC HEALING
// ============================================================================

export interface FengShuiKuaReport {
  kuaNumber: number;
  group: 'East Group' | 'West Group';
  element: string;
  favorableDirections: Array<{ name: string; direction: string; purpose: string }>;
  cautionDirections: string[];
}

export function calculateFengShuiKua(birthYear: number, gender: 'male' | 'female'): FengShuiKuaReport {
  const safeYear = Math.max(1900, Math.min(2100, Math.floor(birthYear)));
  let sumDigits = (safeYear % 100)
    .toString()
    .split('')
    .reduce((a, b) => a + Number(b), 0);
  while (sumDigits >= 10) {
    sumDigits = sumDigits
      .toString()
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }

  let kua: number;
  if (safeYear >= 2000) {
    kua = gender === 'male' ? (9 - sumDigits) : (sumDigits + 6);
  } else {
    kua = gender === 'male' ? (10 - sumDigits) : (sumDigits + 5);
  }
  while (kua >= 10) {
    kua = kua
      .toString()
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  if (kua === 0) kua = 9;
  if (kua === 5) kua = gender === 'male' ? 2 : 8;

  const isEast = [1, 3, 4, 9].includes(kua);
  const kuaElements: Record<number, string> = {
    1: 'Water',
    2: 'Earth',
    3: 'Wood',
    4: 'Wood',
    6: 'Metal',
    7: 'Metal',
    8: 'Earth',
    9: 'Fire',
  };

  const dirMaps: Record<number, Array<{ name: string; direction: string; purpose: string }>> = {
    1: [
      { name: 'Sheng Chi (Success)', direction: 'South-East', purpose: 'Career growth, leadership desk orientation' },
      { name: 'Tian Yi (Health)', direction: 'East', purpose: 'Restorative sleep & healing' },
      { name: 'Yan Nian (Harmony)', direction: 'South', purpose: 'Family bonds & marriage harmony' },
      { name: 'Fu Wei (Clarity)', direction: 'North', purpose: 'Study, focus & meditation' },
    ],
    2: [
      { name: 'Sheng Chi (Success)', direction: 'North-East', purpose: 'Wealth & academic focus' },
      { name: 'Tian Yi (Health)', direction: 'West', purpose: 'Vitality & recovery' },
      { name: 'Yan Nian (Harmony)', direction: 'North-West', purpose: 'Relationships & mentorship' },
      { name: 'Fu Wei (Clarity)', direction: 'South-West', purpose: 'Grounded calm & planning' },
    ],
    3: [
      { name: 'Sheng Chi (Success)', direction: 'South', purpose: 'Visibility & career leadership' },
      { name: 'Tian Yi (Health)', direction: 'North', purpose: 'Emotional & kidney/water balance' },
      { name: 'Yan Nian (Harmony)', direction: 'South-East', purpose: 'Social warmth & partnership' },
      { name: 'Fu Wei (Clarity)', direction: 'East', purpose: 'Creative study & steady stamina' },
    ],
    4: [
      { name: 'Sheng Chi (Success)', direction: 'North', purpose: 'Strategic wealth & career flow' },
      { name: 'Tian Yi (Health)', direction: 'South', purpose: 'Heart vitality & optimism' },
      { name: 'Yan Nian (Harmony)', direction: 'East', purpose: 'Domestic peace & longevity' },
      { name: 'Fu Wei (Clarity)', direction: 'South-East', purpose: 'Writing, learning & calm' },
    ],
    6: [
      { name: 'Sheng Chi (Success)', direction: 'West', purpose: 'Authority & financial consolidation' },
      { name: 'Tian Yi (Health)', direction: 'North-East', purpose: 'Rest & resilience' },
      { name: 'Yan Nian (Harmony)', direction: 'South-West', purpose: 'Family stability' },
      { name: 'Fu Wei (Clarity)', direction: 'North-West', purpose: 'Executive discipline' },
    ],
    7: [
      { name: 'Sheng Chi (Success)', direction: 'North-West', purpose: 'Benefactors & executive success' },
      { name: 'Tian Yi (Health)', direction: 'South-West', purpose: 'Digestive & grounded recovery' },
      { name: 'Yan Nian (Harmony)', direction: 'North-East', purpose: 'Long-term loyalty' },
      { name: 'Fu Wei (Clarity)', direction: 'West', purpose: 'Speech, communication & calm' },
    ],
    8: [
      { name: 'Sheng Chi (Success)', direction: 'South-West', purpose: 'Real estate, assets & patience' },
      { name: 'Tian Yi (Health)', direction: 'North-West', purpose: 'Lung & respiratory clarity' },
      { name: 'Yan Nian (Harmony)', direction: 'West', purpose: 'Joyful domestic partnerships' },
      { name: 'Fu Wei (Clarity)', direction: 'North-East', purpose: 'Spiritual & scholarly depth' },
    ],
    9: [
      { name: 'Sheng Chi (Success)', direction: 'East', purpose: 'Innovation & steady recognition' },
      { name: 'Tian Yi (Health)', direction: 'South-East', purpose: 'Immunity & circulation' },
      { name: 'Yan Nian (Harmony)', direction: 'North', purpose: 'Trust & emotional maturity' },
      { name: 'Fu Wei (Clarity)', direction: 'South', purpose: 'Confidence & clarity' },
    ],
  };

  return {
    kuaNumber: kua,
    group: isEast ? 'East Group' : 'West Group',
    element: kuaElements[kua] || 'Earth',
    favorableDirections: dirMaps[kua] || dirMaps[1],
    cautionDirections: isEast
      ? ['West', 'North-West', 'South-West', 'North-East']
      : ['East', 'South-East', 'South', 'North'],
  };
}

export interface SwarodayaCycleResult {
  paksha: 'Shukla' | 'Krishna';
  tithiNumber: number;
  weekday: string;
  sunriseSwara: 'Ida (Left / Chandra)' | 'Pingala (Right / Surya)';
  currentHourSwara: 'Ida (Left / Chandra)' | 'Pingala (Right / Surya)' | 'Sushumna (Center Transition)';
  recommendedActivities: string[];
}

export function calculateSwarodayaCycle(dateStr: string, hoursAfterSunrise = 1.5): SwarodayaCycleResult {
  const p = calculatePanchang(dateStr, 28.6139, 77.209, 330, 'New Delhi, India');
  const tithiNum = (p.tithi.index % 15) + 1;
  const paksha: 'Shukla' | 'Krishna' = p.tithi.paksha.startsWith('Shukla') ? 'Shukla' : 'Krishna';
  const pakshaOffset = Math.floor((tithiNum - 1) / 3) % 2; // alternates every 3 Tithis
  const baseIsIda = paksha === 'Shukla' ? pakshaOffset === 0 : pakshaOffset === 1;
  const sunriseSwara: 'Ida (Left / Chandra)' | 'Pingala (Right / Surya)' = baseIsIda
    ? 'Ida (Left / Chandra)'
    : 'Pingala (Right / Surya)';

  // Each Swara flows roughly ~60 minutes (2.5 Ghatis), alternating through the day
  const slot = Math.floor(Math.max(0, hoursAfterSunrise));
  const minuteFraction = hoursAfterSunrise - slot;
  let currentHourSwara: SwarodayaCycleResult['currentHourSwara'];
  if (minuteFraction >= 0.94 || minuteFraction <= 0.04) {
    currentHourSwara = 'Sushumna (Center Transition)';
  } else {
    const isSameAsSunrise = slot % 2 === 0;
    currentHourSwara = isSameAsSunrise
      ? sunriseSwara
      : sunriseSwara.startsWith('Ida')
        ? 'Pingala (Right / Surya)'
        : 'Ida (Left / Chandra)';
  }

  const recommendedActivities =
    currentHourSwara.startsWith('Ida')
      ? [
          'Ideal for peaceful negotiations, learning, artistic design, travel planning & hydration.',
          'Step forward with your left foot when initiating calm diplomatic tasks.',
        ]
      : currentHourSwara.startsWith('Pingala')
        ? [
            'Ideal for physical exercise, courageous decisions, digestion/meals, and technical execution.',
            'Step forward with your right foot for decisive tasks.',
          ]
        : [
            'Both nostrils balanced — optimal 5-minute window strictly for meditation, mantra & stillness; avoid major contracts.',
          ];

  return {
    paksha,
    tithiNumber: tithiNum,
    weekday: p.vara.name,
    sunriseSwara,
    currentHourSwara,
    recommendedActivities,
  };
}

export interface AyurvedicHealingProfile {
  dominantDosha: 'Vata' | 'Pitta' | 'Kapha';
  scores: { Vata: number; Pitta: number; Kapha: number };
  bodyFocusZones: string[];
  chakraFocus: string;
  colorTherapy: string;
  crystalGuide: string;
  acupressurePoint: string;
  aromatherapyOil: string;
  lifestyleNotes: string[];
}

export function analyzeAyurvedaAndHealing(kundli: KundliResult): AyurvedicHealingProfile {
  let vata = 25;
  let pitta = 25;
  let kapha = 25;

  const lagnaEl = ZODIAC_SIGNS[kundli.lagnaSignIndex].element;
  const moonEl = ZODIAC_SIGNS[kundli.planets[1].signIndex].element;
  const sunEl = ZODIAC_SIGNS[kundli.planets[0].signIndex].element;

  for (const el of [lagnaEl, moonEl, sunEl]) {
    if (el === 'Air') vata += 20;
    if (el === 'Fire') pitta += 20;
    if (el === 'Earth') kapha += 15;
    if (el === 'Water') kapha += 18;
  }

  // Factor Saturn/Mercury for Vata, Mars/Sun for Pitta, Moon/Venus/Jupiter for Kapha
  const saturn = kundli.planets.find((p) => p.id === 'Saturn');
  const mars = kundli.planets.find((p) => p.id === 'Mars');
  if (saturn && [1, 6, 8].includes(saturn.house)) vata += 12;
  if (mars && [1, 6, 8].includes(mars.house)) pitta += 12;

  const dominantDosha: AyurvedicHealingProfile['dominantDosha'] =
    vata >= pitta && vata >= kapha ? 'Vata' : pitta >= vata && pitta >= kapha ? 'Pitta' : 'Kapha';

  const h6Sign = ZODIAC_SIGNS[(kundli.lagnaSignIndex + 5) % 12];
  const h8Sign = ZODIAC_SIGNS[(kundli.lagnaSignIndex + 7) % 12];

  const therapyMap = {
    Vata: {
      chakraFocus: 'Muladhara (Root Chakra) — Grounding & stability',
      colorTherapy: 'Warm Saffron, Golden Yellow & Earthy Terracotta',
      crystalGuide: 'Citrine / Smoky Quartz / Yellow Sapphire resonance',
      acupressurePoint: 'Shenmen (HT7 Wrist) & Yin Tang (Brow) — 2 minutes gentle circular pressure',
      aromatherapyOil: 'Warm Sandalwood, Vetiver & Sweet Almond',
      lifestyleNotes: [
        'Favor warm, freshly cooked spiced meals and regular sleep hours.',
        'Avoid excessive fasting, cold drinks, and late-night screen overstimulation.',
      ],
    },
    Pitta: {
      chakraFocus: 'Anahata (Heart) & Manipura cooling balance',
      colorTherapy: 'Soft Mint Green, Ivory White & Sky Blue',
      crystalGuide: 'Moonstone / Clear Quartz / Pearl resonance',
      acupressurePoint: 'Neiguan (PC6 Inner Forearm) & Taichong (LV3) — slows excess heat/stress',
      aromatherapyOil: 'Rose, Jasmine & Cooling Peppermint/Lavender',
      lifestyleNotes: [
        'Incorporate sweet juicy fruits, fennel, coriander water & evening walks.',
        'Moderate overly spicy, fried, or competitive late-evening debates.',
      ],
    },
    Kapha: {
      chakraFocus: 'Vishuddha (Throat) & Solar Vitality',
      colorTherapy: 'Bright Coral, Amber Gold & Energizing Sunlit Orange',
      crystalGuide: 'Carnelian / Tiger Eye / Red Jasper resonance',
      acupressurePoint: 'Zusanli (ST36 Below Knee) & Hegu (LI4) — boosts sluggish metabolism',
      aromatherapyOil: 'Eucalyptus, Tulsi (Holy Basil) & Rosemary',
      lifestyleNotes: [
        'Prioritize brisk morning sunlight walks before 8 AM and warm ginger/tulsi tea.',
        'Keep dinner light and avoid daytime napping.',
      ],
    },
  }[dominantDosha];

  return {
    dominantDosha,
    scores: { Vata: vata, Pitta: pitta, Kapha: kapha },
    bodyFocusZones: [
      `Lagna (${ZODIAC_SIGNS[kundli.lagnaSignIndex].name}): ${ZODIAC_SIGNS[kundli.lagnaSignIndex].bodyPart}`,
      `6th House Wellness (${h6Sign.name}): ${h6Sign.bodyPart}`,
      `8th House Sensitivity (${h8Sign.name}): ${h8Sign.bodyPart}`,
    ],
    ...therapyMap,
  };
}
