import * as Astronomy from 'astronomy-engine';
import { NAKSHATRAS, TITHI_NAMES, ZODIAC_SIGNS, type PlanetId } from './constants';
import {
  dateToJulianDay,
  getAyanamshaDegrees,
  getDivisionalSign,
  normalizeDeg,
  type KundliResult,
} from './ephemeris';
import { calculateAshtakavarga, calculateShadbalaAndAvasthas } from './vedicResearch';

// --- C-31..45: Advanced Life & Personal Analysis ---
export interface LifeAreaScore {
  area: string;
  keyHouses: string;
  score: number;
  summary: string;
  supportingYogas: string[];
}

export interface LifeAnalysisReport {
  personalProfile: {
    lagnaSign: string;
    moonSign: string;
    sunSign: string;
    moonNakshatra: string;
    pada: number;
    padaSyllable: string;
    personalitySynthesis: string;
  };
  lifeAreas: LifeAreaScore[];
  planetaryRanking: Array<{
    rank: number;
    planet: string;
    shadbalaRupas: number;
    dignity: string;
    house: number;
    savInSign: number;
    compositeScore: number;
  }>;
  parentChildReadyNote: string;
}

export function generateLifeAnalysis(kundli: KundliResult): LifeAnalysisReport {
  const sav = calculateAshtakavarga(kundli);
  const shadbala = calculateShadbalaAndAvasthas(kundli);

  const planetById = (id: PlanetId) => kundli.planets.find((p) => p.id === id)!;
  const moon = planetById('Moon');
  const sun = planetById('Sun');
  const mars = planetById('Mars');
  const mercury = planetById('Mercury');
  const jupiter = planetById('Jupiter');
  const venus = planetById('Venus');
  const saturn = planetById('Saturn');
  const rahu = planetById('Rahu');
  const ketu = planetById('Ketu');

  const houseLord = (houseNum: number): PlanetId => {
    const signIdx = (kundli.lagnaSignIndex + houseNum - 1) % 12;
    return ZODIAC_SIGNS[signIdx].ruler;
  };
  const houseScore = (houseNum: number, keyPlanet: PlanetId): number => {
    const signIdx = (kundli.lagnaSignIndex + houseNum - 1) % 12;
    const savPts = sav.sarva[signIdx]; // avg ~28
    const lord = planetById(houseLord(houseNum));
    const kp = planetById(keyPlanet);
    let score = 50 + (savPts - 28) * 2.5;
    if (['Exalted', 'Own Sign', 'Friendly'].includes(lord.dignity)) score += 10;
    if (['Exalted', 'Own Sign', 'Friendly'].includes(kp.dignity)) score += 10;
    if ([1, 4, 5, 7, 9, 10, 11].includes(lord.house)) score += 6;
    if (kp.isCombust) score -= 8;
    return Math.max(25, Math.min(97, Math.round(score)));
  };

  const d10 = kundli.divisionalCharts.find((d) => d.code === 'D10');
  const d24 = kundli.divisionalCharts.find((d) => d.code === 'D24');
  const d4 = kundli.divisionalCharts.find((d) => d.code === 'D4');
  const d20 = kundli.divisionalCharts.find((d) => d.code === 'D20');

  const lifeAreas: LifeAreaScore[] = [
    {
      area: 'Education & Intellect (Vidya)',
      keyHouses: 'H4, H5, H9 · Mercury & Jupiter · D24',
      score: Math.round((houseScore(4, 'Mercury') + houseScore(5, 'Jupiter')) / 2),
      summary: `Mercury in House ${mercury.house} (${mercury.dignity}) and Jupiter in House ${jupiter.house} shape analytical and higher scholarship; D24 Lagna sits in ${ZODIAC_SIGNS[d24?.ascendantSignIndex ?? 0].name}.`,
      supportingYogas: [
        mercury.house === sun.house ? 'Budhaditya Yoga in H' + mercury.house : `Mercury (${mercury.signName}) supports reasoning`,
        [1, 4, 5, 9, 10].includes(jupiter.house) ? 'Jupiter supports formal learning & wisdom' : `Jupiter in H${jupiter.house} builds experiential study`,
      ],
    },
    {
      area: 'Career & Professional Growth (Karma)',
      keyHouses: 'H10, H6, H11 · Saturn & Sun · D10',
      score: houseScore(10, 'Saturn'),
      summary: `10th lord ${houseLord(10)} occupies House ${planetById(houseLord(10)).house}; D10 Dashamsha Lagna is ${ZODIAC_SIGNS[d10?.ascendantSignIndex ?? 0].name}. Active Mahadasha: ${kundli.currentMahadasha?.lord || 'N/A'}.`,
      supportingYogas: [
        [1, 4, 7, 10, 11].includes(planetById(houseLord(10)).house) ? '10th Lord strongly positioned in Kendra/Upachaya' : `10th Lord in H${planetById(houseLord(10)).house}`,
        sun.house === 10 || mars.house === 10 ? 'Digbala directional career support' : `Saturn in H${saturn.house} sets work cadence`,
      ],
    },
    {
      area: 'Wealth & Financial Accumulation (Dhana)',
      keyHouses: 'H2, H11, H5, H9 · Jupiter & Venus · D2',
      score: Math.round((houseScore(2, 'Jupiter') + houseScore(11, 'Venus')) / 2),
      summary: `2nd lord ${houseLord(2)} is in H${planetById(houseLord(2)).house} and 11th lord ${houseLord(11)} is in H${planetById(houseLord(11)).house}. SAV bindus: H2=${sav.sarva[(kundli.lagnaSignIndex + 1) % 12]}, H11=${sav.sarva[(kundli.lagnaSignIndex + 10) % 12]}.`,
      supportingYogas: [
        sav.sarva[(kundli.lagnaSignIndex + 10) % 12] >= 30 ? 'High 11th-House Labha SAV (30+ bindus)' : 'Steady income accumulation pattern',
        [2, 5, 9, 11].includes(jupiter.house) ? 'Jupiter strengthens Dhana houses' : `Venus in H${venus.house} aids liquidity`,
      ],
    },
    {
      area: 'Foreign Travel & Global Reach (Videsh)',
      keyHouses: 'H9, H12, H7 · Rahu & Moon',
      score: houseScore(12, 'Rahu'),
      summary: `9th lord ${houseLord(9)} (H${planetById(houseLord(9)).house}), 12th lord ${houseLord(12)} (H${planetById(houseLord(12)).house}), and Rahu in H${rahu.house} govern long-distance & overseas opportunities.`,
      supportingYogas: [
        [9, 12, 7, 4].includes(rahu.house) ? 'Rahu activates cross-border/foreign houses' : `Rahu in H${rahu.house} (${rahu.signName})`,
        ZODIAC_SIGNS[kundli.lagnaSignIndex].modality === 'Movable' ? 'Chara (Movable) Lagna favors travel mobility' : `${ZODIAC_SIGNS[kundli.lagnaSignIndex].modality} Lagna favors anchored stays`,
      ],
    },
    {
      area: 'Property & Vehicle Assets (Bhumi/Vahana)',
      keyHouses: 'H4 · Mars & Venus · D4 & D16',
      score: houseScore(4, 'Venus'),
      summary: `4th house (${ZODIAC_SIGNS[(kundli.lagnaSignIndex + 3) % 12].name}, SAV ${sav.sarva[(kundli.lagnaSignIndex + 3) % 12]}), Mars (land) in H${mars.house}, and Venus (vehicles) in H${venus.house}; D4 Lagna is ${ZODIAC_SIGNS[d4?.ascendantSignIndex ?? 0].name}.`,
      supportingYogas: [
        ['Exalted', 'Own Sign', 'Friendly'].includes(mars.dignity) ? 'Mars Dignity supports real estate & land' : 'Careful documentation advised on real estate',
        ['Exalted', 'Own Sign', 'Friendly'].includes(venus.dignity) ? 'Venus supports conveyances & home comforts' : 'Steady asset buildup over time',
      ],
    },
    {
      area: 'Siblings & Initiative (Sahaja)',
      keyHouses: 'H3 · Mars · D3 Drekkana',
      score: houseScore(3, 'Mars'),
      summary: `3rd lord ${houseLord(3)} placed in H${planetById(houseLord(3)).house} with Mars in H${mars.house} reflects sibling dynamics, courage, and self-started ventures.`,
      supportingYogas: [`3rd House SAV bindus: ${sav.sarva[(kundli.lagnaSignIndex + 2) % 12]}`],
    },
    {
      area: 'Spiritual Growth & Sadhana (Moksha)',
      keyHouses: 'H9, H12 · Jupiter & Ketu · D20',
      score: houseScore(9, 'Jupiter'),
      summary: `Ketu in H${ketu.house} (${ketu.signName}) and Jupiter in H${jupiter.house} alongside D20 Lagna (${ZODIAC_SIGNS[d20?.ascendantSignIndex ?? 0].name}) describe contemplative & dharmic inclination.`,
      supportingYogas: [
        [1, 5, 9, 12].includes(ketu.house) ? 'Ketu placed in Moksha/Dharma Trikona' : `Ketu in H${ketu.house}`,
      ],
    },
    {
      area: 'Vitality & Health House Education (Arogya)',
      keyHouses: 'H1, H6, H8 · Sun & Moon · D27',
      score: houseScore(1, 'Sun'),
      summary: `Educational Vedic analysis of 1st lord ${houseLord(1)} (H${planetById(houseLord(1)).house}), 6th lord ${houseLord(6)} (H${planetById(houseLord(6)).house}), and Sun in H${sun.house} (routine & vitality indicators; not medical advice).`,
      supportingYogas: [`Lagna SAV bindus: ${sav.sarva[kundli.lagnaSignIndex]}`],
    },
    {
      area: 'Creativity, Talent & Leadership (Pratibha)',
      keyHouses: 'H1, H5, H10 · Sun, Venus & Mercury',
      score: Math.round((houseScore(5, 'Venus') + houseScore(1, 'Sun')) / 2),
      summary: `Sun in H${sun.house} (${sun.dignity}) drives executive leadership, while 5th house (${ZODIAC_SIGNS[(kundli.lagnaSignIndex + 4) % 12].name}) and Venus govern creative expression.`,
      supportingYogas: [
        [1, 5, 9, 10].includes(sun.house) ? 'Strong Sun placement for authority & initiative' : `Sun in H${sun.house} builds behind-the-scenes mastery`,
      ],
    },
  ];

  const planetaryRanking = shadbala
    .map((s) => {
      const p = planetById(s.planet);
      const savInSign = sav.sarva[p.signIndex];
      const compositeScore = Math.round(s.ratio * 45 + p.strengthScore * 0.4 + savInSign * 0.5);
      return {
        rank: 0,
        planet: s.planet,
        shadbalaRupas: s.totalRupas,
        dignity: p.dignity,
        house: p.house,
        savInSign,
        compositeScore,
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const nakInfo = NAKSHATRAS[moon.nakshatraIndex];
  const lagnaInfo = ZODIAC_SIGNS[kundli.lagnaSignIndex];
  const moonInfo = ZODIAC_SIGNS[kundli.moonSignIndex];

  return {
    personalProfile: {
      lagnaSign: `${lagnaInfo.name} (${lagnaInfo.sanskritName})`,
      moonSign: `${moonInfo.name} (${moonInfo.sanskritName})`,
      sunSign: `${ZODIAC_SIGNS[kundli.sunSignIndex].name} (${ZODIAC_SIGNS[kundli.sunSignIndex].sanskritName})`,
      moonNakshatra: moon.nakshatraName,
      pada: moon.pada,
      padaSyllable: nakInfo.padaSyllables[moon.pada - 1] || 'A',
      personalitySynthesis: `${lagnaInfo.name} Ascendant (${lagnaInfo.element}, ${lagnaInfo.modality}) shapes outer temperament and life approach, while Moon in ${moonInfo.name} (${moon.nakshatraName} Pada ${moon.pada}) governs emotional memory and instinctive decisions.`,
    },
    lifeAreas,
    planetaryRanking,
    parentChildReadyNote: 'Compare any two charts (Parent vs Child) for Lagna element harmony, Moon Rashi Trine/Sextile resonance, and shared Nakshatra Pada dynamics.',
  };
}

// C-40: Parent-Child Kundli Comparison
export function compareParentChildKundli(parent: KundliResult, child: KundliResult) {
  const moonSignDiff = ((child.moonSignIndex - parent.moonSignIndex + 12) % 12) + 1;
  const lagnaDiff = ((child.lagnaSignIndex - parent.lagnaSignIndex + 12) % 12) + 1;
  const pJup = parent.planets.find((p) => p.id === 'Jupiter')!;
  const cMoon = child.planets.find((p) => p.id === 'Moon')!;
  const jupiterMoonHarmony = [1, 5, 7, 9].includes(((cMoon.signIndex - pJup.signIndex + 12) % 12) + 1);
  const pMoon = parent.planets.find((p) => p.id === 'Moon')!;
  const taraIdx = (cMoon.nakshatraIndex - pMoon.nakshatraIndex + 27) % 9;
  const taraFavorable = [1, 3, 5, 7, 8].includes(taraIdx);

  return {
    parentLagna: parent.ascendant.signName,
    childLagna: child.ascendant.signName,
    parentMoon: pMoon.signName,
    childMoon: cMoon.signName,
    moonRelationshipHouse: moonSignDiff,
    lagnaRelationshipHouse: lagnaDiff,
    jupiterMoonBlessing: jupiterMoonHarmony,
    nakshatraTaraFavorable: taraFavorable,
    guidance: [
      [1, 3, 5, 9, 11].includes(moonSignDiff)
        ? `Emotional resonance is naturally harmonious (Moon Rashi distance ${moonSignDiff}/12).`
        : `Different emotional pacing (Moon Rashi distance ${moonSignDiff}/12); conscious communication fosters mutual understanding.`,
      jupiterMoonHarmony
        ? "Parent's Jupiter aspects or aligns with Child's Moon sign, indicating strong mentorship and guidance."
        : "Parent's educational support thrives when respecting Child's Mercury/5th-house learning style.",
      taraFavorable
        ? `Nakshatra Tara from Parent to Child is auspicious (${cMoon.nakshatraName}).`
        : `Nakshatra Tara shows complementary growth lessons between ${pMoon.nakshatraName} and ${cMoon.nakshatraName}.`,
    ],
  };
}

// E-68: Child Birth Nakshatra Analysis
export function analyzeChildBirthNakshatra(kundli: KundliResult) {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const nak = NAKSHATRAS[moon.nakshatraIndex];
  const isGandmool = [0, 8, 9, 17, 18, 26].includes(moon.nakshatraIndex);
  return {
    nakshatra: nak.name,
    hindiName: nak.hindiName,
    pada: moon.pada,
    namingSyllable: nak.padaSyllables[moon.pada - 1],
    allFourSyllables: nak.padaSyllables,
    deity: nak.deity,
    gana: nak.gana,
    yoni: nak.yoni,
    nadi: nak.nadi,
    nakshatraLord: nak.lord,
    isGandmool,
    gandmoolNote: isGandmool
      ? `${nak.name} is one of the 6 Gandmool Nakshatras (ruled by ${nak.lord}). Traditional families perform Nakshatra Shanti around day 27 when Moon returns to ${nak.name}.`
      : `${nak.name} is a non-Gandmool Nakshatra, smooth for traditional naming ceremonies.`,
  };
}

// --- D-46..60: Advanced Calendar & Muhurat System ---
export interface PlanetaryHoraSlot {
  index: number;
  period: 'Day' | 'Night';
  planet: PlanetId;
  startTime: string;
  endTime: string;
  bestFor: string;
}

const CHALDEAN_HORA_ORDER: PlanetId[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const HORA_PURPOSE: Record<PlanetId, string> = {
  Sun: 'Authority meetings, leadership & government tasks',
  Moon: 'Travel, domestic harmony, creative & emotional talks',
  Mars: 'Physical tasks, technical engineering & decisive action',
  Mercury: 'Commerce, accounting, writing & study',
  Jupiter: 'Education, finance, spiritual initiation & agreements',
  Venus: 'Arts, relationships, luxury purchases & celebrations',
  Saturn: 'Real estate, discipline, maintenance & long-term planning',
  Rahu: '',
  Ketu: '',
};

function fmtTime(utcMs: number, tzMin: number): string {
  const d = new Date(utcMs + tzMin * 60000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

// D-52 & D-53: Daily Hora Calculator & 24-Hour Planetary Hora Table
export function calculateDailyHoras(
  dateStr: string,
  latitude = 28.6139,
  longitude = 77.209,
  timezoneOffsetMinutes = 330
): PlanetaryHoraSlot[] {
  const [y, m, d] = dateStr.split('-').map(Number);
  const midnightMs = Date.UTC(y, m - 1, d, 0, 0, 0) - timezoneOffsetMinutes * 60000;
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const rise1 = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, new Date(midnightMs), 1);
  const set1 = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, new Date(midnightMs), 1);
  const rise2 = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, new Date(midnightMs + 86400000), 1);

  const sunriseMs = rise1 ? rise1.date.getTime() : midnightMs + 6 * 3600000;
  const sunsetMs = set1 ? set1.date.getTime() : midnightMs + 18 * 3600000;
  const nextRiseMs = rise2 ? rise2.date.getTime() : sunriseMs + 86400000;

  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  const weekdayLords: PlanetId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const startLordIdx = CHALDEAN_HORA_ORDER.indexOf(weekdayLords[weekday]);

  const dayHoraMs = (sunsetMs - sunriseMs) / 12;
  const nightHoraMs = (nextRiseMs - sunsetMs) / 12;

  const slots: PlanetaryHoraSlot[] = [];
  for (let i = 0; i < 24; i++) {
    const planet = CHALDEAN_HORA_ORDER[(startLordIdx + i) % 7];
    const isDay = i < 12;
    const startMs = isDay ? sunriseMs + i * dayHoraMs : sunsetMs + (i - 12) * nightHoraMs;
    const endMs = startMs + (isDay ? dayHoraMs : nightHoraMs);
    slots.push({
      index: i + 1,
      period: isDay ? 'Day' : 'Night',
      planet,
      startTime: fmtTime(startMs, timezoneOffsetMinutes),
      endTime: fmtTime(endMs, timezoneOffsetMinutes),
      bestFor: HORA_PURPOSE[planet],
    });
  }
  return slots;
}

// D-54..58: Tara Bala, Chandra Bala, Panchak, Bhadra & Gandmool for a date & optional birth Moon
export function calculateSpecialMuhuratChecks(
  dateStr: string,
  birthMoonNakIdx = 0, // 0..26 (default Ashwini)
  birthMoonSignIdx = 0 // 0..11 (default Aries)
) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 0, 30, 0)); // ~6 AM IST
  const astro = Astronomy.MakeTime(utc);
  const aya = getAyanamshaDegrees(dateToJulianDay(utc), 'lahiri');
  const sunSid = normalizeDeg(Astronomy.SunPosition(astro).elon - aya);
  const moonSid = normalizeDeg(Astronomy.EclipticGeoMoon(astro).lon - aya);

  const nakIdx = Math.floor(moonSid / (360 / 27));
  const moonSignIdx = Math.floor(moonSid / 30);
  const elong = normalizeDeg(moonSid - sunSid);
  const halfTithi = Math.floor(elong / 6);
  const tithiIdx = Math.floor(elong / 12);

  // D-54 Tara Bala
  const taraNum = ((nakIdx - birthMoonNakIdx + 27) % 9) + 1;
  const taraNames = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Parama Mitra'];
  const taraGood = [2, 4, 6, 8, 9].includes(taraNum);

  // D-55 Chandra Bala
  const chandraHouse = ((moonSignIdx - birthMoonSignIdx + 12) % 12) + 1;
  const chandraGood = [1, 3, 6, 7, 10, 11].includes(chandraHouse);

  // D-56 Panchak (Moon from Dhanishta pada 3/4 through Revati => sidereal moon >= 293.333 deg)
  const inPanchak = moonSid >= 293.3333;
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const panchakTypes = ['Rog Panchak', 'Raj Panchak', 'Agni Panchak', 'Dhan/Neutral Panchak', 'Dhan/Neutral Panchak', 'Chor Panchak', 'Mrityu Panchak'];

  // D-57 Bhadra (Vishti Karana occurs at half-tithis 7,14,21,28,35,42,49,56)
  const isBhadra = halfTithi > 0 && halfTithi < 57 && (halfTithi - 1) % 7 === 6;
  const bhadraVasa = [3, 4, 10, 11].includes(moonSignIdx)
    ? 'Prithvi (Earth — Avoid auspicious starts)'
    : [0, 1, 2, 7].includes(moonSignIdx)
    ? 'Swarga (Heaven)'
    : 'Patala (Netherworld)';

  // D-58 Gandmool
  const isGandmool = [0, 8, 9, 17, 18, 26].includes(nakIdx);

  return {
    date: dateStr,
    transitMoonSign: ZODIAC_SIGNS[moonSignIdx].name,
    transitNakshatra: NAKSHATRAS[nakIdx].name,
    tithiName: `${tithiIdx < 15 ? 'Shukla' : 'Krishna'} ${TITHI_NAMES[tithiIdx]}`,
    taraBala: {
      taraNumber: taraNum,
      taraName: taraNames[taraNum - 1],
      isAuspicious: taraGood,
      note: taraGood ? 'Favorable Tara Bala for initiating work.' : taraNum === 1 ? 'Neutral Janma Tara — proceed with mindfulness.' : 'Unfavorable Tara — defer critical starts if possible.',
    },
    chandraBala: {
      moonHouseFromNatal: chandraHouse,
      isAuspicious: chandraGood,
      note: chandraGood ? 'Strong Chandra Bala (auspicious lunar support).' : 'Weak Chandra Bala — routine tasks preferred.',
    },
    panchak: {
      active: inPanchak,
      label: inPanchak ? panchakTypes[weekday] : 'No Panchak',
    },
    bhadra: {
      active: isBhadra,
      residence: isBhadra ? bhadraVasa : 'No Bhadra (Vishti)',
    },
    gandmool: {
      active: isGandmool,
      nakshatra: NAKSHATRAS[nakIdx].name,
      note: isGandmool ? 'Gandmool Nakshatra active today.' : 'Non-Gandmool Nakshatra.',
    },
  };
}

// D-46..51 & D-59..60: Full Year Astronomical Festival, Ekadashi, Sankranti, Purnima/Amavasya, Vivah & Naamkaran Finder
export interface CalendarEventItem {
  date: string;
  name: string;
  region: 'Pan-India' | 'North India' | 'Maharashtra / West' | 'South India' | 'East India';
  category: 'Festival' | 'Ekadashi' | 'Sankranti' | 'Purnima' | 'Amavasya';
  tithi: string;
  nakshatra: string;
}

export function generateAstronomicalCalendarYear(year: number): {
  events: CalendarEventItem[];
  vivahMuhurats: Array<{ date: string; tithi: string; nakshatra: string }>;
  naamkaranMuhurats: Array<{ date: string; tithi: string; nakshatra: string }>;
} {
  const events: CalendarEventItem[] = [];
  const vivahMuhurats: Array<{ date: string; tithi: string; nakshatra: string }> = [];
  const naamkaranMuhurats: Array<{ date: string; tithi: string; nakshatra: string }> = [];

  const startMs = Date.UTC(year, 0, 1, 0, 30, 0);
  let prevSunSign = -1;
  let prevTithi = -1;

  const vivahNaks = new Set([3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26]);
  const naamNaks = new Set([0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26]);
  const riktaTithis = new Set([3, 8, 13, 18, 23, 28, 29]);

  for (let day = 0; day < 366; day++) {
    const dt = new Date(startMs + day * 86400000);
    if (dt.getUTCFullYear() !== year) break;
    const dateStr = dt.toISOString().slice(0, 10);
    const astro = Astronomy.MakeTime(dt);
    const aya = getAyanamshaDegrees(dateToJulianDay(dt), 'lahiri');
    const sunSid = normalizeDeg(Astronomy.SunPosition(astro).elon - aya);
    const moonSid = normalizeDeg(Astronomy.EclipticGeoMoon(astro).lon - aya);

    const sunSign = Math.floor(sunSid / 30);
    const elong = normalizeDeg(moonSid - sunSid);
    const tithiIdx = Math.floor(elong / 12);
    const halfTithi = Math.floor(elong / 6);
    const nakIdx = Math.floor(moonSid / (360 / 27));
    const tithiLabel = `${tithiIdx < 15 ? 'Shukla' : 'Krishna'} ${TITHI_NAMES[tithiIdx]}`;
    const nakName = NAKSHATRAS[nakIdx].name;

    // Sankranti check
    if (prevSunSign !== -1 && sunSign !== prevSunSign) {
      const specialRegion =
        sunSign === 9
          ? 'Pan-India (Makar Sankranti / Pongal)'
          : sunSign === 0
          ? 'East & South India (Mesha Sankranti / Puthandu / Pohela Boishakh)'
          : 'Pan-India';
      events.push({
        date: dateStr,
        name: `${ZODIAC_SIGNS[sunSign].sanskritName} Sankranti${sunSign === 9 ? ' / Makar Sankranti & Pongal' : sunSign === 0 ? ' / Mesha Vishu' : ''}`,
        region: specialRegion.includes('East') ? 'East India' : 'Pan-India',
        category: 'Sankranti',
        tithi: tithiLabel,
        nakshatra: nakName,
      });
    }

    // Ekadashi, Purnima, Amavasya (emit once per lunar transition)
    if (tithiIdx !== prevTithi) {
      if (tithiIdx === 10 || tithiIdx === 25) {
        events.push({
          date: dateStr,
          name: `${tithiIdx === 10 ? 'Shukla' : 'Krishna'} Ekadashi Vrat`,
          region: 'Pan-India',
          category: 'Ekadashi',
          tithi: tithiLabel,
          nakshatra: nakName,
        });
      }
      if (tithiIdx === 14) {
        let fest = 'Purnima (Full Moon)';
        if (sunSign === 10 || sunSign === 11) fest = 'Phalguna Purnima / Holika Dahan';
        if (sunSign === 2 || sunSign === 3) fest = 'Ashadha / Guru Purnima';
        if (sunSign === 4) fest = 'Shravana Purnima / Raksha Bandhan';
        if (sunSign === 7) fest = 'Kartik Purnima / Dev Deepawali';
        events.push({ date: dateStr, name: fest, region: 'Pan-India', category: 'Purnima', tithi: tithiLabel, nakshatra: nakName });
      }
      if (tithiIdx === 29) {
        const isDiwali = sunSign === 6 || (sunSign === 7 && dt.getUTCMonth() === 9);
        events.push({
          date: dateStr,
          name: isDiwali ? 'Kartik Amavasya / Deepavali (Diwali)' : 'Amavasya (New Moon)',
          region: 'Pan-India',
          category: isDiwali ? 'Festival' : 'Amavasya',
          tithi: tithiLabel,
          nakshatra: nakName,
        });
      }
      // Key Lunar Festivals
      if (sunSign === 10 && tithiIdx === 28) {
        events.push({ date: dateStr, name: 'Maha Shivaratri', region: 'Pan-India', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 11 && tithiIdx === 0) {
        events.push({ date: dateStr, name: 'Gudi Padwa / Ugadi / Chaitra Navratri Start', region: 'Maharashtra / West', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 11 && tithiIdx === 8) {
        events.push({ date: dateStr, name: 'Sri Ram Navami', region: 'Pan-India', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 0 && tithiIdx === 2) {
        events.push({ date: dateStr, name: 'Akshaya Tritiya', region: 'Pan-India', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 4 && tithiIdx === 22) {
        events.push({ date: dateStr, name: 'Sri Krishna Janmashtami', region: 'North India', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 4 && tithiIdx === 3) {
        events.push({ date: dateStr, name: 'Ganesh Chaturthi', region: 'Maharashtra / West', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 5 && tithiIdx === 9) {
        events.push({ date: dateStr, name: 'Vijayadashami (Dussehra)', region: 'Pan-India', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
      if (sunSign === 5 && tithiIdx === 7) {
        events.push({ date: dateStr, name: 'Durga Ashtami', region: 'East India', category: 'Festival', tithi: tithiLabel, nakshatra: nakName });
      }
    }

    // Vivah & Naamkaran Muhurat filters
    const isBhadra = halfTithi > 0 && halfTithi < 57 && (halfTithi - 1) % 7 === 6;
    if (!isBhadra && !riktaTithis.has(tithiIdx)) {
      if (vivahNaks.has(nakIdx) && ![2, 3, 4].includes(sunSign) && vivahMuhurats.length < 24) {
        vivahMuhurats.push({ date: dateStr, tithi: tithiLabel, nakshatra: nakName });
      }
      if (naamNaks.has(nakIdx) && naamkaranMuhurats.length < 30) {
        naamkaranMuhurats.push({ date: dateStr, tithi: tithiLabel, nakshatra: nakName });
      }
    }

    prevSunSign = sunSign;
    prevTithi = tithiIdx;
  }

  return { events, vivahMuhurats, naamkaranMuhurats };
}
