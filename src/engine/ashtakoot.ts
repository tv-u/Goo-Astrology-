import { NAKSHATRAS, ZODIAC_SIGNS } from './constants';
import { type KundliResult } from './ephemeris';
import { analyzeDoshasAndYogas } from './doshaYoga';

export interface KootaScore {
  name: string;
  hindiName: string;
  maxScore: number;
  obtainedScore: number;
  brideValue: string;
  groomValue: string;
  description: string;
  isDosha?: boolean;
}

export interface AshtakootReport {
  totalScore: number;
  maxScore: 36;
  verdict: string;
  recommendation: string;
  kootas: KootaScore[];
  nadiDosha: { present: boolean; cancelled: boolean; note: string };
  bhakootDosha: { present: boolean; cancelled: boolean; note: string };
  manglikCheck: {
    brideManglik: boolean;
    groomManglik: boolean;
    compatible: boolean;
    note: string;
  };
}

// Varna: 0=Shudra, 1=Vaishya, 2=Kshatriya, 3=Brahmin (by Moon Rashi)
function getVarna(signIdx: number): { rank: number; label: string } {
  // Water(3,7,11)->Brahmin, Fire(0,4,8)->Kshatriya, Earth(1,5,9)->Vaishya, Air(2,6,10)->Shudra
  if ([3, 7, 11].includes(signIdx)) return { rank: 3, label: 'Brahmin' };
  if ([0, 4, 8].includes(signIdx)) return { rank: 2, label: 'Kshatriya' };
  if ([1, 5, 9].includes(signIdx)) return { rank: 1, label: 'Vaishya' };
  return { rank: 0, label: 'Shudra' };
}

// Vashya category by Moon Rashi
function getVashya(signIdx: number): string {
  // Chatushpada (Quadruped): Aries, Taurus, Leo, 2nd half Sag, 1st half Cap
  // Manava (Human): Gemini, Virgo, Libra, Aquarius, 1st half Sag
  // Jalachara (Water): Cancer, Pisces, 2nd half Cap
  // Vanachara (Wild): Leo
  // Keeta (Insect): Scorpio
  if ([2, 5, 6, 10].includes(signIdx)) return 'Manava';
  if ([0, 1, 8, 9].includes(signIdx)) return 'Chatushpada';
  if (signIdx === 4) return 'Vanachara';
  if (signIdx === 7) return 'Keeta';
  return 'Jalachara';
}

const YONI_ENEMIES: Record<string, string> = {
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

export function calculateAshtakoot(bride: KundliResult, groom: KundliResult): AshtakootReport {
  const bMoonSign = bride.moonSignIndex;
  const gMoonSign = groom.moonSignIndex;
  const bNakIdx = bride.planets.find((p) => p.id === 'Moon')!.nakshatraIndex;
  const gNakIdx = groom.planets.find((p) => p.id === 'Moon')!.nakshatraIndex;
  const bNak = NAKSHATRAS[bNakIdx];
  const gNak = NAKSHATRAS[gNakIdx];

  const kootas: KootaScore[] = [];

  // 1. Varna (Max 1)
  const bVarna = getVarna(bMoonSign);
  const gVarna = getVarna(gMoonSign);
  const varnaScore = gVarna.rank >= bVarna.rank ? 1 : 0;
  kootas.push({
    name: 'Varna',
    hindiName: 'वर्ण',
    maxScore: 1,
    obtainedScore: varnaScore,
    brideValue: bVarna.label,
    groomValue: gVarna.label,
    description: 'Spiritual temperament and ego alignment between partners.',
  });

  // 2. Vashya (Max 2)
  const bVashya = getVashya(bMoonSign);
  const gVashya = getVashya(gMoonSign);
  let vashyaScore = 0;
  if (bVashya === gVashya) vashyaScore = 2;
  else if (
    (bVashya === 'Manava' && gVashya === 'Jalachara') ||
    (gVashya === 'Manava' && bVashya === 'Jalachara') ||
    (bVashya === 'Chatushpada' && gVashya === 'Manava') ||
    (gVashya === 'Chatushpada' && bVashya === 'Manava')
  ) {
    vashyaScore = 1;
  } else if (bVashya === 'Vanachara' || gVashya === 'Vanachara') {
    vashyaScore = 0.5;
  }
  kootas.push({
    name: 'Vashya',
    hindiName: 'वश्य',
    maxScore: 2,
    obtainedScore: vashyaScore,
    brideValue: bVashya,
    groomValue: gVashya,
    description: 'Mutual attraction, adaptability, and natural influence.',
  });

  // 3. Tara (Max 3)
  const bToG = ((gNakIdx - bNakIdx + 27) % 27) % 9;
  const gToB = ((bNakIdx - gNakIdx + 27) % 27) % 9;
  // Taras 2, 4, 6 (Vipat, Pratyari, Vadha -> 0-indexed: 2, 4, 6) are unfavorable
  const badTaras = [2, 4, 6];
  const bGood = !badTaras.includes(bToG);
  const gGood = !badTaras.includes(gToB);
  const taraScore = bGood && gGood ? 3 : bGood || gGood ? 1.5 : 0;
  kootas.push({
    name: 'Tara',
    hindiName: 'तारा',
    maxScore: 3,
    obtainedScore: taraScore,
    brideValue: `${bNak.name} (T${bToG + 1})`,
    groomValue: `${gNak.name} (T${gToB + 1})`,
    description: 'Health, longevity, and shared destiny rhythm across birth stars.',
  });

  // 4. Yoni (Max 4)
  let yoniScore = 2;
  if (bNak.yoni === gNak.yoni) yoniScore = 4;
  else if (YONI_ENEMIES[bNak.yoni] === gNak.yoni) yoniScore = 0;
  else if (bNak.yoni !== gNak.yoni) yoniScore = 2.5;
  kootas.push({
    name: 'Yoni',
    hindiName: 'योनि',
    maxScore: 4,
    obtainedScore: yoniScore,
    brideValue: bNak.yoni,
    groomValue: gNak.yoni,
    description: 'Physical harmony, instincts, and biological compatibility.',
  });

  // 5. Graha Maitri (Max 5)
  const bLord = ZODIAC_SIGNS[bMoonSign].ruler;
  const gLord = ZODIAC_SIGNS[gMoonSign].ruler;
  let maitriScore = 0;
  if (bLord === gLord) {
    maitriScore = 5;
  } else {
    // Simplified classical friendship matrix check
    const friends: Record<string, string[]> = {
      Sun: ['Moon', 'Mars', 'Jupiter'],
      Moon: ['Sun', 'Mercury'],
      Mars: ['Sun', 'Moon', 'Jupiter'],
      Mercury: ['Sun', 'Venus'],
      Jupiter: ['Sun', 'Moon', 'Mars'],
      Venus: ['Mercury', 'Saturn'],
      Saturn: ['Mercury', 'Venus'],
    };
    const bF = friends[bLord]?.includes(gLord);
    const gF = friends[gLord]?.includes(bLord);
    if (bF && gF) maitriScore = 5;
    else if (bF || gF) maitriScore = 3;
    else maitriScore = 1;
  }
  kootas.push({
    name: 'Graha Maitri',
    hindiName: 'ग्रह मैत्री',
    maxScore: 5,
    obtainedScore: maitriScore,
    brideValue: `${ZODIAC_SIGNS[bMoonSign].name} (${bLord})`,
    groomValue: `${ZODIAC_SIGNS[gMoonSign].name} (${gLord})`,
    description: 'Mental wavelength and friendship between Moon sign lords.',
  });

  // 6. Gana (Max 6)
  let ganaScore = 0;
  if (bNak.gana === gNak.gana) ganaScore = 6;
  else if (
    (bNak.gana === 'Deva' && gNak.gana === 'Manushya') ||
    (gNak.gana === 'Deva' && bNak.gana === 'Manushya')
  ) {
    ganaScore = 5;
  } else if (bNak.gana === 'Rakshasa' && gNak.gana === 'Manushya') {
    ganaScore = 1;
  } else {
    ganaScore = 0;
  }
  kootas.push({
    name: 'Gana',
    hindiName: 'गण',
    maxScore: 6,
    obtainedScore: ganaScore,
    brideValue: bNak.gana,
    groomValue: gNak.gana,
    description: 'Temperament alignment (Deva, Manushya, Rakshasa).',
    isDosha: ganaScore === 0,
  });

  // 7. Bhakoot (Max 7) — 2/12, 5/9, 6/8 relative Moon signs give 0
  const relDist = ((gMoonSign - bMoonSign + 12) % 12) + 1;
  const badBhakoot = [2, 5, 6, 8, 9, 12].includes(relDist);
  const bhakootCancelled = badBhakoot && (bLord === gLord || maitriScore >= 4);
  const bhakootScore = !badBhakoot ? 7 : 0;
  kootas.push({
    name: 'Bhakoot',
    hindiName: 'भकूट',
    maxScore: 7,
    obtainedScore: bhakootScore,
    brideValue: ZODIAC_SIGNS[bMoonSign].name,
    groomValue: ZODIAC_SIGNS[gMoonSign].name,
    description: 'Emotional prosperity, family continuity, and financial flow.',
    isDosha: badBhakoot && !bhakootCancelled,
  });

  // 8. Nadi (Max 8)
  const sameNadi = bNak.nadi === gNak.nadi;
  const nadiCancelled =
    sameNadi && (bMoonSign === gMoonSign && bNakIdx !== gNakIdx);
  const nadiScore = !sameNadi ? 8 : 0;
  kootas.push({
    name: 'Nadi',
    hindiName: 'नाड़ी',
    maxScore: 8,
    obtainedScore: nadiScore,
    brideValue: bNak.nadi,
    groomValue: gNak.nadi,
    description: 'Genetic vitality, pranic balance, and progeny health.',
    isDosha: sameNadi && !nadiCancelled,
  });

  const totalScore = Number(kootas.reduce((acc, k) => acc + k.obtainedScore, 0).toFixed(1));

  // Manglik matching
  const bAnalysis = analyzeDoshasAndYogas(bride);
  const gAnalysis = analyzeDoshasAndYogas(groom);
  const bManglik = bAnalysis.doshas.find((d) => d.id === 'manglik')?.present ?? false;
  const gManglik = gAnalysis.doshas.find((d) => d.id === 'manglik')?.present ?? false;
  const manglikCompatible = bManglik === gManglik;

  let verdict = 'Needs Detailed Review';
  let recommendation =
    'Score is below 18/36. Consult a qualified Vedic astrologer to review Navamsa (D9) and 7th house strength.';
  if (totalScore >= 28) {
    verdict = 'Excellent Match (Uttam Milan)';
    recommendation = 'Strong Ashtakoot harmony across temperament, mindset, and family longevity.';
  } else if (totalScore >= 22) {
    verdict = 'Very Good Match (Shubh Milan)';
    recommendation = 'Favorable compatibility; review Manglik & Dasha alignment for timing.';
  } else if (totalScore >= 18) {
    verdict = 'Acceptable Match (Madhyam Milan)';
    recommendation = 'Meets traditional 18-point threshold; verify Nadi/Bhakoot and 7th lord dignity.';
  }

  return {
    totalScore,
    maxScore: 36,
    verdict,
    recommendation,
    kootas,
    nadiDosha: {
      present: sameNadi,
      cancelled: nadiCancelled,
      note: !sameNadi
        ? 'Different Nadis — no Nadi Dosha.'
        : nadiCancelled
        ? 'Same Nadi detected, but same Rashi with different Nakshatra mitigates Nadi Dosha.'
        : `Both partners share ${bNak.nadi} Nadi — Nadi Dosha applies.`,
    },
    bhakootDosha: {
      present: badBhakoot,
      cancelled: bhakootCancelled,
      note: !badBhakoot
        ? `Relative Moon distance (${relDist}) is auspicious — no Bhakoot Dosha.`
        : bhakootCancelled
        ? `Relative Moon distance (${relDist}) triggers Bhakoot, but friendly/identical Rashi lords cancel it.`
        : `Relative Moon distance (${relDist}) forms Bhakoot Dosha.`,
    },
    manglikCheck: {
      brideManglik: bManglik,
      groomManglik: gManglik,
      compatible: manglikCompatible,
      note: manglikCompatible
        ? bManglik
          ? 'Both charts carry active Manglik placement, balancing Mars energy.'
          : 'Neither chart carries active Manglik Dosha.'
        : 'One partner has active Manglik Dosha while the other does not — review Mars strength in D1 and D9.',
    },
  };
}

export function analyzeDetailedCompatibilityExtras(
  bride: KundliResult,
  groom: KundliResult,
  transitSky: KundliResult
) {
  const bMoon = bride.planets.find((p) => p.id === 'Moon')!;
  const gMoon = groom.planets.find((p) => p.id === 'Moon')!;
  const bMars = bride.planets.find((p) => p.id === 'Mars')!;
  const gMars = groom.planets.find((p) => p.id === 'Mars')!;
  const bJup = bride.planets.find((p) => p.id === 'Jupiter')!;
  const gJup = groom.planets.find((p) => p.id === 'Jupiter')!;

  const nadiExceptions = [
    {
      rule: 'Same Rashi, Different Nakshatra',
      applies: bride.moonSignIndex === groom.moonSignIndex && bMoon.nakshatraIndex !== gMoon.nakshatraIndex,
    },
    {
      rule: 'Same Nakshatra, Different Pada',
      applies: bMoon.nakshatraIndex === gMoon.nakshatraIndex && bMoon.pada !== gMoon.pada,
    },
    {
      rule: 'Friendly Moon Sign Lords (Graha Maitri >= 4)',
      applies: ZODIAC_SIGNS[bride.moonSignIndex].ruler === ZODIAC_SIGNS[groom.moonSignIndex].ruler,
    },
  ];

  const bhakootExceptions = [
    {
      rule: 'Identical Moon Rashi Lord',
      applies: ZODIAC_SIGNS[bride.moonSignIndex].ruler === ZODIAC_SIGNS[groom.moonSignIndex].ruler,
    },
    {
      rule: 'Same Navamsa (D9) Moon Sign',
      applies:
        bride.divisionalCharts.find((d) => d.code === 'D9')?.placements.find((p) => p.id === 'Moon')?.signIndex ===
        groom.divisionalCharts.find((d) => d.code === 'D9')?.placements.find((p) => p.id === 'Moon')?.signIndex,
    },
  ];

  const manglikCancellations = [
    {
      rule: 'Mars in Own/Exalted Sign (Aries, Scorpio, Capricorn)',
      applies: [0, 7, 9].includes(bMars.signIndex) || [0, 7, 9].includes(gMars.signIndex),
    },
    {
      rule: 'Jupiter in Kendra (1, 4, 7, 10) or Conjunct/Aspecting Mars',
      applies:
        [1, 4, 7, 10].includes(bJup.house) ||
        [1, 4, 7, 10].includes(gJup.house) ||
        bJup.aspectsHouses.includes(bMars.house) ||
        gJup.aspectsHouses.includes(gMars.house),
    },
    {
      rule: 'Mars in Movable Sign (Aries, Cancer, Libra, Capricorn)',
      applies: [0, 3, 6, 9].includes(bMars.signIndex) || [0, 3, 6, 9].includes(gMars.signIndex),
    },
  ];

  const coupleTransits = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map((pid) => {
    const tp = transitSky.planets.find((p) => p.id === pid)!;
    return {
      planet: pid,
      transitSign: tp.signName,
      brideMoonHouse: ((tp.signIndex - bride.moonSignIndex + 12) % 12) + 1,
      groomMoonHouse: ((tp.signIndex - groom.moonSignIndex + 12) % 12) + 1,
    };
  });

  return {
    nadiExceptions,
    bhakootExceptions,
    manglikCancellations,
    coupleTransits,
  };
}

