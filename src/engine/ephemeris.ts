import * as Astronomy from 'astronomy-engine';
import {
  NAKSHATRAS,
  PLANET_DIGNITY_SIGNS,
  VIMSHOTTARI_ORDER,
  ZODIAC_SIGNS,
  type PlanetId,
} from './constants';

export type AyanamshaMode = 'lahiri' | 'raman' | 'kp' | 'tropical';

export interface BirthInput {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM or HH:MM:SS
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number; // e.g., 330 for IST (+05:30)
  timezoneName?: string;
  placeName?: string;
  ayanamsha?: AyanamshaMode;
  unknownBirthTime?: boolean;
}

export interface PlanetPosition {
  id: PlanetId | 'Ascendant';
  longitude: number; // 0..360 sidereal (or tropical if mode='tropical')
  tropicalLongitude: number;
  latitude: number;
  speedDegPerDay: number;
  signIndex: number; // 0..11
  signName: string;
  sanskritSign: string;
  hindiSign: string;
  degreeInSign: number;
  dms: string; // e.g. 14°22'18"
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraLord: PlanetId;
  pada: number; // 1..4
  house: number; // 1..12 Whole Sign from Lagna
  moonHouse: number; // 1..12 from Moon
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy' | 'Lagna';
  strengthScore: number; // 0..100 Shadbala-inspired deterministic score
  aspectsHouses: number[];
}

export interface DivisionalPlacement {
  id: PlanetId | 'Ascendant';
  signIndex: number;
  signName: string;
  house: number;
}

export interface DivisionalChart {
  code: string; // D1..D60
  name: string;
  sanskritName: string;
  purpose: string;
  ascendantSignIndex: number;
  placements: DivisionalPlacement[];
}

export interface DashaNode {
  lord: PlanetId;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;
  durationYears: number;
  level: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha';
  children?: DashaNode[];
}

export interface KundliResult {
  input: BirthInput;
  utcIso: string;
  julianDay: number;
  ayanamshaMode: AyanamshaMode;
  ayanamshaDegrees: number;
  ayanamshaDms: string;
  localSiderealTimeHours: number;
  ascendant: PlanetPosition;
  planets: PlanetPosition[];
  moonSignIndex: number;
  sunSignIndex: number;
  lagnaSignIndex: number;
  divisionalCharts: DivisionalChart[];
  dashas: DashaNode[];
  currentMahadasha: DashaNode | null;
  currentAntardasha: DashaNode | null;
  currentPratyantardasha: DashaNode | null;
  assumptions: {
    ephemerisSource: string;
    ayanamshaSetting: string;
    zodiacSystem: string;
    houseSystem: string;
    nodeType: string;
    timezoneHandling: string;
    limitations: string[];
  };
}

export function normalizeDeg(deg: number): number {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

export function formatDms(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  if (s === 60) {
    return `${d}°${String(m + 1).padStart(2, '0')}'00"`;
  }
  return `${d}°${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`;
}

export function localDateTimeToUtc(
  dateStr: string,
  timeStr: string,
  timezoneOffsetMinutes: number
): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const timeParts = (timeStr || '12:00:00').split(':').map(Number);
  const hh = timeParts[0] || 0;
  const mm = timeParts[1] || 0;
  const ss = timeParts[2] || 0;
  const utcMs = Date.UTC(y, (m || 1) - 1, d || 1, hh, mm, ss) - timezoneOffsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

export function dateToJulianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getAyanamshaDegrees(jd: number, mode: AyanamshaMode): number {
  if (mode === 'tropical') return 0;
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0
  // IAU precession in longitude ~ 5028.796195" * T + 1.1054348" * T^2
  const deltaArcsec = 5028.796195 * T + 1.1054348 * T * T;
  const lahiriJ2000 = 23 + 51 / 60 + 25.5324 / 3600; // 23.85709233 deg (Chitrapaksha)
  if (mode === 'raman') {
    const ramanJ2000 = 22 + 25 / 60 + 33.6 / 3600;
    return ramanJ2000 + deltaArcsec / 3600;
  }
  if (mode === 'kp') {
    const kpJ2000 = 23 + 50 / 60 + 56.4 / 3600;
    return kpJ2000 + deltaArcsec / 3600;
  }
  return lahiriJ2000 + deltaArcsec / 3600;
}

function getMeanRahuLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Meeus Eq. 47.7 Mean Ascending Node of the Moon
  const omega =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441.0 -
    (T * T * T * T) / 60616000.0;
  return normalizeDeg(omega);
}

function getTropicalPlanetEcliptic(
  body: PlanetId,
  astroTime: Astronomy.AstroTime,
  jd: number
): { elon: number; elat: number } {
  if (body === 'Sun') {
    const sun = Astronomy.SunPosition(astroTime);
    return { elon: normalizeDeg(sun.elon), elat: sun.elat };
  }
  if (body === 'Moon') {
    const moon = Astronomy.EclipticGeoMoon(astroTime);
    return { elon: normalizeDeg(moon.lon), elat: moon.lat };
  }
  if (body === 'Rahu') {
    return { elon: getMeanRahuLongitude(jd), elat: 0 };
  }
  if (body === 'Ketu') {
    return { elon: normalizeDeg(getMeanRahuLongitude(jd) + 180), elat: 0 };
  }
  const bodyMap: Record<string, Astronomy.Body> = {
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
  };
  const geoVec = Astronomy.GeoVector(bodyMap[body], astroTime, true);
  const ecl = Astronomy.Ecliptic(geoVec);
  return { elon: normalizeDeg(ecl.elon), elat: ecl.elat };
}

function computeAscendantTropical(
  utcDate: Date,
  latitudeDeg: number,
  longitudeDeg: number,
  jd: number
): { tropicalAsc: number; lstHours: number } {
  const astroTime = Astronomy.MakeTime(utcDate);
  const gastHours = Astronomy.SiderealTime(astroTime);
  const lstHours = ((gastHours + longitudeDeg / 15) % 24 + 24) % 24;
  const ramcRad = (lstHours * 15 * Math.PI) / 180;
  const T = (jd - 2451545.0) / 36525.0;
  const epsDeg = 23.4392911 - 0.0130042 * T;
  const epsRad = (epsDeg * Math.PI) / 180;
  // Clamp latitude slightly below poles to avoid tan(90) singularity
  const safeLat = Math.max(-89.5, Math.min(89.5, latitudeDeg));
  const latRad = (safeLat * Math.PI) / 180;

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
  const ascDeg = normalizeDeg((Math.atan2(y, x) * 180) / Math.PI);
  return { tropicalAsc: ascDeg, lstHours };
}

function angularDiff(a: number, b: number): number {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return d > 180 ? 360 - d : d;
}

function isPlanetCombust(
  id: PlanetId,
  lon: number,
  sunLon: number,
  isRetrograde: boolean
): boolean {
  if (id === 'Sun' || id === 'Rahu' || id === 'Ketu') return false;
  const diff = angularDiff(lon, sunLon);
  const orbMap: Record<string, number> = {
    Moon: 12,
    Mars: 17,
    Mercury: isRetrograde ? 12 : 14,
    Jupiter: 11,
    Venus: isRetrograde ? 8 : 10,
    Saturn: 15,
  };
  return diff <= (orbMap[id] ?? 0);
}

function computeDignity(
  id: PlanetId,
  signIndex: number
): 'Exalted' | 'Debilitated' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy' {
  const rules = PLANET_DIGNITY_SIGNS[id];
  if (signIndex === rules.exalted) return 'Exalted';
  if (signIndex === rules.debilitated) return 'Debilitated';
  if (rules.own.includes(signIndex)) return 'Own Sign';
  const signRuler = ZODIAC_SIGNS[signIndex].ruler;
  if (rules.friends.includes(signRuler)) return 'Friendly';
  if (rules.enemies.includes(signRuler)) return 'Enemy';
  return 'Neutral';
}

function computeAspects(id: PlanetId | 'Ascendant', house: number): number[] {
  if (id === 'Ascendant') return [];
  const h = (offset: number) => ((house - 1 + offset) % 12) + 1;
  const aspects = [h(6)]; // 7th aspect for all planets
  if (id === 'Mars') aspects.push(h(3), h(7)); // 4th & 8th
  if (id === 'Jupiter' || id === 'Rahu' || id === 'Ketu') aspects.push(h(4), h(8)); // 5th & 9th
  if (id === 'Saturn') aspects.push(h(2), h(9)); // 3rd & 10th
  return Array.from(new Set(aspects)).sort((a, b) => a - b);
}

// Parashari Divisional Chart sign calculation (0..11)
export function getDivisionalSign(longitude: number, division: number): number {
  const lon = normalizeDeg(longitude);
  const sign = Math.floor(lon / 30);
  const deg = lon % 30;
  const isOddSign = sign % 2 === 0; // Aries(0) is 1st sign (odd)

  switch (division) {
    case 1:
      return sign;
    case 2: {
      // Hora: Odd sign 0-15 Sun(Leo=4), 15-30 Moon(Cancer=3); Even sign 0-15 Moon(3), 15-30 Sun(4)
      const firstHalf = deg < 15;
      if (isOddSign) return firstHalf ? 4 : 3;
      return firstHalf ? 3 : 4;
    }
    case 3: {
      // Drekkana: 0-10 same, 10-20 5th, 20-30 9th
      const part = Math.floor(deg / 10);
      return (sign + part * 4) % 12;
    }
    case 4: {
      // Chaturthamsha: 0-7.5 same, 7.5-15 4th, 15-22.5 7th, 22.5-30 10th
      const part = Math.floor(deg / 7.5);
      return (sign + part * 3) % 12;
    }
    case 7: {
      // Saptamsha: Odd starts same sign, Even starts 7th sign
      const part = Math.floor(deg / (30 / 7));
      const start = isOddSign ? sign : (sign + 6) % 12;
      return (start + part) % 12;
    }
    case 9: {
      // Navamsa: Continuous 9 padas per sign starting from Aries(0), Cap(9), Lib(6), Can(3)
      const navIndex = Math.floor(lon / (30 / 9));
      return navIndex % 12;
    }
    case 10: {
      // Dashamsha: Odd starts same sign, Even starts 9th sign
      const part = Math.floor(deg / 3);
      const start = isOddSign ? sign : (sign + 8) % 12;
      return (start + part) % 12;
    }
    case 12: {
      // Dwadashamsha: Starts from same sign
      const part = Math.floor(deg / 2.5);
      return (sign + part) % 12;
    }
    case 16: {
      // Shodashamsha: Movable->Aries(0), Fixed->Leo(4), Dual->Sagittarius(8)
      const part = Math.floor(deg / (30 / 16));
      const start = [0, 4, 8][sign % 3];
      return (start + part) % 12;
    }
    case 20: {
      // Vimshamsha: Movable->Aries(0), Fixed->Sagittarius(8), Dual->Leo(4)
      const part = Math.floor(deg / 1.5);
      const start = [0, 8, 4][sign % 3];
      return (start + part) % 12;
    }
    case 24: {
      // Chaturvimshamsha: Odd->Leo(4), Even->Cancer(3)
      const part = Math.floor(deg / 1.25);
      const start = isOddSign ? 4 : 3;
      return (start + part) % 12;
    }
    case 27: {
      // Saptavimshamsha (Nakshatramsha): Fire->0, Earth->3, Air->6, Water->9
      const part = Math.floor(deg / (30 / 27));
      const start = [0, 3, 6, 9][sign % 4];
      return (start + part) % 12;
    }
    case 30: {
      // Trimshamsha (Parashara unequal parts)
      if (isOddSign) {
        if (deg < 5) return 0; // Aries (Mars)
        if (deg < 10) return 10; // Aquarius (Saturn)
        if (deg < 18) return 8; // Sagittarius (Jupiter)
        if (deg < 25) return 2; // Gemini (Mercury)
        return 6; // Libra (Venus)
      }
      if (deg < 5) return 1; // Taurus (Venus)
      if (deg < 12) return 5; // Virgo (Mercury)
      if (deg < 20) return 11; // Pisces (Jupiter)
      if (deg < 25) return 9; // Capricorn (Saturn)
      return 7; // Scorpio (Mars)
    }
    case 40: {
      // Khavedamsha: Odd->Aries(0), Even->Libra(6)
      const part = Math.floor(deg / (30 / 40));
      const start = isOddSign ? 0 : 6;
      return (start + part) % 12;
    }
    case 45: {
      // Akshavedamsha: Movable->Aries(0), Fixed->Leo(4), Dual->Sagittarius(8)
      const part = Math.floor(deg / (30 / 45));
      const start = [0, 4, 8][sign % 3];
      return (start + part) % 12;
    }
    case 60: {
      // Shashtiamsha: Starts from same sign
      const part = Math.floor(deg / 0.5);
      return (sign + part) % 12;
    }
    default:
      return sign;
  }
}

const DIVISIONAL_META: { d: number; code: string; name: string; sanskrit: string; purpose: string }[] = [
  { d: 1, code: 'D1', name: 'Rashi (Birth Chart)', sanskrit: 'राशि चक्र', purpose: 'Overall life, body, personality & physical destiny' },
  { d: 2, code: 'D2', name: 'Hora Chart', sanskrit: 'होरा', purpose: 'Wealth, financial accumulation & resources' },
  { d: 3, code: 'D3', name: 'Drekkana', sanskrit: 'द्रेष्काण', purpose: 'Siblings, courage, initiative & short journeys' },
  { d: 4, code: 'D4', name: 'Chaturthamsha', sanskrit: 'चतुर्थांश', purpose: 'Property, real estate, home & fixed assets' },
  { d: 7, code: 'D7', name: 'Saptamsha', sanskrit: 'सप्तांश', purpose: 'Children, progeny & creative legacy' },
  { d: 9, code: 'D9', name: 'Navamsa', sanskrit: 'नवांश', purpose: 'Marriage, dharma, inner strength & spouse' },
  { d: 10, code: 'D10', name: 'Dashamsha', sanskrit: 'दशांश', purpose: 'Career, profession, status & public achievements' },
  { d: 12, code: 'D12', name: 'Dwadashamsha', sanskrit: 'द्वादशांश', purpose: 'Parents, lineage & ancestral roots' },
  { d: 16, code: 'D16', name: 'Shodashamsha', sanskrit: 'षोडशांश', purpose: 'Vehicles, comforts, conveyances & luxuries' },
  { d: 20, code: 'D20', name: 'Vimshamsha', sanskrit: 'विंशांश', purpose: 'Spiritual worship, sadhana & devotion' },
  { d: 24, code: 'D24', name: 'Chaturvimshamsha', sanskrit: 'चतुर्विंशांश', purpose: 'Education, scholarship & formal learning' },
  { d: 27, code: 'D27', name: 'Saptavimshamsha', sanskrit: 'सप्तविंशांश', purpose: 'Physical vitality, stamina & constitutional strength' },
  { d: 30, code: 'D30', name: 'Trimshamsha', sanskrit: 'त्रिंशांश', purpose: 'Misfortunes, vulnerabilities & karmic tests' },
  { d: 40, code: 'D40', name: 'Khavedamsha', sanskrit: 'खवेदांश', purpose: 'Auspicious & inauspicious maternal tendencies' },
  { d: 45, code: 'D45', name: 'Akshavedamsha', sanskrit: 'अक्षवेदांश', purpose: 'General character, ethical merit & paternal legacy' },
  { d: 60, code: 'D60', name: 'Shashtiamsha', sanskrit: 'षष्ट्यांश', purpose: 'Subtle past-life karma & fine planetary nuances' },
];

function addYearsExact(date: Date, years: number): Date {
  // Vedic standard Savana/Solar year 365.2425 days for Vimshottari calendar dates
  const ms = years * 365.2425 * 86400 * 1000;
  return new Date(date.getTime() + ms);
}

function formatDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function computeVimshottariDasha(moonSiderealLon: number, birthDate: Date): DashaNode[] {
  const nakSpan = 360 / 27; // 13.333333... deg
  const nakIdx = Math.floor(normalizeDeg(moonSiderealLon) / nakSpan);
  const posInNak = normalizeDeg(moonSiderealLon) % nakSpan;
  const elapsedFraction = posInNak / nakSpan;
  const remainingFraction = 1 - elapsedFraction;

  const startLord = NAKSHATRAS[nakIdx].lord;
  const startOrderIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === startLord);

  const mahadashas: DashaNode[] = [];
  let cursor = new Date(birthDate.getTime());

  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_ORDER[(startOrderIdx + i) % 9];
    const mahaYears = i === 0 ? entry.years * remainingFraction : entry.years;
    const mahaStart = new Date(cursor.getTime());
    const mahaEnd = addYearsExact(mahaStart, mahaYears);

    // Build Antardashas
    const antardashas: DashaNode[] = [];
    let antCursor =
      i === 0
        ? addYearsExact(mahaStart, -entry.years * elapsedFraction)
        : new Date(mahaStart.getTime());

    const mahaEntryIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === entry.lord);
    for (let j = 0; j < 9; j++) {
      const antEntry = VIMSHOTTARI_ORDER[(mahaEntryIdx + j) % 9];
      const antYears = (entry.years * antEntry.years) / 120;
      const antStart = new Date(antCursor.getTime());
      const antEnd = addYearsExact(antStart, antYears);

      if (antEnd.getTime() > mahaStart.getTime()) {
        const clippedStart = antStart.getTime() < mahaStart.getTime() ? mahaStart : antStart;
        // Build Pratyantardashas
        const pratyantars: DashaNode[] = [];
        let pratCursor = new Date(antStart.getTime());
        const antIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === antEntry.lord);
        for (let k = 0; k < 9; k++) {
          const pEntry = VIMSHOTTARI_ORDER[(antIdx + k) % 9];
          const pYears = (antYears * pEntry.years) / 120;
          const pStart = new Date(pratCursor.getTime());
          const pEnd = addYearsExact(pStart, pYears);
          if (pEnd.getTime() > clippedStart.getTime()) {
            const pClippedStart = pStart.getTime() < clippedStart.getTime() ? clippedStart : pStart;
            pratyantars.push({
              lord: pEntry.lord,
              startDate: formatDateIso(pClippedStart),
              endDate: formatDateIso(pEnd),
              durationYears: Number(pYears.toFixed(3)),
              level: 'Pratyantardasha',
            });
          }
          pratCursor = pEnd;
        }

        antardashas.push({
          lord: antEntry.lord,
          startDate: formatDateIso(clippedStart),
          endDate: formatDateIso(antEnd),
          durationYears: Number(antYears.toFixed(2)),
          level: 'Antardasha',
          children: pratyantars,
        });
      }
      antCursor = antEnd;
    }

    mahadashas.push({
      lord: entry.lord,
      startDate: formatDateIso(mahaStart),
      endDate: formatDateIso(mahaEnd),
      durationYears: Number(mahaYears.toFixed(2)),
      level: 'Mahadasha',
      children: antardashas,
    });
    cursor = mahaEnd;
  }

  return mahadashas;
}

export function calculateKundli(input: BirthInput): KundliResult {
  const ayanamshaMode: AyanamshaMode = input.ayanamsha || 'lahiri';
  const effectiveTime = input.unknownBirthTime ? '12:00:00' : input.time || '12:00:00';
  const utcDate = localDateTimeToUtc(input.date, effectiveTime, input.timezoneOffsetMinutes);
  const jd = dateToJulianDay(utcDate);
  const astroTime = Astronomy.MakeTime(utcDate);

  // 1-day delta for velocity / retrograde check
  const nextUtc = new Date(utcDate.getTime() + 86400000);
  const nextAstroTime = Astronomy.MakeTime(nextUtc);
  const nextJd = jd + 1;

  const ayanamshaDeg = getAyanamshaDegrees(jd, ayanamshaMode);
  const { tropicalAsc, lstHours } = computeAscendantTropical(
    utcDate,
    input.latitude,
    input.longitude,
    jd
  );
  const siderealAsc = normalizeDeg(tropicalAsc - ayanamshaDeg);
  const lagnaSignIndex = Math.floor(siderealAsc / 30);

  const buildPosition = (
    id: PlanetId | 'Ascendant',
    sidLon: number,
    tropLon: number,
    lat: number,
    speed: number,
    sunSidLon: number,
    moonSignIdx: number
  ): PlanetPosition => {
    const lon = normalizeDeg(sidLon);
    const signIndex = Math.floor(lon / 30);
    const degInSign = lon % 30;
    const nakSpan = 360 / 27;
    const nakIdx = Math.floor(lon / nakSpan);
    const pada = Math.floor((lon % nakSpan) / (nakSpan / 4)) + 1;
    const house = ((signIndex - lagnaSignIndex + 12) % 12) + 1;
    const moonHouse = ((signIndex - moonSignIdx + 12) % 12) + 1;
    const isRetrograde = id === 'Rahu' || id === 'Ketu' ? true : id !== 'Ascendant' && id !== 'Sun' && id !== 'Moon' && speed < 0;
    const isCombust = id === 'Ascendant' ? false : isPlanetCombust(id, lon, sunSidLon, isRetrograde);
    const dignity = id === 'Ascendant' ? 'Lagna' : computeDignity(id, signIndex);

    let strengthScore = 55;
    if (dignity === 'Exalted') strengthScore = 92;
    else if (dignity === 'Own Sign') strengthScore = 84;
    else if (dignity === 'Friendly') strengthScore = 70;
    else if (dignity === 'Neutral') strengthScore = 56;
    else if (dignity === 'Enemy') strengthScore = 38;
    else if (dignity === 'Debilitated') strengthScore = 24;
    if ([1, 4, 7, 10].includes(house)) strengthScore = Math.min(98, strengthScore + 8);
    if (isCombust) strengthScore = Math.max(15, strengthScore - 15);
    if (isRetrograde && id !== 'Rahu' && id !== 'Ketu') strengthScore = Math.min(96, strengthScore + 6);

    return {
      id,
      longitude: lon,
      tropicalLongitude: normalizeDeg(tropLon),
      latitude: Number(lat.toFixed(4)),
      speedDegPerDay: Number(speed.toFixed(4)),
      signIndex,
      signName: ZODIAC_SIGNS[signIndex].name,
      sanskritSign: ZODIAC_SIGNS[signIndex].sanskritName,
      hindiSign: ZODIAC_SIGNS[signIndex].hindiName,
      degreeInSign: degInSign,
      dms: formatDms(degInSign),
      nakshatraIndex: nakIdx,
      nakshatraName: NAKSHATRAS[nakIdx].name,
      nakshatraLord: NAKSHATRAS[nakIdx].lord,
      pada,
      house,
      moonHouse,
      isRetrograde,
      isCombust,
      dignity,
      strengthScore,
      aspectsHouses: computeAspects(id, house),
    };
  };

  const planetIds: PlanetId[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
    'Rahu',
    'Ketu',
  ];

  const rawPlanets = planetIds.map((id) => {
    const cur = getTropicalPlanetEcliptic(id, astroTime, jd);
    const nxt = getTropicalPlanetEcliptic(id, nextAstroTime, nextJd);
    let diff = nxt.elon - cur.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const sidLon = normalizeDeg(cur.elon - ayanamshaDeg);
    return { id, sidLon, tropLon: cur.elon, lat: cur.elat, speed: diff };
  });

  const sunSidLon = rawPlanets[0].sidLon;
  const moonSignIndex = Math.floor(rawPlanets[1].sidLon / 30);
  const sunSignIndex = Math.floor(sunSidLon / 30);

  const ascendant = buildPosition(
    'Ascendant',
    siderealAsc,
    tropicalAsc,
    0,
    360,
    sunSidLon,
    moonSignIndex
  );

  const planets = rawPlanets.map((p) =>
    buildPosition(p.id, p.sidLon, p.tropLon, p.lat, p.speed, sunSidLon, moonSignIndex)
  );

  // Build 16 Divisional Charts
  const divisionalCharts: DivisionalChart[] = DIVISIONAL_META.map((meta) => {
    const ascSign = getDivisionalSign(siderealAsc, meta.d);
    const placements: DivisionalPlacement[] = [
      {
        id: 'Ascendant',
        signIndex: ascSign,
        signName: ZODIAC_SIGNS[ascSign].name,
        house: 1,
      },
      ...planets.map((p) => {
        const s = getDivisionalSign(p.longitude, meta.d);
        return {
          id: p.id,
          signIndex: s,
          signName: ZODIAC_SIGNS[s].name,
          house: ((s - ascSign + 12) % 12) + 1,
        };
      }),
    ];
    return {
      code: meta.code,
      name: meta.name,
      sanskritName: meta.sanskrit,
      purpose: meta.purpose,
      ascendantSignIndex: ascSign,
      placements,
    };
  });

  // Vimshottari Dasha
  const dashas = computeVimshottariDasha(rawPlanets[1].sidLon, utcDate);
  const todayIso = new Date().toISOString().slice(0, 10);
  const currentMahadasha =
    dashas.find((m) => todayIso >= m.startDate && todayIso <= m.endDate) || dashas[0] || null;
  const currentAntardasha =
    currentMahadasha?.children?.find((a) => todayIso >= a.startDate && todayIso <= a.endDate) ||
    currentMahadasha?.children?.[0] ||
    null;
  const currentPratyantardasha =
    currentAntardasha?.children?.find((p) => todayIso >= p.startDate && todayIso <= p.endDate) ||
    currentAntardasha?.children?.[0] ||
    null;

  return {
    input,
    utcIso: utcDate.toISOString(),
    julianDay: Number(jd.toFixed(6)),
    ayanamshaMode,
    ayanamshaDegrees: Number(ayanamshaDeg.toFixed(6)),
    ayanamshaDms: formatDms(ayanamshaDeg),
    localSiderealTimeHours: Number(lstHours.toFixed(4)),
    ascendant,
    planets,
    moonSignIndex,
    sunSignIndex,
    lagnaSignIndex,
    divisionalCharts,
    dashas,
    currentMahadasha,
    currentAntardasha,
    currentPratyantardasha,
    assumptions: {
      ephemerisSource: 'Astronomy Engine (MIT License — NASA/JPL VSOP87 & ELP2000-82B analytical series)',
      ayanamshaSetting:
        ayanamshaMode === 'lahiri'
          ? `Lahiri Chitrapaksha (${formatDms(ayanamshaDeg)})`
          : ayanamshaMode === 'kp'
          ? `Krishnamurti Padhdhati (${formatDms(ayanamshaDeg)})`
          : ayanamshaMode === 'raman'
          ? `B.V. Raman (${formatDms(ayanamshaDeg)})`
          : 'Tropical Western (0°00\'00")',
      zodiacSystem: ayanamshaMode === 'tropical' ? 'Tropical Sayana' : 'Vedic Sidereal Nirayana',
      houseSystem: 'Whole Sign (Rashi Bhava — standard Parashari Lagna chart)',
      nodeType: 'Mean Lunar Nodes (Meeus Eq. 47.7 Rahu/Ketu)',
      timezoneHandling: `Explicit UTC offset ${input.timezoneOffsetMinutes >= 0 ? '+' : ''}${(input.timezoneOffsetMinutes / 60).toFixed(2)}h (${input.timezoneName || 'Custom'})`,
      limitations: [
        input.unknownBirthTime
          ? 'Unknown birth time selected: 12:00 PM noon local time used as reference; Lagna and Bhava houses are approximate.'
          : 'Lagna sensitivity is ~1° every 4 minutes; exact birth minute improves D9/D60 precision.',
        'Mean Lunar Nodes are used by default instead of True Nodes (differs by up to ~1.7°).',
      ],
    },
  };
}
