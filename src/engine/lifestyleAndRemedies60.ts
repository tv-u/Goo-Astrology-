import { ZODIAC_SIGNS, type PlanetId } from './constants';
import { calculateKundli, type BirthInput, type KundliResult } from './ephemeris';
import { calculateAshtakoot } from './ashtakoot';
import { analyzeDoshasAndYogas } from './doshaYoga';

// #33: Multi-Partner Kundli Comparison Matrix (1 vs N)
export function compareMultiPartnerMatrix(primaryBirth: BirthInput, candidates: BirthInput[]) {
  const primaryKundli = calculateKundli(primaryBirth);
  return candidates.map((cand) => {
    const ck = calculateKundli(cand);
    const match = calculateAshtakoot(primaryKundli, ck);
    const dosha = analyzeDoshasAndYogas(ck);
    const manglik = dosha.doshas.find((d) => d.id === 'manglik')?.present || false;
    return {
      candidateName: cand.name,
      moonSign: ck.planets[1].signName,
      nakshatra: ck.planets[1].nakshatraName,
      totalScore: match.totalScore,
      verdict: match.verdict,
      nadiScore: match.kootas.find((k) => k.name === 'Nadi')?.obtainedScore ?? 0,
      bhakootScore: match.kootas.find((k) => k.name === 'Bhakoot')?.obtainedScore ?? 0,
      manglikPresent: manglik,
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

// #35: Rule-based Authentic Gemstone & Rudraksha Recommender (Lagna / Trikona Math only)
const GEM_BY_PLANET: Record<PlanetId, { gem: string; metal: string; finger: string; rudraksha: string; mantra: string }> = {
  Sun: { gem: 'Ruby (Manik)', metal: 'Gold / Copper', finger: 'Ring Finger', rudraksha: '1 Mukhi or 12 Mukhi', mantra: 'Om Hram Hrim Hraum Sah Suryaya Namah' },
  Moon: { gem: 'Natural Pearl (Moti)', metal: 'Silver', finger: 'Little Finger', rudraksha: '2 Mukhi', mantra: 'Om Shram Shrim Shraum Sah Chandraya Namah' },
  Mars: { gem: 'Red Coral (Moonga)', metal: 'Copper / Gold', finger: 'Ring Finger', rudraksha: '3 Mukhi', mantra: 'Om Kram Krim Kraum Sah Bhaumaya Namah' },
  Mercury: { gem: 'Emerald (Panna)', metal: 'Gold / Silver', finger: 'Little Finger', rudraksha: '4 Mukhi', mantra: 'Om Bram Brim Braum Sah Budhaya Namah' },
  Jupiter: { gem: 'Yellow Sapphire (Pukhraj)', metal: 'Gold', finger: 'Index Finger', rudraksha: '5 Mukhi', mantra: 'Om Gram Grim Graum Sah Gurave Namah' },
  Venus: { gem: 'White Sapphire / Diamond', metal: 'Silver / Platinum', finger: 'Middle or Little Finger', rudraksha: '6 Mukhi', mantra: 'Om Dram Drim Draum Sah Shukraya Namah' },
  Saturn: { gem: 'Blue Sapphire (Neelam — strictly after trial)', metal: 'Silver / Panchdhatu', finger: 'Middle Finger', rudraksha: '7 Mukhi', mantra: 'Om Pram Prim Praum Sah Shanaye Namah' },
  Rahu: { gem: 'Hessonite (Gomed — consultation advised)', metal: 'Silver', finger: 'Middle Finger', rudraksha: '8 Mukhi', mantra: 'Om Bhram Bhrim Bhraum Sah Rahave Namah' },
  Ketu: { gem: "Cat's Eye (Lehsunia — consultation advised)", metal: 'Silver', finger: 'Little Finger', rudraksha: '9 Mukhi', mantra: 'Om Shram Shrim Shraum Sah Ketave Namah' },
};

export function recommendGemstonesAndRudraksha(kundli: KundliResult) {
  const lagna = kundli.lagnaSignIndex;
  const h1Lord = ZODIAC_SIGNS[lagna].ruler;
  const h5Lord = ZODIAC_SIGNS[(lagna + 4) % 12].ruler;
  const h9Lord = ZODIAC_SIGNS[(lagna + 8) % 12].ruler;
  const trikonaLords = Array.from(new Set<PlanetId>([h1Lord, h5Lord, h9Lord]));

  return trikonaLords.map((planet, idx) => ({
    role: idx === 0 ? 'Lagna Lord (Life Stone / Jeevan Ratna)' : idx === 1 ? '5th Lord (Education & Creativity)' : '9th Lord (Bhagya / Fortune Stone)',
    planet,
    ...GEM_BY_PLANET[planet],
  }));
}

// #37: Lo Shu Grid 3x3 & Raj Yoga Arrows
export function calculateLoShuGrid(dateStr: string) {
  const digits = dateStr.replace(/\D/g, '').split('').map(Number).filter((d) => d >= 1 && d <= 9);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const d of digits) counts[d]++;

  const arrows = [
    { nums: [4, 9, 2], name: 'Mental / Memory Plane' },
    { nums: [3, 5, 7], name: 'Emotional / Spiritual Plane' },
    { nums: [8, 1, 6], name: 'Practical / Grounded Plane' },
    { nums: [4, 5, 6], name: 'Golden Raj Yoga (Willpower & Success)' },
    { nums: [2, 5, 8], name: 'Silver Raj Yoga (Property & Earth Balance)' },
  ].map((a) => ({
    ...a,
    active: a.nums.every((n) => counts[n] > 0),
  }));

  const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => counts[n] === 0);
  return { counts, arrows, missingNumbers };
}

// #38 & #39: Chaldean Numeric Evaluation (Mobile / Vehicle / Brand / Signature)
const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

function reduceRoot(n: number): number {
  let cur = Math.abs(Math.round(n));
  while (cur > 9) {
    cur = String(cur).split('').reduce((s, ch) => s + Number(ch), 0);
  }
  return cur;
}

export function evaluateChaldeanIdentifier(input: string, category: 'mobile' | 'vehicle' | 'house' | 'brand') {
  const clean = input.toUpperCase().trim();
  let sum = 0;
  for (const ch of clean) {
    if (/\d/.test(ch)) sum += Number(ch);
    else if (CHALDEAN_MAP[ch]) sum += CHALDEAN_MAP[ch];
  }
  const root = reduceRoot(sum);
  const planetByRoot: Record<number, { planet: string; quality: string }> = {
    1: { planet: 'Sun', quality: 'Leadership, authority & high visibility' },
    2: { planet: 'Moon', quality: 'Harmony, counseling & diplomatic flow' },
    3: { planet: 'Jupiter', quality: 'Wisdom, expansion & teaching success' },
    4: { planet: 'Rahu', quality: 'Unconventional innovation & technical edge' },
    5: { planet: 'Mercury', quality: 'Commerce, speed, marketing & adaptability' },
    6: { planet: 'Venus', quality: 'Luxury, design, hospitality & brand allure' },
    7: { planet: 'Ketu', quality: 'Research, spirituality & analytical depth' },
    8: { planet: 'Saturn', quality: 'Real estate, endurance & heavy industry' },
    9: { planet: 'Mars', quality: 'Bold energy, engineering & decisive scale' },
  };
  const info = planetByRoot[root] || planetByRoot[5];
  return {
    input,
    category,
    compoundTotal: sum,
    rootNumber: root,
    rulingPlanet: info.planet,
    interpretation: info.quality,
  };
}

// #41: 16-Direction MahaVastu Zones Analyzer
export const MAHAVASTU_16_ZONES = [
  { code: 'N', name: 'North', element: 'Water', deity: 'Kuber', attribute: 'Money, New Opportunities & Career Flow', ideal: 'Open space, blue/white accents, study' },
  { code: 'NNE', name: 'North-North-East', element: 'Water', deity: 'Dhanvantari', attribute: 'Health, Immunity & Healing', ideal: 'Medicines, calm meditation corner' },
  { code: 'NE', name: 'North-East (Ishan)', element: 'Water', deity: 'Shiva / Apavatsa', attribute: 'Clarity, Meditation & Wisdom', ideal: 'Pooja room, water fountain, clean light' },
  { code: 'ENE', name: 'East-North-East', element: 'Air', deity: 'Parjanya', attribute: 'Fun, Recreation & Freshness', ideal: 'Living room seating, family lounge' },
  { code: 'E', name: 'East', element: 'Air', deity: 'Indra / Surya', attribute: 'Social Connections & Recognition', ideal: 'Main entrance, windows, sunlit dining' },
  { code: 'ESE', name: 'East-South-East', element: 'Air', deity: 'Satyak', attribute: 'Analysis &Churning (Manthan)', ideal: 'Washing area, analytical desk' },
  { code: 'SE', name: 'South-East (Agneya)', element: 'Fire', deity: 'Agni', attribute: 'Cash Liquidity & Fire Energy', ideal: 'Kitchen stove, electrical panel' },
  { code: 'SSE', name: 'South-South-East', element: 'Fire', deity: 'Pusha', attribute: 'Power, Confidence & Strength', ideal: 'Gym/vitality corner, red tones' },
  { code: 'S', name: 'South', element: 'Fire', deity: 'Yama / Gandharva', attribute: 'Fame, Relaxation & Goodwill', ideal: 'Restful bedroom, heavy storage' },
  { code: 'SSW', name: 'South-South-West', element: 'Earth', deity: 'Bhringaraja', attribute: 'Disposal & Letting Go', ideal: 'Toilet / waste disposal / clutter clear' },
  { code: 'SW', name: 'South-West (Nairutya)', element: 'Earth', deity: 'Pitra', attribute: 'Skills, Ancestors, Stability & Relationships', ideal: 'Master bedroom, safe, heavy furniture' },
  { code: 'WSW', name: 'West-South-West', element: 'Space', deity: 'Dauwarik', attribute: 'Education, Knowledge & Savings', ideal: 'Library, study table, children books' },
  { code: 'W', name: 'West', element: 'Space', deity: 'Varuna', attribute: 'Gains, Profits & Fulfillment', ideal: 'Dining room, safe, workspace' },
  { code: 'WNW', name: 'West-North-West', element: 'Space', deity: 'Shosha', attribute: 'Emotional Release', ideal: 'Short guest stays, clearing stagnant items' },
  { code: 'NW', name: 'North-West (Vayavya)', element: 'Space', deity: 'Vayu', attribute: 'Support, Banking & Travel Movement', ideal: 'Guest room, vehicle parking, finished goods' },
  { code: 'NNW', name: 'North-North-West', element: 'Water', deity: 'Mukhya', attribute: 'Attraction & Intimacy', ideal: 'Harmonious decor, balanced bedroom' },
];

// #44: Classical Swapna Shastra (Dream Encyclopedia)
export const SWAPNA_SHASTRA_DREAMS = [
  { keyword: 'Flowing Clean River / Ocean', hindi: 'स्वच्छ बहती नदी या समुद्र', symbolism: 'Emotional renewal, prosperity, and travel opportunity.', auspicious: true },
  { keyword: 'White Elephant / Airavata', hindi: 'सफेद हाथी देखना', symbolism: 'Classical sign of dignity, royalty, and steady wealth.', auspicious: true },
  { keyword: 'Lighting a Diya / Lamp', hindi: 'दीपक जलाना', symbolism: 'Knowledge overcoming obstacles and auspicious family events.', auspicious: true },
  { keyword: 'Climbing a Mountain Peak', hindi: 'पर्वत की चोटी पर चढ़ना', symbolism: 'Career advancement through sustained determination.', auspicious: true },
  { keyword: 'Snake (Serpent) Coiled Calmly', hindi: 'शांत नाग दर्शन', symbolism: 'Kundalini awakening, ancestral protection, or sudden insight.', auspicious: true },
  { keyword: 'Muddy / Overflowing Flood Water', hindi: 'गंदा या बाढ़ का पानी', symbolism: 'Need to calm stress, review finances, and avoid hasty commitments.', auspicious: false },
  { keyword: 'Losing Teeth or Broken Mirror', hindi: 'दांत टूटना या टूटा दर्पण', symbolism: 'Signals health checkups, careful speech, and stress relief.', auspicious: false },
  { keyword: 'Flying Freely in Clear Sky', hindi: 'खुले आकाश में उड़ना', symbolism: 'Creative liberation and release from limiting routines.', auspicious: true },
  { keyword: 'Seeing Sacred Temple / Bells', hindi: 'मंदिर या घंटी की ध्वनि', symbolism: 'Inner peace, spiritual initiation, and blessing of elders.', auspicious: true },
  { keyword: 'Receiving Gold Coins or Lotus', hindi: 'सोने के सिक्के या कमल प्राप्त करना', symbolism: 'Lakshmi grace, business gains, and creative recognition.', auspicious: true },
];
