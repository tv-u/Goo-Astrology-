import * as Astronomy from 'astronomy-engine';
import { ZODIAC_SIGNS, type PlanetId } from './constants';
import {
  calculateKundli,
  dateToJulianDay,
  getAyanamshaDegrees,
  normalizeDeg,
  type KundliResult,
  type PlanetPosition,
} from './ephemeris';

export interface GrahaYuddhaEvent {
  planetA: string;
  planetB: string;
  separationDeg: number;
  winner: string;
  loser: string;
  reason: string;
}

export interface SpeedAnalysisItem {
  id: string;
  speedDegPerDay: number;
  meanSpeedDegPerDay: number;
  motionState: 'Vakra (Retrograde)' | 'Stambhana (Stationary)' | 'Manda (Slow)' | 'Sama (Normal)' | 'Atichara (Fast)';
  relativeSpeedRatio: number;
}

export interface PlanetaryStationEvent {
  planet: string;
  date: string;
  type: 'Retrograde Station (SR)' | 'Direct Station (SD)';
  siderealSign: string;
  degreeInSign: number;
}

export interface ExactConjunctionItem {
  planetA: string;
  planetB: string;
  orbDeg: number;
  signName: string;
  house: number;
  intensity: 'Tight (<2°)' | 'Close (<5°)' | 'Wide (<8°)';
}

export interface AspectStrengthItem {
  from: string;
  to: string;
  angleDeg: number;
  virupaStrength: number; // 0..60
  aspectType: string;
}

export interface MoonPhaseItem {
  date: string;
  phaseName: string;
  illuminationPct: number;
  moonSign: string;
  nakshatra: string;
}

export interface EclipseEventItem {
  kind: 'Lunar' | 'Solar';
  peakUtc: string;
  peakIst: string;
  typeLabel: string;
  obscurationOrMagnitude: number;
  visibilitySummary: string;
  indiaVisibleEstimate: boolean;
}

export interface IngressEvent {
  planet: string;
  date: string;
  fromSign: string;
  toSign: string;
}

export interface RetrogradeShadowItem {
  planet: string;
  currentlyRetrograde: boolean;
  speedDegPerDay: number;
  approxStationWindowDays: string;
  statusNote: string;
}

export interface CombustionDetail {
  planet: string;
  angularDistanceSunDeg: number;
  combustionThresholdDeg: number;
  isCombust: boolean;
  intensityPct: number;
}

const MEAN_SPEED: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.1764,
  Mars: 0.524,
  Mercury: 1.383,
  Jupiter: 0.0831,
  Venus: 1.2,
  Saturn: 0.0335,
  Rahu: -0.0529,
  Ketu: -0.0529,
};

function angularDistance(a: number, b: number): number {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return d > 180 ? 360 - d : d;
}

// B-16: Planetary War Detection (Tara Grahas: Mars, Mercury, Jupiter, Venus, Saturn within 1 deg)
export function detectPlanetaryWar(planets: PlanetPosition[]): GrahaYuddhaEvent[] {
  const tara = planets.filter((p) => ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.id));
  const wars: GrahaYuddhaEvent[] = [];
  for (let i = 0; i < tara.length; i++) {
    for (let j = i + 1; j < tara.length; j++) {
      const sep = angularDistance(tara[i].longitude, tara[j].longitude);
      if (sep <= 1.0) {
        const winner = tara[i].latitude >= tara[j].latitude ? tara[i] : tara[j];
        const loser = winner.id === tara[i].id ? tara[j] : tara[i];
        wars.push({
          planetA: tara[i].id,
          planetB: tara[j].id,
          separationDeg: Number(sep.toFixed(3)),
          winner: winner.id,
          loser: loser.id,
          reason: `${winner.id} holds higher northern ecliptic latitude (${winner.latitude}° vs ${loser.latitude}°).`,
        });
      }
    }
  }
  return wars;
}

// B-17: Planetary Speed Analyzer
export function analyzePlanetarySpeeds(planets: PlanetPosition[]): SpeedAnalysisItem[] {
  return planets.map((p) => {
    const mean = MEAN_SPEED[p.id] ?? 1;
    const absMean = Math.abs(mean);
    const ratio = Number((Math.abs(p.speedDegPerDay) / absMean).toFixed(2));
    let motionState: SpeedAnalysisItem['motionState'] = 'Sama (Normal)';
    if (p.id !== 'Rahu' && p.id !== 'Ketu') {
      if (Math.abs(p.speedDegPerDay) < 0.03) motionState = 'Stambhana (Stationary)';
      else if (p.speedDegPerDay < 0) motionState = 'Vakra (Retrograde)';
      else if (ratio > 1.2) motionState = 'Atichara (Fast)';
      else if (ratio < 0.75) motionState = 'Manda (Slow)';
    } else {
      motionState = 'Vakra (Retrograde)';
    }
    return {
      id: p.id,
      speedDegPerDay: p.speedDegPerDay,
      meanSpeedDegPerDay: mean,
      motionState,
      relativeSpeedRatio: ratio,
    };
  });
}

// B-18: Planetary Station Detection (scans next 120 days)
export function detectPlanetaryStations(startDateStr: string, daysAhead = 120): PlanetaryStationEvent[] {
  const bodies: Array<{ id: PlanetId; body: Astronomy.Body }> = [
    { id: 'Mercury', body: Astronomy.Body.Mercury },
    { id: 'Venus', body: Astronomy.Body.Venus },
    { id: 'Mars', body: Astronomy.Body.Mars },
    { id: 'Jupiter', body: Astronomy.Body.Jupiter },
    { id: 'Saturn', body: Astronomy.Body.Saturn },
  ];
  const baseMs = new Date(`${startDateStr}T00:00:00Z`).getTime();
  const events: PlanetaryStationEvent[] = [];

  for (const item of bodies) {
    let prevSpeed: number | null = null;
    for (let d = 0; d <= daysAhead; d++) {
      const t1 = Astronomy.MakeTime(new Date(baseMs + d * 86400000));
      const t2 = Astronomy.MakeTime(new Date(baseMs + (d + 1) * 86400000));
      const l1 = Astronomy.Ecliptic(Astronomy.GeoVector(item.body, t1, true)).elon;
      const l2 = Astronomy.Ecliptic(Astronomy.GeoVector(item.body, t2, true)).elon;
      let spd = l2 - l1;
      if (spd > 180) spd -= 360;
      if (spd < -180) spd += 360;

      if (prevSpeed !== null && ((prevSpeed >= 0 && spd < 0) || (prevSpeed < 0 && spd >= 0))) {
        const dt = new Date(baseMs + d * 86400000);
        const aya = getAyanamshaDegrees(dateToJulianDay(dt), 'lahiri');
        const sid = normalizeDeg(l1 - aya);
        const sIdx = Math.floor(sid / 30);
        events.push({
          planet: item.id,
          date: dt.toISOString().slice(0, 10),
          type: spd < 0 ? 'Retrograde Station (SR)' : 'Direct Station (SD)',
          siderealSign: ZODIAC_SIGNS[sIdx].name,
          degreeInSign: Number((sid % 30).toFixed(2)),
        });
      }
      prevSpeed = spd;
    }
  }
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

// B-19: Exact Conjunction Finder
export function findExactConjunctions(planets: PlanetPosition[], maxOrbDeg = 8): ExactConjunctionItem[] {
  const list: ExactConjunctionItem[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const orb = angularDistance(planets[i].longitude, planets[j].longitude);
      if (orb <= maxOrbDeg) {
        list.push({
          planetA: planets[i].id,
          planetB: planets[j].id,
          orbDeg: Number(orb.toFixed(2)),
          signName: planets[i].signName,
          house: planets[i].house,
          intensity: orb < 2 ? 'Tight (<2°)' : orb < 5 ? 'Close (<5°)' : 'Wide (<8°)',
        });
      }
    }
  }
  return list.sort((a, b) => a.orbDeg - b.orbDeg);
}

// B-20: Planetary Aspect Strength Calculator (Drishti Bala in Virupas)
export function calculateAspectStrengths(planets: PlanetPosition[]): AspectStrengthItem[] {
  const results: AspectStrengthItem[] = [];
  for (const from of planets) {
    if (from.id === 'Rahu' || from.id === 'Ketu') continue;
    for (const to of planets) {
      if (from.id === to.id) continue;
      const forwardAngle = normalizeDeg(to.longitude - from.longitude);
      let virupa = 0;
      let label = '';
      // Classical Drishti Virupa formula + Special aspects
      if (Math.abs(forwardAngle - 180) <= 15) {
        virupa = 60 - Math.abs(forwardAngle - 180) * 2;
        label = 'Full 7th Aspect (180°)';
      } else if (from.id === 'Mars' && (Math.abs(forwardAngle - 90) <= 12 || Math.abs(forwardAngle - 210) <= 12)) {
        virupa = 60;
        label = Math.abs(forwardAngle - 90) <= 12 ? 'Mars 4th Special (90°)' : 'Mars 8th Special (210°)';
      } else if (from.id === 'Jupiter' && (Math.abs(forwardAngle - 120) <= 12 || Math.abs(forwardAngle - 240) <= 12)) {
        virupa = 60;
        label = Math.abs(forwardAngle - 120) <= 12 ? 'Jupiter 5th Special (120°)' : 'Jupiter 9th Special (240°)';
      } else if (from.id === 'Saturn' && (Math.abs(forwardAngle - 60) <= 12 || Math.abs(forwardAngle - 270) <= 12)) {
        virupa = 60;
        label = Math.abs(forwardAngle - 60) <= 12 ? 'Saturn 3rd Special (60°)' : 'Saturn 10th Special (270°)';
      } else if (forwardAngle >= 60 && forwardAngle <= 300 && from.aspectsHouses.includes(to.house)) {
        virupa = 30;
        label = 'Sign-Based Aspect';
      }
      if (virupa > 0) {
        results.push({
          from: from.id,
          to: to.id,
          angleDeg: Number(forwardAngle.toFixed(1)),
          virupaStrength: Number(virupa.toFixed(1)),
          aspectType: label,
        });
      }
    }
  }
  return results.sort((a, b) => b.virupaStrength - a.virupaStrength);
}

// B-21 & B-22: Nakshatra & Pada Transit Tracker
export function getNakshatraPadaTransits(dateStr: string, latitude = 28.6139, longitude = 77.209) {
  const res = calculateKundli({
    name: 'Transit Sky',
    date: dateStr,
    time: '06:00',
    latitude,
    longitude,
    timezoneOffsetMinutes: 330,
    ayanamsha: 'lahiri',
  });
  const nakSpan = 360 / 27;
  const padaSpan = nakSpan / 4;
  return res.planets.map((p) => {
    const nakProgressPct = Math.round(((p.longitude % nakSpan) / nakSpan) * 100);
    const padaProgressPct = Math.round(((p.longitude % padaSpan) / padaSpan) * 100);
    const remainingNakDeg = nakSpan - (p.longitude % nakSpan);
    const estDaysToNextNak =
      Math.abs(p.speedDegPerDay) > 0.005 ? Number((remainingNakDeg / Math.abs(p.speedDegPerDay)).toFixed(1)) : null;
    return {
      planet: p.id,
      sign: p.signName,
      nakshatra: p.nakshatraName,
      nakshatraLord: p.nakshatraLord,
      pada: p.pada,
      nakProgressPct,
      padaProgressPct,
      estDaysToNextNak,
      isRetrograde: p.isRetrograde,
    };
  });
}

// B-23: Moon Phase Calendar (next 8 lunar quarters ~ 60 days)
export function getMoonPhaseCalendar(startDateStr: string): MoonPhaseItem[] {
  const start = new Date(`${startDateStr}T00:00:00Z`);
  let q = Astronomy.SearchMoonQuarter(start);
  const items: MoonPhaseItem[] = [];
  const names = ['New Moon (Amavasya)', 'First Quarter (Shukla Ashtami)', 'Full Moon (Purnima)', 'Last Quarter (Krishna Ashtami)'];
  const illum = [0, 50, 100, 50];

  for (let i = 0; i < 8; i++) {
    const dt = q.time.date;
    const dateIso = dt.toISOString().slice(0, 10);
    const kundli = calculateKundli({
      name: 'Moon Phase',
      date: dateIso,
      time: dt.toISOString().slice(11, 16),
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 0,
      ayanamsha: 'lahiri',
    });
    const moon = kundli.planets.find((p) => p.id === 'Moon')!;
    items.push({
      date: dateIso,
      phaseName: names[q.quarter],
      illuminationPct: illum[q.quarter],
      moonSign: moon.signName,
      nakshatra: moon.nakshatraName,
    });
    q = Astronomy.NextMoonQuarter(q);
  }
  return items;
}

// B-24, B-25, B-26: Lunar & Solar Eclipse Calculators + Visibility Map
export function getUpcomingEclipses(
  startDateStr: string,
  latitude = 28.6139,
  longitude = 77.209
): { lunar: EclipseEventItem[]; solar: EclipseEventItem[] } {
  const start = new Date(`${startDateStr}T00:00:00Z`);
  const observer = new Astronomy.Observer(latitude, longitude, 0);

  const lunar: EclipseEventItem[] = [];
  let lEcl = Astronomy.SearchLunarEclipse(start);
  for (let i = 0; i < 4; i++) {
    const peak = lEcl.peak.date;
    const istDate = new Date(peak.getTime() + 330 * 60000);
    const istHour = istDate.getUTCHours();
    // Lunar eclipse visible when Moon is above horizon (roughly night hours 17:30-06:30 local)
    const indiaVisible = istHour >= 17 || istHour <= 6;
    lunar.push({
      kind: 'Lunar',
      peakUtc: peak.toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      peakIst: istDate.toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      typeLabel: String(lEcl.kind).toUpperCase(),
      obscurationOrMagnitude: Number((lEcl.obscuration ?? 0).toFixed(3)),
      visibilitySummary: indiaVisible
        ? 'Nighttime window in India (Moon likely above horizon; check local horizon altitude).'
        : 'Daytime in India (visible primarily in Americas / Pacific / Europe night hemisphere).',
      indiaVisibleEstimate: indiaVisible,
    });
    lEcl = Astronomy.NextLunarEclipse(lEcl.peak);
  }

  const solar: EclipseEventItem[] = [];
  let gSolar = Astronomy.SearchGlobalSolarEclipse(start);
  for (let i = 0; i < 4; i++) {
    const peak = gSolar.peak.date;
    const istDate = new Date(peak.getTime() + 330 * 60000);
    let localNote = 'Global solar eclipse peak.';
    let localVisible = false;
    try {
      const localSolar = Astronomy.SearchLocalSolarEclipse(new Date(peak.getTime() - 12 * 3600000), observer);
      const diffHours = Math.abs(localSolar.peak.time.date.getTime() - peak.getTime()) / 3600000;
      if (diffHours < 8 && localSolar.obscuration > 0.01) {
        localVisible = true;
        localNote = `Locally visible at selected coords (max obscuration ${(localSolar.obscuration * 100).toFixed(1)}%).`;
      } else {
        localNote = 'Not visible from selected coordinates; path crosses outside local daytime arc.';
      }
    } catch {
      localNote = 'Path occurs outside selected local coordinates.';
    }

    solar.push({
      kind: 'Solar',
      peakUtc: peak.toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      peakIst: istDate.toISOString().replace('T', ' ').slice(0, 16) + ' IST',
      typeLabel: String(gSolar.kind).toUpperCase(),
      obscurationOrMagnitude: Number((gSolar.obscuration ?? 0).toFixed(3)),
      visibilitySummary: localNote,
      indiaVisibleEstimate: localVisible,
    });
    gSolar = Astronomy.NextGlobalSolarEclipse(gSolar.peak);
  }

  return { lunar, solar };
}

// B-27: Planetary Ingress Calendar (next 150 days sidereal sign changes)
export function getPlanetaryIngresses(startDateStr: string, daysAhead = 150): IngressEvent[] {
  const baseMs = new Date(`${startDateStr}T00:00:00Z`).getTime();
  const bodies: Array<{ id: PlanetId; body: Astronomy.Body | 'Sun' }> = [
    { id: 'Sun', body: 'Sun' },
    { id: 'Mercury', body: Astronomy.Body.Mercury },
    { id: 'Venus', body: Astronomy.Body.Venus },
    { id: 'Mars', body: Astronomy.Body.Mars },
    { id: 'Jupiter', body: Astronomy.Body.Jupiter },
    { id: 'Saturn', body: Astronomy.Body.Saturn },
  ];
  const ingresses: IngressEvent[] = [];

  for (const item of bodies) {
    let prevSign: number | null = null;
    for (let d = 0; d <= daysAhead; d++) {
      const dt = new Date(baseMs + d * 86400000);
      const astro = Astronomy.MakeTime(dt);
      const aya = getAyanamshaDegrees(dateToJulianDay(dt), 'lahiri');
      const trop =
        item.body === 'Sun'
          ? Astronomy.SunPosition(astro).elon
          : Astronomy.Ecliptic(Astronomy.GeoVector(item.body, astro, true)).elon;
      const sid = normalizeDeg(trop - aya);
      const sIdx = Math.floor(sid / 30);
      if (prevSign !== null && sIdx !== prevSign) {
        ingresses.push({
          planet: item.id,
          date: dt.toISOString().slice(0, 10),
          fromSign: ZODIAC_SIGNS[prevSign].name,
          toSign: ZODIAC_SIGNS[sIdx].name,
        });
      }
      prevSign = sIdx;
    }
  }
  return ingresses.sort((a, b) => a.date.localeCompare(b.date));
}

// B-28: Retrograde Shadow Period Tracker
export function getRetrogradeShadowSummary(planets: PlanetPosition[], dateStr: string): RetrogradeShadowItem[] {
  const stations = detectPlanetaryStations(dateStr, 90);
  return planets
    .filter((p) => ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(p.id))
    .map((p) => {
      const nextStation = stations.find((s) => s.planet === p.id);
      return {
        planet: p.id,
        currentlyRetrograde: p.isRetrograde,
        speedDegPerDay: p.speedDegPerDay,
        approxStationWindowDays: nextStation ? `${nextStation.date} (${nextStation.type})` : 'No station in next 90 days',
        statusNote: p.isRetrograde
          ? 'Active retrograde arc — inside post-station return span.'
          : Math.abs(p.speedDegPerDay) < Math.abs(MEAN_SPEED[p.id]) * 0.6
          ? 'Slowing down — approaching retrograde pre-shadow zone.'
          : 'Direct motion outside immediate station threshold.',
      };
    });
}

// B-29: Combustion Distance Calculator
export function calculateCombustionDistances(planets: PlanetPosition[]): CombustionDetail[] {
  const sun = planets.find((p) => p.id === 'Sun')!;
  return planets
    .filter((p) => !['Sun', 'Rahu', 'Ketu'].includes(p.id))
    .map((p) => {
      const orbMap: Record<string, number> = {
        Moon: 12,
        Mars: 17,
        Mercury: p.isRetrograde ? 12 : 14,
        Jupiter: 11,
        Venus: p.isRetrograde ? 8 : 10,
        Saturn: 15,
      };
      const threshold = orbMap[p.id] ?? 12;
      const dist = angularDistance(p.longitude, sun.longitude);
      const intensity = dist < threshold ? Math.round(((threshold - dist) / threshold) * 100) : 0;
      return {
        planet: p.id,
        angularDistanceSunDeg: Number(dist.toFixed(2)),
        combustionThresholdDeg: threshold,
        isCombust: dist <= threshold,
        intensityPct: intensity,
      };
    });
}

// B-30: Planetary Dignity Comparison Matrix (Natal vs Transit)
export function compareNatalVsTransitDignity(natal: KundliResult, transit: KundliResult) {
  return natal.planets.map((np) => {
    const tp = transit.planets.find((t) => t.id === np.id)!;
    const transitHouseFromMoon = ((tp.signIndex - natal.moonSignIndex + 12) % 12) + 1;
    return {
      planet: np.id,
      natalSign: np.signName,
      natalDignity: np.dignity,
      natalHouse: np.house,
      transitSign: tp.signName,
      transitDignity: tp.dignity,
      transitHouseFromLagna: ((tp.signIndex - natal.lagnaSignIndex + 12) % 12) + 1,
      transitHouseFromMoon,
    };
  });
}
