import * as Astronomy from 'astronomy-engine';
import {
  VIMSHOTTARI_ORDER,
  ZODIAC_SIGNS,
  type PlanetId,
} from './constants';
import {
  calculateKundli,
  getAyanamshaDegrees,
  localDateTimeToUtc,
  normalizeDeg,
  type AyanamshaMode,
  type BirthInput,
  type KundliResult,
} from './ephemeris';
import { calculatePanchang } from './panchang';
import type { CalendarEventItem } from './lifeAndMuhurat';

export type PrashnaCategory =
  | 'career'
  | 'marriage'
  | 'wealth'
  | 'health'
  | 'travel'
  | 'education'
  | 'legal'
  | 'general';

export interface PrashnaCategoryMeta {
  id: PrashnaCategory;
  label: string;
  hindiLabel: string;
  houseNumber: number;
  houseMeaning: string;
}

export const PRASHNA_CATEGORIES: PrashnaCategoryMeta[] = [
  { id: 'general', label: 'General & Overall Success', hindiLabel: 'सामान्य एवं समग्र सफलता', houseNumber: 1, houseMeaning: '1st House (Self / Lagna)' },
  { id: 'career', label: 'Career, Job & Promotion', hindiLabel: 'करियर, नौकरी एवं पदोन्नति', houseNumber: 10, houseMeaning: '10th House (Karma Bhava)' },
  { id: 'marriage', label: 'Marriage & Partnership', hindiLabel: 'विवाह एवं जीवनसाथी', houseNumber: 7, houseMeaning: '7th House (Kalatra Bhava)' },
  { id: 'wealth', label: 'Wealth, Business & Gains', hindiLabel: 'धन, व्यापार एवं लाभ', houseNumber: 11, houseMeaning: '11th House (Labha Bhava)' },
  { id: 'health', label: 'Health & Recovery', hindiLabel: 'स्वास्थ्य एवं रोग निवारण', houseNumber: 6, houseMeaning: '6th House (Roga / Recovery)' },
  { id: 'education', label: 'Education & Exams', hindiLabel: 'शिक्षा एवं परीक्षा', houseNumber: 5, houseMeaning: '5th House (Vidya / Buddhi)' },
  { id: 'travel', label: 'Foreign Travel & Relocation', hindiLabel: 'विदेश यात्रा एवं स्थानांतरण', houseNumber: 9, houseMeaning: '9th House (Dharma / Long Journeys)' },
  { id: 'legal', label: 'Disputes, Litigation & Competition', hindiLabel: 'वाद-विवाद एवं न्याय', houseNumber: 6, houseMeaning: '6th House (Shatru / Litigation)' },
];

export interface PrashnaResult {
  kundli: KundliResult;
  questionCategory: PrashnaCategoryMeta;
  lagnaLord: PlanetId;
  karyesha: PlanetId;
  karyeshaHouse: number;
  karyeshaDignity: string;
  horaLord: PlanetId;
  moonHouse: number;
  moonPaksha: 'Shukla Paksha' | 'Krishna Paksha';
  tajikaYoga: 'Ithasala (Applying Favorable)' | 'Muthashila (Tight Applying)' | 'Easarapha (Separating)' | 'Kamboola (Strong Support)' | 'Neutral Aspect';
  aspectOrbDeg: number;
  favorableScore: number; // 0..100
  verdictLabel: 'Highly Favorable' | 'Favorable With Effort' | 'Mixed / Delayed' | 'Unfavorable Timing';
  classicalFactors: string[];
}

const CHALDEAN_HORA_SEQ: PlanetId[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
const WEEKDAY_LORD: PlanetId[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function signedShortestDelta(fromDeg: number, toDeg: number): number {
  let d = normalizeDeg(toDeg) - normalizeDeg(fromDeg);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export function calculatePrashnaKundli(params: {
  questionCategory: PrashnaCategory;
  date?: string;
  time?: string;
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number;
  placeName: string;
  ayanamsha?: AyanamshaMode;
}): PrashnaResult {
  const now = new Date();
  const istNow = new Date(now.getTime() + params.timezoneOffsetMinutes * 60000);
  const dateStr = params.date || istNow.toISOString().slice(0, 10);
  const timeStr = params.time || istNow.toISOString().slice(11, 19);

  const kundli = calculateKundli({
    name: 'Prashna Horary Chart',
    date: dateStr,
    time: timeStr,
    latitude: params.latitude,
    longitude: params.longitude,
    timezoneOffsetMinutes: params.timezoneOffsetMinutes,
    placeName: params.placeName,
    ayanamsha: params.ayanamsha || 'lahiri',
  });

  const catMeta = PRASHNA_CATEGORIES.find((c) => c.id === params.questionCategory) || PRASHNA_CATEGORIES[0];
  const lagnaSign = kundli.lagnaSignIndex;
  const lagnaLord = ZODIAC_SIGNS[lagnaSign].ruler;

  const targetSign = (lagnaSign + catMeta.houseNumber - 1) % 12;
  const karyesha = ZODIAC_SIGNS[targetSign].ruler;

  const lagnaLordPos = kundli.planets.find((p) => p.id === lagnaLord)!;
  const karyeshaPos = kundli.planets.find((p) => p.id === karyesha)!;
  const moonPos = kundli.planets.find((p) => p.id === 'Moon')!;
  const sunPos = kundli.planets.find((p) => p.id === 'Sun')!;

  // Compute Hora Lord using weekday and hours elapsed from 06:00 local sunrise approx refined via panchang
  const panchang = calculatePanchang(dateStr, params.latitude, params.longitude, params.timezoneOffsetMinutes, params.placeName);
  const [srH, srM] = panchang.sunrise.split(':').map(Number);
  const [qH, qM] = timeStr.split(':').map(Number);
  const sunriseMins = (srH || 6) * 60 + (srM || 0);
  let queryMins = (qH || 12) * 60 + (qM || 0);
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  let weekdayIdx = new Date(Date.UTC(yr, (mo || 1) - 1, dy || 1)).getUTCDay();
  if (queryMins < sunriseMins) {
    queryMins += 1440;
    weekdayIdx = (weekdayIdx + 6) % 7;
  }
  const hoursElapsed = Math.floor((queryMins - sunriseMins) / 60);
  const startLord = WEEKDAY_LORD[weekdayIdx];
  const startSeqIdx = CHALDEAN_HORA_SEQ.indexOf(startLord);
  const horaLord = CHALDEAN_HORA_SEQ[(startSeqIdx + Math.max(0, hoursElapsed)) % 7];

  // Moon Paksha
  const moonSunSep = normalizeDeg(moonPos.longitude - sunPos.longitude);
  const moonPaksha: 'Shukla Paksha' | 'Krishna Paksha' = moonSunSep < 180 ? 'Shukla Paksha' : 'Krishna Paksha';

  // Tajika Aspect between Lagna Lord and Karyesha (Ithasala vs Easarapha)
  // Using degrees in sign for classical Tajika Deeptamsha orb check (within ~12°)
  const fastPlanet = Math.abs(lagnaLordPos.speedDegPerDay) >= Math.abs(karyeshaPos.speedDegPerDay) ? lagnaLordPos : karyeshaPos;
  const slowPlanet = fastPlanet.id === lagnaLordPos.id ? karyeshaPos : lagnaLordPos;
  const degDiffInSign = slowPlanet.degreeInSign - fastPlanet.degreeInSign;
  const houseDist = ((karyeshaPos.signIndex - lagnaLordPos.signIndex + 12) % 12) + 1;
  const aspectOrbDeg = Number(Math.abs(degDiffInSign).toFixed(2));

  let tajikaYoga: PrashnaResult['tajikaYoga'] = 'Neutral Aspect';
  const supportiveHouseDist = [1, 3, 5, 7, 9, 11].includes(houseDist);
  if (lagnaLord === karyesha) {
    tajikaYoga = 'Kamboola (Strong Support)';
  } else if (supportiveHouseDist && degDiffInSign > 0 && degDiffInSign <= 12) {
    tajikaYoga = degDiffInSign <= 1.5 ? 'Muthashila (Tight Applying)' : 'Ithasala (Applying Favorable)';
  } else if (supportiveHouseDist && degDiffInSign < 0 && Math.abs(degDiffInSign) <= 12) {
    tajikaYoga = 'Easarapha (Separating)';
  } else if (supportiveHouseDist && Math.abs(signedShortestDelta(moonPos.longitude, karyeshaPos.longitude)) <= 12) {
    tajikaYoga = 'Kamboola (Strong Support)';
  }

  let score = 48;
  const factors: string[] = [];

  if (['Ithasala (Applying Favorable)', 'Muthashila (Tight Applying)', 'Kamboola (Strong Support)'].includes(tajikaYoga)) {
    score += 22;
    factors.push(`Tajika ${tajikaYoga}: Lagna Lord (${lagnaLord}) & Karyesha (${karyesha}) connect at ${aspectOrbDeg}° orb.`);
  } else if (tajikaYoga === 'Easarapha (Separating)') {
    score -= 10;
    factors.push(`Easarapha Yoga: Fast planet has moved past exact orb (${aspectOrbDeg}°), indicating past opportunity or delay.`);
  } else {
    factors.push(`Tajika Relation: Lagna Lord (${lagnaLord}) and Karyesha (${karyesha}) stand ${houseDist} signs apart.`);
  }

  if ([1, 2, 4, 5, 7, 9, 10, 11].includes(karyeshaPos.house)) {
    score += 12;
    factors.push(`Karyesha ${karyesha} is well-placed in House ${karyeshaPos.house} (${karyeshaPos.dignity}).`);
  } else {
    score -= 10;
    factors.push(`Karyesha ${karyesha} is in Dusthana House ${karyeshaPos.house} (${karyeshaPos.dignity}), requiring steady effort.`);
  }

  if (moonPaksha === 'Shukla Paksha') {
    score += 7;
    factors.push(`Waxing Moon (Shukla Paksha) in House ${moonPos.house} strengthens Prashna fruition.`);
  } else {
    factors.push(`Waning Moon (Krishna Paksha) in House ${moonPos.house} suggests measured pace.`);
  }

  if ([6, 8, 12].includes(moonPos.house)) {
    score -= 12;
    factors.push(`Prashna Chandra in House ${moonPos.house} cautions against hasty decisions.`);
  } else {
    score += 6;
  }

  if (['Jupiter', 'Venus', 'Mercury'].includes(horaLord) || horaLord === karyesha || horaLord === lagnaLord) {
    score += 7;
    factors.push(`Prashna Hora Lord ${horaLord} supports positive momentum for this question.`);
  }

  if (karyeshaPos.isCombust) {
    score -= 8;
    factors.push(`Karyesha ${karyesha} is combust near Sun — keep matters discreet before acting.`);
  }

  const boundedScore = Math.max(12, Math.min(96, Math.round(score)));
  let verdictLabel: PrashnaResult['verdictLabel'] = 'Mixed / Delayed';
  if (boundedScore >= 72) verdictLabel = 'Highly Favorable';
  else if (boundedScore >= 56) verdictLabel = 'Favorable With Effort';
  else if (boundedScore < 42) verdictLabel = 'Unfavorable Timing';

  return {
    kundli,
    questionCategory: catMeta,
    lagnaLord,
    karyesha,
    karyeshaHouse: karyeshaPos.house,
    karyeshaDignity: karyeshaPos.dignity,
    horaLord,
    moonHouse: moonPos.house,
    moonPaksha,
    tajikaYoga,
    aspectOrbDeg,
    favorableScore: boundedScore,
    verdictLabel,
    classicalFactors: factors,
  };
}

export interface MuddaDashaEntry {
  lord: PlanetId;
  days: number;
  startDate: string;
  endDate: string;
}

export interface VarshaphalResult {
  targetYear: number;
  ageAtReturn: number;
  natalSunLongitude: number;
  solarReturnSunLongitude: number;
  solarReturnErrorArcsec: number;
  solarReturnIstIso: string;
  solarReturnDate: string;
  solarReturnTime: string;
  varshaKundli: KundliResult;
  munthaSignIndex: number;
  munthaSignName: string;
  munthaHouse: number;
  munthaLord: PlanetId;
  varshesha: PlanetId;
  muddaDashas: MuddaDashaEntry[];
}

function getSiderealSunLon(utcDate: Date, mode: AyanamshaMode): number {
  const astroTime = Astronomy.MakeTime(utcDate);
  const jd = utcDate.getTime() / 86400000 + 2440587.5;
  const sun = Astronomy.SunPosition(astroTime);
  return normalizeDeg(sun.elon - getAyanamshaDegrees(jd, mode));
}

export function calculateVarshaphal(natalInput: BirthInput, targetYear: number): VarshaphalResult {
  const mode: AyanamshaMode = natalInput.ayanamsha || 'lahiri';
  const natalKundli = calculateKundli(natalInput);
  const natalSunLon = natalKundli.planets.find((p) => p.id === 'Sun')!.longitude;

  const [birthYear, birthMonth, birthDay] = natalInput.date.split('-').map(Number);
  const ageAtReturn = Math.max(0, targetYear - birthYear);

  // Start search near anniversary date in targetYear
  const guessUtc = localDateTimeToUtc(
    `${targetYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
    natalInput.time || '12:00',
    natalInput.timezoneOffsetMinutes
  );

  // Iterative secant/Newton step: Sun moves ~0.985647 deg/day
  let tMs = guessUtc.getTime();
  for (let iter = 0; iter < 8; iter++) {
    const curLon = getSiderealSunLon(new Date(tMs), mode);
    const diff = signedShortestDelta(curLon, natalSunLon); // positive => move forward
    if (Math.abs(diff) < 1e-6) break;
    tMs += (diff / 0.98564736) * 86400000;
  }

  const returnUtc = new Date(tMs);
  const tzOffsetMs = natalInput.timezoneOffsetMinutes * 60000;
  const returnLocal = new Date(returnUtc.getTime() + tzOffsetMs);
  const returnDate = returnLocal.toISOString().slice(0, 10);
  const returnTime = returnLocal.toISOString().slice(11, 19);

  const varshaKundli = calculateKundli({
    ...natalInput,
    name: `${natalInput.name} (Varshaphal ${targetYear})`,
    date: returnDate,
    time: returnTime,
    ayanamsha: mode,
  });

  const solarReturnSunLon = varshaKundli.planets.find((p) => p.id === 'Sun')!.longitude;
  const errDeg = Math.abs(signedShortestDelta(solarReturnSunLon, natalSunLon));

  // Muntha sign advances 1 sign per completed year from Natal Ascendant
  const munthaSignIndex = (natalKundli.lagnaSignIndex + ageAtReturn) % 12;
  const munthaSignName = ZODIAC_SIGNS[munthaSignIndex].name;
  const munthaHouse = ((munthaSignIndex - varshaKundli.lagnaSignIndex + 12) % 12) + 1;
  const munthaLord = ZODIAC_SIGNS[munthaSignIndex].ruler;

  // Varshesha (Lord of the Year) simplified classical Panchadhikari selector: strongest among Muntha Lord, Varsha Lagna Lord, Natal Lagna Lord
  const varshaLagnaLord = ZODIAC_SIGNS[varshaKundli.lagnaSignIndex].ruler;
  const natalLagnaLord = ZODIAC_SIGNS[natalKundli.lagnaSignIndex].ruler;
  const weekday = returnLocal.getUTCDay();
  const dinapati = WEEKDAY_LORD[weekday];
  const candidates = Array.from(new Set<PlanetId>([munthaLord, varshaLagnaLord, natalLagnaLord, dinapati]));
  let varshesha: PlanetId = munthaLord;
  let bestStrength = -1;
  for (const cid of candidates) {
    const pos = varshaKundli.planets.find((p) => p.id === cid);
    if (pos && pos.strengthScore > bestStrength) {
      bestStrength = pos.strengthScore;
      varshesha = cid;
    }
  }

  // Mudda Dasha (365.25 days proportional Vimshottari over 1 year starting from Varsha Moon's Nakshatra lord)
  const varshaMoon = varshaKundli.planets.find((p) => p.id === 'Moon')!;
  const nakSpan = 360 / 27;
  const elapsedFrac = (varshaMoon.longitude % nakSpan) / nakSpan;
  const startIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === varshaMoon.nakshatraLord);
  const muddaDashas: MuddaDashaEntry[] = [];
  let cursorMs = returnUtc.getTime();
  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_ORDER[(startIdx + i) % 9];
    const totalDays = (entry.years / 120) * 365.25;
    const days = i === 0 ? totalDays * (1 - elapsedFrac) : totalDays;
    const endMs = cursorMs + days * 86400000;
    muddaDashas.push({
      lord: entry.lord,
      days: Number(days.toFixed(1)),
      startDate: new Date(cursorMs + tzOffsetMs).toISOString().slice(0, 10),
      endDate: new Date(endMs + tzOffsetMs).toISOString().slice(0, 10),
    });
    cursorMs = endMs;
  }

  return {
    targetYear,
    ageAtReturn,
    natalSunLongitude: Number(natalSunLon.toFixed(4)),
    solarReturnSunLongitude: Number(solarReturnSunLon.toFixed(4)),
    solarReturnErrorArcsec: Number((errDeg * 3600).toFixed(2)),
    solarReturnIstIso: `${returnDate} ${returnTime}`,
    solarReturnDate: returnDate,
    solarReturnTime: returnTime,
    varshaKundli,
    munthaSignIndex,
    munthaSignName,
    munthaHouse,
    munthaLord,
    varshesha,
    muddaDashas,
  };
}

export interface SaturnTransitWindow {
  type: 'Sade Sati 1st Phase (Rising)' | 'Sade Sati 2nd Phase (Peak)' | 'Sade Sati 3rd Phase (Setting)' | '4th Dhaiya (Kantaka)' | '8th Dhaiya (Ashtama)';
  saturnSign: string;
  startDate: string;
  endDate: string;
  durationDays: number;
}

export function calculateLifetimeSadeSatiTimeline(
  birthYear: number,
  natalMoonSignIndex: number,
  spanYears = 90
): SaturnTransitWindow[] {
  const startYear = Math.max(1920, Math.min(2060, birthYear));
  const endMs = Date.UTC(startYear + spanYears, 11, 31);
  const stepMs = 30 * 86400000;

  const getSaturnSignAt = (ms: number) => {
    const dt = new Date(ms);
    const astroTime = Astronomy.MakeTime(dt);
    const jd = ms / 86400000 + 2440587.5;
    const geoVec = Astronomy.GeoVector(Astronomy.Body.Saturn, astroTime, true);
    const ecl = Astronomy.Ecliptic(geoVec);
    const siderealLon = normalizeDeg(ecl.elon - getAyanamshaDegrees(jd, 'lahiri'));
    return Math.floor(siderealLon / 30);
  };

  const classifyHouse = (h: number): SaturnTransitWindow['type'] | null => {
    if (h === 12) return 'Sade Sati 1st Phase (Rising)';
    if (h === 1) return 'Sade Sati 2nd Phase (Peak)';
    if (h === 2) return 'Sade Sati 3rd Phase (Setting)';
    if (h === 4) return '4th Dhaiya (Kantaka)';
    if (h === 8) return '8th Dhaiya (Ashtama)';
    return null;
  };

  const windows: SaturnTransitWindow[] = [];
  let active: { type: SaturnTransitWindow['type']; signIdx: number; startMs: number } | null = null;

  for (let ms = Date.UTC(startYear, 0, 1); ms <= endMs; ms += stepMs) {
    const satSign = getSaturnSignAt(ms);
    const houseFromMoon = ((satSign - natalMoonSignIndex + 12) % 12) + 1;
    const label = classifyHouse(houseFromMoon);

    if (label) {
      if (!active || active.type !== label) {
        if (active) {
          windows.push({
            type: active.type,
            saturnSign: ZODIAC_SIGNS[active.signIdx].name,
            startDate: new Date(active.startMs).toISOString().slice(0, 10),
            endDate: new Date(ms).toISOString().slice(0, 10),
            durationDays: Math.round((ms - active.startMs) / 86400000),
          });
        }
        active = { type: label, signIdx: satSign, startMs: ms };
      }
    } else if (active) {
      windows.push({
        type: active.type,
        saturnSign: ZODIAC_SIGNS[active.signIdx].name,
        startDate: new Date(active.startMs).toISOString().slice(0, 10),
        endDate: new Date(ms).toISOString().slice(0, 10),
        durationDays: Math.round((ms - active.startMs) / 86400000),
      });
      active = null;
    }
  }

  if (active) {
    windows.push({
      type: active.type,
      saturnSign: ZODIAC_SIGNS[active.signIdx].name,
      startDate: new Date(active.startMs).toISOString().slice(0, 10),
      endDate: new Date(endMs).toISOString().slice(0, 10),
      durationDays: Math.round((endMs - active.startMs) / 86400000),
    });
  }

  return windows;
}

function escapeIcsText(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function buildAstrologyCalendarIcs(events: CalendarEventItem[], year: number): string {
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GOO ASTROLOGY UNLIMITED FREE//Vedic Panchang Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:GOO Astrology Hindu Calendar ${year}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const dtStart = ev.date.replace(/-/g, '');
    const startUtc = new Date(`${ev.date}T00:00:00Z`);
    const nextUtc = new Date(startUtc.getTime() + 86400000);
    const dtEnd = nextUtc.toISOString().slice(0, 10).replace(/-/g, '');
    const slug = ev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:goo-astrology-${dtStart}-${slug}-${i}@gooastrology.local`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
    lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    lines.push(`SUMMARY:${escapeIcsText(`${ev.name} (${ev.category})`)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(`${ev.tithi} · ${ev.nakshatra} · Region: ${ev.region}`)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
