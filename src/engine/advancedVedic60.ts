import {
  NAKSHATRAS,
  PLANET_DIGNITY_SIGNS,
  ZODIAC_SIGNS,
  type PlanetId,
} from './constants';
import {
  calculateKundli,
  formatDms,
  getDivisionalSign,
  normalizeDeg,
  type BirthInput,
  type KundliResult,
} from './ephemeris';
import { getKpStarAndSubLord } from './astrologySystems';
import { calculateAshtakavarga } from './vedicResearch';

const PLANETS_7: PlanetId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const PLANETS_9: PlanetId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function addYearsIso(dateStr: string, years: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y || 2000, (m || 1) - 1, d || 1));
  const ms = dt.getTime() + years * 365.2425 * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

// Dual-lordships for Scorpio (Mars/Ketu) and Aquarius (Saturn/Rahu)
function getSignLordForJaimini(signIndex: number, kundli: KundliResult): PlanetId {
  if (signIndex === 7) {
    const mars = kundli.planets.find((p) => p.id === 'Mars')!;
    const ketu = kundli.planets.find((p) => p.id === 'Ketu')!;
    return mars.strengthScore >= ketu.strengthScore ? 'Mars' : 'Ketu';
  }
  if (signIndex === 10) {
    const sat = kundli.planets.find((p) => p.id === 'Saturn')!;
    const rahu = kundli.planets.find((p) => p.id === 'Rahu')!;
    return sat.strengthScore >= rahu.strengthScore ? 'Saturn' : 'Rahu';
  }
  return ZODIAC_SIGNS[signIndex].ruler;
}

// #1: Jaimini Chara Dasha Calculator
export interface JaiminiDashaPeriod {
  signIndex: number;
  signName: string;
  hindiSign: string;
  lord: PlanetId;
  durationYears: number;
  startDate: string;
  endDate: string;
  theme: string;
}

export function calculateCharaDasha(kundli: KundliResult): JaiminiDashaPeriod[] {
  const lagna = kundli.lagnaSignIndex;
  // Direct signs (Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius) vs Reverse
  const directSigns = new Set([0, 1, 2, 6, 7, 8]);
  const isDirect = directSigns.has(lagna);

  let cursor = kundli.input.date;
  const periods: JaiminiDashaPeriod[] = [];
  for (let i = 0; i < 12; i++) {
    const sIdx = isDirect ? (lagna + i) % 12 : (lagna - i + 12) % 12;
    const lord = getSignLordForJaimini(sIdx, kundli);
    const lordPos = kundli.planets.find((p) => p.id === lord)!;

    let steps = isDirect
      ? (lordPos.signIndex - sIdx + 12) % 12
      : (sIdx - lordPos.signIndex + 12) % 12;
    if (steps === 0) steps = 12;
    else if (lordPos.dignity === 'Exalted') steps = Math.min(12, steps + 1);
    else if (lordPos.dignity === 'Debilitated') steps = Math.max(1, steps - 1);

    const end = addYearsIso(cursor, steps);
    periods.push({
      signIndex: sIdx,
      signName: ZODIAC_SIGNS[sIdx].name,
      hindiSign: ZODIAC_SIGNS[sIdx].hindiName,
      lord,
      durationYears: steps,
      startDate: cursor,
      endDate: end,
      theme: `House ${((sIdx - lagna + 12) % 12) + 1} sign focus ruled by ${lord}`,
    });
    cursor = end;
  }
  return periods;
}

// #2: Jaimini Arudha Lagna (AL), Upapada Lagna (UL) & all 12 Arudha Padas
export interface ArudhaPadaItem {
  code: string;
  houseNumber: number;
  houseSign: string;
  lord: PlanetId;
  lordSign: string;
  arudhaSignIndex: number;
  arudhaSignName: string;
  arudhaHindiName: string;
  exceptionApplied: boolean;
}

export function calculateArudhaPadas(kundli: KundliResult): ArudhaPadaItem[] {
  const lagna = kundli.lagnaSignIndex;
  const labels = ['AL (Arudha Lagna)', 'A2 (Dhana)', 'A3 (Bhratri)', 'A4 (Matri)', 'A5 (Mantra)', 'A6 (Roga)', 'A7 (Dara)', 'A8 (Mrityu)', 'A9 (Bhagya)', 'A10 (Rajya)', 'A11 (Labha)', 'UL (Upapada)'];
  const items: ArudhaPadaItem[] = [];

  for (let h = 1; h <= 12; h++) {
    const houseSignIdx = (lagna + h - 1) % 12;
    const lord = getSignLordForJaimini(houseSignIdx, kundli);
    const lordPos = kundli.planets.find((p) => p.id === lord)!;
    const dist = (lordPos.signIndex - houseSignIdx + 12) % 12;
    let arudhaIdx = (lordPos.signIndex + dist) % 12;
    let exceptionApplied = false;

    // Classical exception: if Arudha falls in same sign or 7th from the house, shift 10th from it
    const rel = (arudhaIdx - houseSignIdx + 12) % 12;
    if (rel === 0 || rel === 6) {
      arudhaIdx = (arudhaIdx + 9) % 12;
      exceptionApplied = true;
    }

    items.push({
      code: labels[h - 1],
      houseNumber: h,
      houseSign: ZODIAC_SIGNS[houseSignIdx].name,
      lord,
      lordSign: lordPos.signName,
      arudhaSignIndex: arudhaIdx,
      arudhaSignName: ZODIAC_SIGNS[arudhaIdx].name,
      arudhaHindiName: ZODIAC_SIGNS[arudhaIdx].hindiName,
      exceptionApplied,
    });
  }
  return items;
}

// #3: Yogini Dasha Calculator (36-Year Cycle)
const YOGINI_SEQ: Array<{ name: string; lord: PlanetId; years: number; nature: string }> = [
  { name: 'Mangala', lord: 'Moon', years: 1, nature: 'Auspicious beginnings & clarity' },
  { name: 'Pingala', lord: 'Sun', years: 2, nature: 'Dynamic drive & authority' },
  { name: 'Dhanya', lord: 'Jupiter', years: 3, nature: 'Wealth, wisdom & grace' },
  { name: 'Bhramari', lord: 'Mars', years: 4, nature: 'Restlessness & travel' },
  { name: 'Bhadrika', lord: 'Mercury', years: 5, nature: 'Success, friendships & craft' },
  { name: 'Ulka', lord: 'Saturn', years: 6, nature: 'Hard work & karmic testing' },
  { name: 'Siddha', lord: 'Venus', years: 7, nature: 'Fulfillment, arts & harmony' },
  { name: 'Sankata', lord: 'Rahu', years: 8, nature: 'Major transitions & breakthroughs' },
];

export function calculateYoginiDasha(kundli: KundliResult) {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const nakNum1Based = moon.nakshatraIndex + 1;
  const startIdx = (nakNum1Based + 3 - 1) % 8; // (Nak + 3) mod 8 mapped to 0..7 (0 -> Sankata=7)
  const nakSpan = 360 / 27;
  const remFrac = 1 - (moon.longitude % nakSpan) / nakSpan;

  let cursor = kundli.input.date;
  const rows: Array<{ name: string; lord: PlanetId; years: number; startDate: string; endDate: string; nature: string }> = [];
  for (let i = 0; i < 8; i++) {
    const y = YOGINI_SEQ[(startIdx + i) % 8];
    const dur = i === 0 ? Number((y.years * remFrac).toFixed(2)) : y.years;
    const end = addYearsIso(cursor, dur);
    rows.push({ ...y, years: dur, startDate: cursor, endDate: end });
    cursor = end;
  }
  return rows;
}

// #4: Ashtottari Dasha Calculator (108-Year Conditional System starting Ardra)
const ASHTOTTARI_SEQ: Array<{ lord: PlanetId; years: number }> = [
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 15 },
  { lord: 'Mars', years: 8 },
  { lord: 'Mercury', years: 17 },
  { lord: 'Saturn', years: 10 },
  { lord: 'Jupiter', years: 19 },
  { lord: 'Rahu', years: 12 },
  { lord: 'Venus', years: 21 },
];

export function calculateAshtottariDasha(kundli: KundliResult) {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const nakFromArdra = (moon.nakshatraIndex - 5 + 27) % 27; // Ardra index = 5
  const groupSpan = [4, 3, 4, 3, 4, 3, 3, 3]; // 27 nakshatras partitioned across 8 lords
  let acc = 0;
  let lordIdx = 0;
  for (let i = 0; i < groupSpan.length; i++) {
    if (nakFromArdra < acc + groupSpan[i]) {
      lordIdx = i;
      break;
    }
    acc += groupSpan[i];
  }
  const nakSpan = 360 / 27;
  const elapsedWithinGroup = (nakFromArdra - acc) + (moon.longitude % nakSpan) / nakSpan;
  const remFrac = Math.max(0.05, 1 - elapsedWithinGroup / groupSpan[lordIdx]);

  let cursor = kundli.input.date;
  const rows: Array<{ lord: PlanetId; years: number; startDate: string; endDate: string }> = [];
  for (let i = 0; i < 8; i++) {
    const item = ASHTOTTARI_SEQ[(lordIdx + i) % 8];
    const dur = i === 0 ? Number((item.years * remFrac).toFixed(2)) : item.years;
    const end = addYearsIso(cursor, dur);
    rows.push({ lord: item.lord, years: dur, startDate: cursor, endDate: end });
    cursor = end;
  }
  return rows;
}

// #5: Kalachakra Dasha (Deha, Jeeva & Savya/Apasavya Sign Sequence)
const SAVYA_SIGN_YEARS = [7, 16, 9, 21, 5, 9, 16, 7, 10]; // Aries..Sagittarius
export function calculateKalachakraDasha(kundli: KundliResult) {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const isSavya = moon.nakshatraIndex % 2 === 0;
  const dehaSignIdx = moon.signIndex;
  const jeevaSignIdx = (moon.signIndex + 8) % 12;
  const navBase = getDivisionalSign(moon.longitude, 9);

  let cursor = kundli.input.date;
  const sequence: Array<{ signName: string; years: number; startDate: string; endDate: string }> = [];
  for (let i = 0; i < 9; i++) {
    const sIdx = isSavya ? (navBase + i) % 12 : (navBase - i + 12) % 12;
    const yrs = SAVYA_SIGN_YEARS[i % 9];
    const end = addYearsIso(cursor, yrs);
    sequence.push({
      signName: ZODIAC_SIGNS[sIdx].name,
      years: yrs,
      startDate: cursor,
      endDate: end,
    });
    cursor = end;
  }
  return {
    direction: isSavya ? 'Savya (Clockwise)' : 'Apasavya (Counter-clockwise)',
    dehaRashi: ZODIAC_SIGNS[dehaSignIdx].name,
    jeevaRashi: ZODIAC_SIGNS[jeevaSignIdx].name,
    sequence,
  };
}

// #6: Narayana Dasha (Stronger of 1st / 7th initiates Sign progression)
export function calculateNarayanaDasha(kundli: KundliResult) {
  const lagna = kundli.lagnaSignIndex;
  const seventh = (lagna + 6) % 12;
  const lord1 = kundli.planets.find((p) => p.id === getSignLordForJaimini(lagna, kundli))!;
  const lord7 = kundli.planets.find((p) => p.id === getSignLordForJaimini(seventh, kundli))!;
  const startSign = lord1.strengthScore >= lord7.strengthScore ? lagna : seventh;
  const isOddFooted = [0, 1, 2, 6, 7, 8].includes(startSign);

  let cursor = kundli.input.date;
  const rows: Array<{ signName: string; lord: PlanetId; years: number; startDate: string; endDate: string }> = [];
  for (let i = 0; i < 12; i++) {
    const sIdx = isOddFooted ? (startSign + i) % 12 : (startSign - i + 12) % 12;
    const lord = getSignLordForJaimini(sIdx, kundli);
    const lPos = kundli.planets.find((p) => p.id === lord)!;
    const yrs = Math.max(1, ((lPos.signIndex - sIdx + 12) % 12) || 12);
    const end = addYearsIso(cursor, yrs);
    rows.push({
      signName: ZODIAC_SIGNS[sIdx].name,
      lord,
      years: yrs,
      startDate: cursor,
      endDate: end,
    });
    cursor = end;
  }
  return { startSignName: ZODIAC_SIGNS[startSign].name, rows };
}

// #7: Ashtakavarga Kakshya Transit Score Analyzer (3.75 deg sub-sectors)
const KAKSHYA_LORDS: Array<PlanetId | 'Lagna'> = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Lagna'];
export function calculateKakshyaTransitScores(natalKundli: KundliResult, transitDateStr?: string) {
  const av = calculateAshtakavarga(natalKundli);
  const nowStr = transitDateStr || new Date().toISOString().slice(0, 10);
  const transitKundli = calculateKundli({
    ...natalKundli.input,
    name: 'Transit Kakshya',
    date: nowStr,
    time: '12:00:00',
  });

  return transitKundli.planets.slice(0, 7).map((tp) => {
    const kakshyaIdx = Math.min(7, Math.floor(tp.degreeInSign / 3.75));
    const kakshyaLord = KAKSHYA_LORDS[kakshyaIdx];
    const bhinnaRow = av.bhinna[tp.id as keyof typeof av.bhinna];
    const signBindus = bhinnaRow ? bhinnaRow[tp.signIndex] : 4;
    const savBindus = av.sarva[tp.signIndex];
    const supportsTransit = signBindus >= 4;
    return {
      planet: tp.id,
      transitSign: tp.signName,
      degreeInSign: Number(tp.degreeInSign.toFixed(2)),
      kakshyaNumber: kakshyaIdx + 1,
      kakshyaLord,
      bhinnaBindus: signBindus,
      sarvaBindus: savBindus,
      verdict: supportsTransit ? 'Supportive Kakshya' : 'Low-Bindu Caution',
    };
  });
}

// #8: Nadi Astrology Link Engine (1-5-9 Trikona, 2-6-10 Artha, 3-7-11 Kama, 4-8-12 Moksha)
export function analyzeNadiLinks(kundli: KundliResult) {
  const groups = [
    { name: 'Dharma Trikona (Signs 1-5-9 from Lagna)', modHouses: new Set([1, 5, 9]) },
    { name: 'Artha / Karma Axis (Houses 2-6-10)', modHouses: new Set([2, 6, 10]) },
    { name: 'Kama / Gains Axis (Houses 3-7-11)', modHouses: new Set([3, 7, 11]) },
    { name: 'Moksha / Inner Axis (Houses 4-8-12)', modHouses: new Set([4, 8, 12]) },
  ];
  return groups.map((g) => {
    const planets = kundli.planets.filter((p) => g.modHouses.has(p.house));
    return {
      groupName: g.name,
      linkedPlanets: planets.map((p) => `${p.id} (H${p.house} · ${p.nakshatraName})`),
      count: planets.length,
    };
  });
}

// #9: Bhrigu Bindu (Midpoint of Moon & Rahu)
export function calculateBhriguBindu(kundli: KundliResult) {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const rahu = kundli.planets.find((p) => p.id === 'Rahu')!;
  const diff = normalizeDeg(rahu.longitude - moon.longitude);
  const bbLon = normalizeDeg(moon.longitude + diff / 2);
  const signIdx = Math.floor(bbLon / 30);
  const nakIdx = Math.floor(bbLon / (360 / 27));
  const house = ((signIdx - kundli.lagnaSignIndex + 12) % 12) + 1;

  return {
    longitude: Number(bbLon.toFixed(4)),
    dms: formatDms(bbLon % 30),
    signName: ZODIAC_SIGNS[signIdx].name,
    nakshatra: NAKSHATRAS[nakIdx].name,
    houseFromLagna: house,
    note: `Jupiter or Saturn transiting ${ZODIAC_SIGNS[signIdx].name} (H${house}) triggers pivotal Bhrigu Bindu karmic milestones.`,
  };
}

// #10: Panchapakshi Shastra Calculator
const BIRDS = ['Vulture', 'Owl', 'Crow', 'Cock', 'Peacock'] as const;
const PACK_STATES = ['Ruling (Peak)', 'Eating (Strong)', 'Walking (Medium)', 'Sleeping (Low)', 'Dying (Avoid)'] as const;
export function calculatePanchapakshi(kundli: KundliResult, queryDateStr?: string) {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const sun = kundli.planets.find((p) => p.id === 'Sun')!;
  const isShukla = normalizeDeg(moon.longitude - sun.longitude) < 180;
  const birthBird = BIRDS[Math.floor((moon.nakshatraIndex * 5) / 27)];
  const birdIdx = BIRDS.indexOf(birthBird);

  const now = queryDateStr ? new Date(`${queryDateStr}T12:00:00Z`) : new Date();
  const weekday = now.getUTCDay();
  const yamaSlots = Array.from({ length: 5 }, (_, slot) => {
    const stateIdx = (birdIdx + weekday + slot + (isShukla ? 0 : 2)) % 5;
    const startHr = 6 + slot * 2.4;
    const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
    return {
      yama: `Yama ${slot + 1}`,
      window: `${fmt(startHr)}–${fmt(startHr + 2.4)}`,
      activity: PACK_STATES[stateIdx],
    };
  });

  return {
    birthBird,
    paksha: isShukla ? 'Shukla Paksha' : 'Krishna Paksha',
    yamaSlots,
  };
}

// #11–#15: Sensitive Points, Pushkara, Mrityu Bhaga, Gandanta, Badhaka, Devatas & Panchadha Maitri
const PUSHKARA_NAVS: Record<number, [number, number]> = {
  0: [6, 8], 1: [11, 1], 2: [5, 7], 3: [1, 3],
  4: [6, 8], 5: [11, 1], 6: [5, 7], 7: [1, 3],
  8: [6, 8], 9: [11, 1], 10: [5, 7], 11: [1, 3],
};
const MRITYU_DEGS: Record<PlanetId, number[]> = {
  Sun: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
  Moon: [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
  Mars: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
  Mercury: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
  Jupiter: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
  Venus: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
  Saturn: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
  Rahu: [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
  Ketu: [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
};

export function analyzeSensitiveAndCriticalDegrees(kundli: KundliResult) {
  const lagnaD9 = getDivisionalSign(kundli.ascendant.longitude, 9);
  const lagnaD3 = getDivisionalSign(kundli.ascendant.longitude, 3);
  const khara64D9SignIdx = (lagnaD9 + 7) % 12; // 8th from Lagna D9 = 64th Navamsha sign
  const khara22D3SignIdx = (lagnaD3 + 7) % 12; // 8th from Lagna D3 = 22nd Drekkana

  const items = kundli.planets.map((p) => {
    const d9Sign = getDivisionalSign(p.longitude, 9);
    const pushPair = PUSHKARA_NAVS[p.signIndex];
    const inPushkaraNavamsha = pushPair ? pushPair.includes(d9Sign) : false;

    const mrityuDeg = MRITYU_DEGS[p.id as PlanetId][p.signIndex];
    const nearMrityuBhaga = Math.abs(p.degreeInSign - mrityuDeg) <= 1.0;

    // Gandanta: last 3°20' of Cancer/Scorpio/Pisces OR first 3°20' of Leo/Sagittarius/Aries
    const isGandanta =
      ([3, 7, 11].includes(p.signIndex) && p.degreeInSign >= 26.6667) ||
      ([4, 8, 0].includes(p.signIndex) && p.degreeInSign <= 3.3333);

    return {
      planet: p.id,
      signName: p.signName,
      degreeInSign: Number(p.degreeInSign.toFixed(2)),
      inPushkaraNavamsha,
      mrityuDegreeTarget: mrityuDeg,
      nearMrityuBhaga,
      isGandanta,
    };
  });

  // Badhaka & Devatas
  const lagnaMod = ZODIAC_SIGNS[kundli.lagnaSignIndex].modality;
  const badhakaHouse = lagnaMod === 'Movable' ? 11 : lagnaMod === 'Fixed' ? 9 : 7;
  const badhakaSignIdx = (kundli.lagnaSignIndex + badhakaHouse - 1) % 12;
  const badhakaLord = ZODIAC_SIGNS[badhakaSignIdx].ruler;

  // Atmakaraka (highest degree among 7 planets) -> D9 12th = Ishta Devata
  const sorted7 = [...kundli.planets.slice(0, 7)].sort((a, b) => b.degreeInSign - a.degreeInSign);
  const ak = sorted7[0];
  const amk = sorted7[1];
  const akD9Sign = getDivisionalSign(ak.longitude, 9);
  const ishtaSignIdx = (akD9Sign + 11) % 12;
  const ishtaPlanet = ZODIAC_SIGNS[ishtaSignIdx].ruler;
  const palanaSignIdx = (getDivisionalSign(amk.longitude, 9) + 5) % 12;
  const palanaPlanet = ZODIAC_SIGNS[palanaSignIdx].ruler;

  const DEVATA_MAP: Record<PlanetId, string> = {
    Sun: 'Lord Surya / Shiva / Rama',
    Moon: 'Devi Gauri / Parvati / Krishna',
    Mars: 'Lord Hanuman / Kartikeya / Narasimha',
    Mercury: 'Lord Vishnu / Ganesha',
    Jupiter: 'Lord Dakshinamurthy / Brihaspati / Vishnu',
    Venus: 'Maa Lakshmi / Devi Tripurasundari',
    Saturn: 'Lord Shani / Hanuman / Bhairava',
    Rahu: 'Maa Durga / Saraswati',
    Ketu: 'Lord Ganesha / Matsya Avatara',
  };

  return {
    khara64D9Sign: ZODIAC_SIGNS[khara64D9SignIdx].name,
    khara64Lord: ZODIAC_SIGNS[khara64D9SignIdx].ruler,
    khara22D3Sign: ZODIAC_SIGNS[khara22D3SignIdx].name,
    khara22Lord: ZODIAC_SIGNS[khara22D3SignIdx].ruler,
    badhakaHouse,
    badhakaSign: ZODIAC_SIGNS[badhakaSignIdx].name,
    badhakaLord,
    atmakaraka: ak.id,
    ishtaDevata: `${DEVATA_MAP[ishtaPlanet]} (12th from AK in D9: ${ZODIAC_SIGNS[ishtaSignIdx].name})`,
    palanaDevata: `${DEVATA_MAP[palanaPlanet]} (6th from AmK in D9)`,
    planetChecks: items,
  };
}

// #17: Panchadha Maitri (5-fold Planetary Friendship Matrix)
export function calculatePanchadhaMaitri(kundli: KundliResult) {
  return PLANETS_7.map((p1) => {
    const pos1 = kundli.planets.find((p) => p.id === p1)!;
    const dig = PLANET_DIGNITY_SIGNS[p1];
    const relations: Record<string, string> = {};
    for (const p2 of PLANETS_7) {
      if (p1 === p2) {
        relations[p2] = 'Self';
        continue;
      }
      const pos2 = kundli.planets.find((p) => p.id === p2)!;
      const natural = dig.friends.includes(p2) ? 1 : dig.enemies.includes(p2) ? -1 : 0;
      const dist = ((pos2.signIndex - pos1.signIndex + 12) % 12) + 1;
      const temp = [2, 3, 4, 10, 11, 12].includes(dist) ? 1 : -1;
      const total = natural + temp;
      relations[p2] =
        total === 2 ? 'Adhi Mitra' :
        total === 1 ? 'Mitra' :
        total === 0 ? 'Sama' :
        total === -1 ? 'Shatru' : 'Adhi Shatru';
    }
    return { planet: p1, relations };
  });
}

// #19 & #20: KP Ruling Planets & 1–249 Number Horary Engine
export function calculateKpHorary249(horaryNumber: number, baseInput: BirthInput) {
  const num = Math.max(1, Math.min(249, Math.round(horaryNumber || 1)));
  // Compute exact 249 Sub-Lord cuspal longitude across 0..360
  const span = 360 / 249;
  const horaryLagnaLon = Number(((num - 0.5) * span).toFixed(4));
  const lagnaKp = getKpStarAndSubLord(horaryLagnaLon);
  const nowKundli = calculateKundli({
    ...baseInput,
    name: `KP Horary #${num}`,
  });
  const moonPos = nowKundli.planets.find((p) => p.id === 'Moon')!;
  const moonKp = getKpStarAndSubLord(moonPos.longitude);
  const weekdayLords: PlanetId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const [y, m, d] = nowKundli.input.date.split('-').map(Number);
  const dayLord = weekdayLords[new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay()];

  const rulingPlanets = Array.from(
    new Set<PlanetId>([dayLord, moonKp.rashiLord, moonKp.starLord, moonKp.subLord, lagnaKp.rashiLord, lagnaKp.starLord, lagnaKp.subLord])
  );

  const horaryLagnaSignIdx = Math.floor(horaryLagnaLon / 30);
  return {
    horaryNumber: num,
    horaryLagnaLon,
    horaryLagnaSign: ZODIAC_SIGNS[horaryLagnaSignIdx].name,
    horaryLagnaKp: lagnaKp,
    dayLord,
    moonKp,
    rulingPlanets,
    skyKundli: nowKundli,
  };
}

export { PLANETS_9 };
