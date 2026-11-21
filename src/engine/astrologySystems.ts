import { NAKSHATRAS, VIMSHOTTARI_ORDER, ZODIAC_SIGNS, type PlanetId } from './constants';
import { calculateKundli, normalizeDeg, type KundliResult, type PlanetPosition } from './ephemeris';

export interface TransitComparison {
  natalMoonSign: string;
  saturnCurrentSign: string;
  saturnHouseFromMoon: number;
  sadeSatiStatus: 'Not Active' | '1st Phase (Rising)' | '2nd Phase (Peak)' | '3rd Phase (Setting)';
  dhaiyaStatus: 'Not Active' | '4th House Dhaiya (Kantaka)' | '8th House Dhaiya (Ashtama)';
  jupiterHouseFromMoon: number;
  jupiterTransitNote: string;
  rahuHouseFromMoon: number;
  currentPlanets: PlanetPosition[];
}

export function getLivePlanetaryTransits(ayanamsha: 'lahiri' | 'raman' | 'kp' | 'tropical' = 'lahiri', date?: Date): KundliResult {
  const now = date || new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');

  return calculateKundli({
    name: 'Live Sky Ephemeris (New Delhi Reference)',
    date: `${y}-${m}-${d}`,
    time: `${hh}:${mm}:${ss}`,
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 0,
    timezoneName: 'UTC',
    placeName: 'UTC Reference Ephemeris',
    ayanamsha,
  });
}

export function analyzeSadeSatiAndGochar(natalMoonSignIndex: number, transitDate?: Date): TransitComparison {
  const sky = getLivePlanetaryTransits('lahiri', transitDate);
  const saturn = sky.planets.find((p) => p.id === 'Saturn')!;
  const jupiter = sky.planets.find((p) => p.id === 'Jupiter')!;
  const rahu = sky.planets.find((p) => p.id === 'Rahu')!;

  const saturnHouseFromMoon = ((saturn.signIndex - natalMoonSignIndex + 12) % 12) + 1;
  const jupiterHouseFromMoon = ((jupiter.signIndex - natalMoonSignIndex + 12) % 12) + 1;
  const rahuHouseFromMoon = ((rahu.signIndex - natalMoonSignIndex + 12) % 12) + 1;

  let sadeSatiStatus: TransitComparison['sadeSatiStatus'] = 'Not Active';
  if (saturnHouseFromMoon === 12) sadeSatiStatus = '1st Phase (Rising)';
  else if (saturnHouseFromMoon === 1) sadeSatiStatus = '2nd Phase (Peak)';
  else if (saturnHouseFromMoon === 2) sadeSatiStatus = '3rd Phase (Setting)';

  let dhaiyaStatus: TransitComparison['dhaiyaStatus'] = 'Not Active';
  if (saturnHouseFromMoon === 4) dhaiyaStatus = '4th House Dhaiya (Kantaka)';
  else if (saturnHouseFromMoon === 8) dhaiyaStatus = '8th House Dhaiya (Ashtama)';

  const favorableJupiter = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);
  const jupiterTransitNote = favorableJupiter
    ? `Jupiter transits House ${jupiterHouseFromMoon} from your Natal Moon — classically auspicious for expansion, support, and protection.`
    : `Jupiter transits House ${jupiterHouseFromMoon} from your Natal Moon — calls for steady budgeting, patience, and measured growth.`;

  return {
    natalMoonSign: ZODIAC_SIGNS[natalMoonSignIndex].name,
    saturnCurrentSign: saturn.signName,
    saturnHouseFromMoon,
    sadeSatiStatus,
    dhaiyaStatus,
    jupiterHouseFromMoon,
    jupiterTransitNote,
    rahuHouseFromMoon,
    currentPlanets: sky.planets,
  };
}

// KP Sub-Lord calculator (249 Vimshottari sub-divisions across 360 degrees)
export function getKpStarAndSubLord(siderealLongitude: number): {
  rashiLord: PlanetId;
  nakshatra: string;
  starLord: PlanetId;
  subLord: PlanetId;
} {
  const lon = normalizeDeg(siderealLongitude);
  const signIdx = Math.floor(lon / 30);
  const rashiLord = ZODIAC_SIGNS[signIdx].ruler;

  const nakSpan = 360 / 27; // 13.333333... deg
  const nakIdx = Math.floor(lon / nakSpan);
  const nak = NAKSHATRAS[nakIdx];
  const starLord = nak.lord;
  const posInNak = lon % nakSpan;

  const startIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === starLord);
  let acc = 0;
  let subLord: PlanetId = starLord;
  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_ORDER[(startIdx + i) % 9];
    const subSpan = (entry.years / 120) * nakSpan;
    if (posInNak <= acc + subSpan + 1e-9) {
      subLord = entry.lord;
      break;
    }
    acc += subSpan;
  }

  return {
    rashiLord,
    nakshatra: nak.name,
    starLord,
    subLord,
  };
}

// Chinese Zodiac Calculator (based on Gregorian year with Feb 4 Li Chun approx note)
const CHINESE_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];
const CHINESE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

export function getChineseZodiac(year: number): {
  animal: string;
  element: string;
  yinYang: 'Yang' | 'Yin';
  summary: string;
} {
  const animal = CHINESE_ANIMALS[((year - 4) % 12 + 12) % 12];
  const element = CHINESE_ELEMENTS[Math.floor((((year - 4) % 10 + 10) % 10) / 2)];
  const yinYang = year % 2 === 0 ? 'Yang' : 'Yin';
  return {
    animal,
    element,
    yinYang,
    summary: `${yinYang} ${element} ${animal} — calculated via the 60-year Sexagenary Stem-Branch cycle (note: births in Jan/early Feb before Lunar New Year / Li Chun may belong to the prior zodiac year).`,
  };
}

// Vastu Shastra directional guide
export interface VastuZoneAnalysis {
  direction: string;
  deity: string;
  element: string;
  bestUses: string[];
  avoid: string[];
}

export const VASTU_ZONES: VastuZoneAnalysis[] = [
  { direction: 'North-East (Ishanya)', deity: 'Ishwara / Shiva', element: 'Water', bestUses: ['Puja / Meditation Room', 'Entrance', 'Study', 'Water source'], avoid: ['Heavy storage', 'Kitchen stove', 'Toilets'] },
  { direction: 'East (Purva)', deity: 'Indra & Surya', element: 'Air / Light', bestUses: ['Main Entrance', 'Living Room', 'Windows', 'Morning study'], avoid: ['Clutter', 'Blocked windows'] },
  { direction: 'South-East (Agneya)', deity: 'Agni', element: 'Fire', bestUses: ['Kitchen', 'Electrical panel', 'Inverter / Heating'], avoid: ['Water tanks', 'Master bedroom'] },
  { direction: 'South (Dakshina)', deity: 'Yama', element: 'Earth', bestUses: ['Bedroom', 'Heavy wardrobes', 'Thick walls'], avoid: ['Underground water sump'] },
  { direction: 'South-West (Nairutya)', deity: 'Pitri / Nairuti', element: 'Earth', bestUses: ['Master Bedroom', 'Safe / Vault', 'Overhead water tank'], avoid: ['Main gate', 'Basement cut'] },
  { direction: 'West (Paschima)', deity: 'Varuna', element: 'Space / Water', bestUses: ['Dining Room', 'Children’s room', 'Staircase'], avoid: ['Excessive open glass glare'] },
  { direction: 'North-West (Vayavya)', deity: 'Vayu', element: 'Air', bestUses: ['Guest Bedroom', 'Finished goods storage', 'Garage'], avoid: ['Permanent stagnation'] },
  { direction: 'North (Uttara)', deity: 'Kubera', element: 'Water', bestUses: ['Home Office / Treasury', 'Living area', 'Open veranda'], avoid: ['Heavy junk', 'Kitchen fire'] },
];
