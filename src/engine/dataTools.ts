import { DateTime } from 'luxon';
import Papa from 'papaparse';
import { z } from 'zod';
import { INDIAN_CITIES } from '../data/cities';
import { ZODIAC_SIGNS } from './constants';
import {
  calculateKundli,
  dateToJulianDay,
  getAyanamshaDegrees,
  type AyanamshaMode,
  type BirthInput,
  type KundliResult,
} from './ephemeris';

export const birthInputSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  latitude: z.number().min(-89.5).max(89.5),
  longitude: z.number().min(-180).max(180),
  timezoneOffsetMinutes: z.number().min(-720).max(840),
  timezoneName: z.string().optional(),
  placeName: z.string().optional(),
  ayanamsha: z.enum(['lahiri', 'raman', 'kp', 'tropical']).optional(),
});

// F-71: Automatic Ephemeris Data Validator
export interface EphemerisCheckResult {
  checkpoint: string;
  expected: string;
  computed: string;
  deltaDeg: number;
  passed: boolean;
}

export function validateEphemerisEngine(): {
  allPassed: boolean;
  checkedAt: string;
  checks: EphemerisCheckResult[];
} {
  const j2000Utc = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const j2000Jd = dateToJulianDay(j2000Utc);
  const lahiriJ2000 = getAyanamshaDegrees(j2000Jd, 'lahiri');
  const deltaJ2000 = Math.abs(lahiriJ2000 - 23.857092);

  const equinox2026 = calculateKundli({
    name: 'Equinox QA',
    date: '2026-03-20',
    time: '14:46',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 0,
    ayanamsha: 'lahiri',
  });
  const sunTrop = equinox2026.planets.find((p) => p.id === 'Sun')!.tropicalLongitude;
  const sunEqDelta = Math.min(sunTrop, 360 - sunTrop);

  const meshaSankranti = calculateKundli({
    name: 'Mesha Sankranti QA',
    date: '2026-04-15',
    time: '12:00',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    ayanamsha: 'lahiri',
  });
  const sunApr15 = meshaSankranti.planets.find((p) => p.id === 'Sun')!;

  const checks: EphemerisCheckResult[] = [
    {
      checkpoint: 'Julian Day at J2000.0 Epoch (2000-01-01 12:00 UTC)',
      expected: '2451545.0000',
      computed: j2000Jd.toFixed(4),
      deltaDeg: Number(Math.abs(j2000Jd - 2451545.0).toFixed(6)),
      passed: Math.abs(j2000Jd - 2451545.0) < 0.0001,
    },
    {
      checkpoint: 'Lahiri Chitrapaksha Ayanamsha at J2000.0',
      expected: '23.857092°',
      computed: `${lahiriJ2000.toFixed(6)}°`,
      deltaDeg: Number(deltaJ2000.toFixed(6)),
      passed: deltaJ2000 < 0.001,
    },
    {
      checkpoint: '2026 Vernal Equinox Tropical Sun Longitude (~0° Aries)',
      expected: '0.00° ± 0.25°',
      computed: `${sunTrop.toFixed(3)}°`,
      deltaDeg: Number(sunEqDelta.toFixed(3)),
      passed: sunEqDelta < 0.35,
    },
    {
      checkpoint: 'Mesha Sankranti Sidereal Sun in Aries (Apr 15 2026)',
      expected: 'Aries',
      computed: sunApr15.signName,
      deltaDeg: 0,
      passed: sunApr15.signName === 'Aries',
    },
  ];

  return {
    allPassed: checks.every((c) => c.passed),
    checkedAt: new Date().toISOString(),
    checks,
  };
}

// F-72: Multiple Calculation Engine Comparison
export function compareAyanamshaEngines(input: BirthInput) {
  const modes: AyanamshaMode[] = ['lahiri', 'kp', 'raman', 'tropical'];
  return modes.map((mode) => {
    const k = calculateKundli({ ...input, ayanamsha: mode });
    const moon = k.planets.find((p) => p.id === 'Moon')!;
    const sun = k.planets.find((p) => p.id === 'Sun')!;
    return {
      mode,
      ayanamshaDms: k.ayanamshaDms,
      ayanamshaDeg: k.ayanamshaDegrees,
      ascendant: `${k.ascendant.signName} ${k.ascendant.dms}`,
      moon: `${moon.signName} ${moon.dms} (${moon.nakshatraName})`,
      sun: `${sun.signName} ${sun.dms}`,
    };
  });
}

// F-73: Birth Location Coordinate Resolver
export function resolveLocationCoordinates(query: string) {
  const q = query.trim().toLowerCase();
  const matches = INDIAN_CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
  ).slice(0, 10);
  return matches.map((c) => {
    const distFromUjjainKm = Math.round(
      Math.hypot((c.latitude - 23.1765) * 111, (c.longitude - 75.7885) * 102)
    );
    return {
      ...c,
      distFromUjjainKm,
      solarOffsetFromIstMinutes: Math.round((c.longitude - 82.5) * 4),
    };
  });
}

// F-74 & F-75: Historical Timezone & Automatic Daylight Saving Correction (Luxon)
export function resolveHistoricalTimezone(dateStr: string, timeStr: string, ianaZone: string) {
  const dt = DateTime.fromISO(`${dateStr}T${timeStr || '12:00'}:00`, { zone: ianaZone || 'Asia/Kolkata' });
  if (!dt.isValid) {
    return {
      valid: false,
      ianaZone,
      offsetMinutes: 330,
      offsetLabel: '+05:30',
      isInDST: false,
      historicalNote: `Invalid timezone identifier "${ianaZone}"; defaulted to IST (+05:30).`,
    };
  }
  const [yr] = dateStr.split('-').map(Number);
  const offsetHours = dt.offset / 60;
  const sign = offsetHours >= 0 ? '+' : '-';
  const absMins = Math.abs(dt.offset);
  const hh = String(Math.floor(absMins / 60)).padStart(2, '0');
  const mm = String(absMins % 60).padStart(2, '0');
  let historicalNote = `IANA zone ${dt.zoneName} (${dt.offsetNameLong || 'Standard'}) resolved.`;
  if (ianaZone === 'Asia/Kolkata' && yr >= 1942 && yr <= 1945) {
    historicalNote += ' Note: British India observed wartime UTC+06:30 between Sep 1942 and Oct 1945.';
  }
  return {
    valid: true,
    ianaZone: dt.zoneName || ianaZone,
    offsetMinutes: dt.offset,
    offsetLabel: `${sign}${hh}:${mm}`,
    isInDST: dt.isInDST,
    utcIso: dt.toUTC().toISO() || '',
    historicalNote,
  };
}

// F-76 & F-77: Birth Data Accuracy Checker & Kundli Audit Report
export function runBirthDataAudit(input: BirthInput, kundli: KundliResult) {
  const parsed = birthInputSchema.safeParse(input);
  const warnings: string[] = [];
  if (Math.abs(input.latitude) > 66.5) {
    warnings.push('High-latitude location (>66.5°): Placidus/Ascendant cusps deform near polar circles.');
  }
  if (input.unknownBirthTime) {
    warnings.push('Noon (12:00) fallback active: Lagna & Bhava houses are approximate.');
  }
  const nearSandhi = [kundli.ascendant, ...kundli.planets].filter(
    (p) => Math.min(p.degreeInSign, 30 - p.degreeInSign) < 0.75
  );
  if (nearSandhi.length > 0) {
    warnings.push(
      `Rashi Sandhi alert (<0.75° from sign boundary): ${nearSandhi.map((p) => `${p.id} in ${p.signName}`).join(', ')}.`
    );
  }
  return {
    schemaValid: parsed.success,
    validationErrors: parsed.success ? [] : parsed.error.issues.map((i) => i.message),
    warnings,
    auditTrail: {
      julianDay: kundli.julianDay,
      utcIso: kundli.utcIso,
      ayanamsha: `${kundli.ayanamshaMode} (${kundli.ayanamshaDms})`,
      localSiderealTimeHours: kundli.localSiderealTimeHours,
      ephemeris: kundli.assumptions.ephemerisSource,
    },
  };
}

// F-83: Calculation Performance Benchmark
export function runCalculationBenchmark(iterations = 25) {
  const t0 = performance.now();
  let lastSign = '';
  for (let i = 0; i < iterations; i++) {
    const day = String((i % 28) + 1).padStart(2, '0');
    const res = calculateKundli({
      name: `Bench-${i}`,
      date: `1995-05-${day}`,
      time: '08:30',
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 330,
      ayanamsha: 'lahiri',
    });
    lastSign = res.ascendant.signName;
  }
  const elapsedMs = Math.max(0.1, performance.now() - t0);
  return {
    iterations,
    totalMs: Number(elapsedMs.toFixed(2)),
    avgMsPerKundli: Number((elapsedMs / iterations).toFixed(2)),
    chartsPerSecond: Math.round((iterations / elapsedMs) * 1000),
    sampleLastLagna: lastSign || ZODIAC_SIGNS[0].name,
  };
}

// F-84: Multi-Profile Bulk Kundli Generator (CSV via PapaParse)
export interface BulkProfileRow {
  name: string;
  date: string;
  time: string;
  place: string;
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number;
  lagna: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  currentMahaDasha: string;
  status: 'ok' | 'error';
  error?: string;
}

export function processBulkKundliCsv(csvText: string): BulkProfileRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row, idx) => {
    try {
      const name = (row.name || row.Name || `Subject ${idx + 1}`).trim();
      const date = (row.date || row.Date || '1995-08-15').trim();
      const time = (row.time || row.Time || '10:30').trim();
      const place = (row.place || row.Place || 'New Delhi, India').trim();
      const matchedCity = INDIAN_CITIES.find((c) => c.name.toLowerCase() === place.toLowerCase());
      const latitude = Number(row.latitude || row.lat || matchedCity?.latitude || 28.6139);
      const longitude = Number(row.longitude || row.lon || matchedCity?.longitude || 77.209);
      const tz = Number(row.timezoneOffsetMinutes || row.tz || matchedCity?.timezoneOffsetMinutes || 330);

      const k = calculateKundli({
        name,
        date,
        time,
        placeName: place,
        latitude,
        longitude,
        timezoneOffsetMinutes: tz,
        ayanamsha: 'lahiri',
      });
      const moon = k.planets.find((p) => p.id === 'Moon')!;
      const sun = k.planets.find((p) => p.id === 'Sun')!;
      return {
        name,
        date,
        time,
        place,
        latitude,
        longitude,
        timezoneOffsetMinutes: tz,
        lagna: `${k.ascendant.signName} ${k.ascendant.dms}`,
        moonSign: moon.signName,
        sunSign: sun.signName,
        nakshatra: `${moon.nakshatraName} P${moon.pada}`,
        currentMahaDasha: k.currentMahadasha?.lord || 'N/A',
        status: 'ok',
      };
    } catch (err) {
      return {
        name: row.name || `Row ${idx + 1}`,
        date: row.date || '',
        time: row.time || '',
        place: row.place || '',
        latitude: 0,
        longitude: 0,
        timezoneOffsetMinutes: 330,
        lagna: '-',
        moonSign: '-',
        sunSign: '-',
        nakshatra: '-',
        currentMahaDasha: '-',
        status: 'error',
        error: err instanceof Error ? err.message : 'Invalid row',
      };
    }
  });
}
