import {
  NAKSHATRAS,
  PLANET_DIGNITY_SIGNS,
  VIMSHOTTARI_ORDER,
  ZODIAC_SIGNS,
  type PlanetId,
} from './constants';
import { getDivisionalSign, normalizeDeg, formatDms, type KundliResult, type PlanetPosition } from './ephemeris';

// --- A-01: Planetary Degree Precision Analyzer ---
export interface DegreePrecisionItem {
  id: string;
  longitude: number;
  dms: string;
  signName: string;
  degreeInSign: number;
  arcMinutes: number;
  arcSeconds: number;
  distToSignSandhiDeg: number;
  isSandhi: boolean;
  nakshatraName: string;
  pada: number;
  padaProgressPct: number;
}

export function analyzeDegreePrecision(kundli: KundliResult): DegreePrecisionItem[] {
  const all = [kundli.ascendant, ...kundli.planets];
  return all.map((p) => {
    const degInSign = p.degreeInSign;
    const wholeDeg = Math.floor(degInSign);
    const remMin = (degInSign - wholeDeg) * 60;
    const arcMinutes = Math.floor(remMin);
    const arcSeconds = Math.round((remMin - arcMinutes) * 60);
    const distToSandhi = Math.min(degInSign, 30 - degInSign);
    const nakSpan = 360 / 27;
    const padaSpan = nakSpan / 4;
    const posInPada = p.longitude % padaSpan;
    return {
      id: p.id,
      longitude: Number(p.longitude.toFixed(4)),
      dms: p.dms,
      signName: p.signName,
      degreeInSign: Number(degInSign.toFixed(4)),
      arcMinutes,
      arcSeconds: arcSeconds === 60 ? 0 : arcSeconds,
      distToSignSandhiDeg: Number(distToSandhi.toFixed(3)),
      isSandhi: distToSandhi < 1.0,
      nakshatraName: p.nakshatraName,
      pada: p.pada,
      padaProgressPct: Math.round((posInPada / padaSpan) * 100),
    };
  });
}

// --- A-02: Nakshatra Pada Compatibility Matrix ---
export interface PadaCompatibilityRow {
  planet: PlanetId;
  nakshatra: string;
  pada: number;
  purushartha: 'Dharma' | 'Artha' | 'Kama' | 'Moksha';
  taraFromMoon: string;
  taraScore: number;
  harmony: 'Harmonious' | 'Neutral' | 'Challenging';
}

const TARA_NAMES = [
  'Janma (Self)',
  'Sampat (Wealth)',
  'Vipat (Caution)',
  'Kshema (Wellbeing)',
  'Pratyari (Friction)',
  'Sadhaka (Achievement)',
  'Vadha (Obstacle)',
  'Mitra (Friend)',
  'Parama Mitra (Best Friend)',
];

export function analyzeNakshatraPadaMatrix(kundli: KundliResult): PadaCompatibilityRow[] {
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const purusharthaMap: Array<'Dharma' | 'Artha' | 'Kama' | 'Moksha'> = ['Dharma', 'Artha', 'Kama', 'Moksha'];
  return kundli.planets.map((p) => {
    const taraIdx = (p.nakshatraIndex - moon.nakshatraIndex + 27) % 9;
    const favorable = [1, 3, 5, 7, 8].includes(taraIdx);
    const neutral = taraIdx === 0;
    return {
      planet: p.id as PlanetId,
      nakshatra: p.nakshatraName,
      pada: p.pada,
      purushartha: purusharthaMap[(p.pada - 1) % 4],
      taraFromMoon: TARA_NAMES[taraIdx],
      taraScore: favorable ? 85 : neutral ? 65 : 35,
      harmony: favorable ? 'Harmonious' : neutral ? 'Neutral' : 'Challenging',
    };
  });
}

// --- A-03: Nakshatra Lord Relationship Analyzer ---
export interface NakshatraLordRelation {
  planet: PlanetId;
  starLord: PlanetId;
  lagnaLord: PlanetId;
  moonLord: PlanetId;
  naturalRelationWithLagnaLord: 'Friend' | 'Neutral' | 'Enemy';
  naturalRelationWithMoonLord: 'Friend' | 'Neutral' | 'Enemy';
}

function getNaturalRelation(a: PlanetId, b: PlanetId): 'Friend' | 'Neutral' | 'Enemy' {
  if (a === b) return 'Friend';
  const rules = PLANET_DIGNITY_SIGNS[a];
  if (rules.friends.includes(b)) return 'Friend';
  if (rules.enemies.includes(b)) return 'Enemy';
  return 'Neutral';
}

export function analyzeNakshatraLordRelationships(kundli: KundliResult): NakshatraLordRelation[] {
  const lagnaLord = ZODIAC_SIGNS[kundli.lagnaSignIndex].ruler;
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const moonLord = moon.nakshatraLord;
  return kundli.planets.map((p) => ({
    planet: p.id as PlanetId,
    starLord: p.nakshatraLord,
    lagnaLord,
    moonLord,
    naturalRelationWithLagnaLord: getNaturalRelation(p.nakshatraLord, lagnaLord),
    naturalRelationWithMoonLord: getNaturalRelation(p.nakshatraLord, moonLord),
  }));
}

// --- A-04 & A-05: Bhava Chalit & Sripati Bhava Calculators ---
export interface BhavaCuspInfo {
  house: number;
  cuspLongitude: number;
  cuspDms: string;
  sandhiStart: number;
  sandhiEnd: number;
  signName: string;
  planetsInBhava: string[];
  shiftedPlanets: string[];
}

function computeSiderealMC(kundli: KundliResult): number {
  const ramcDeg = kundli.localSiderealTimeHours * 15;
  const ramcRad = (ramcDeg * Math.PI) / 180;
  const epsRad = (23.43929 * Math.PI) / 180;
  const mcTrop = normalizeDeg((Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsRad)) * 180) / Math.PI);
  return normalizeDeg(mcTrop - kundli.ayanamshaDegrees);
}

function circularForwardSpan(fromDeg: number, toDeg: number): number {
  return normalizeDeg(toDeg - fromDeg);
}

function isLongitudeInArc(lon: number, start: number, end: number): boolean {
  const span = circularForwardSpan(start, end);
  const pos = circularForwardSpan(start, lon);
  return pos >= 0 && pos < span;
}

export function calculateBhavaChalitAndSripati(kundli: KundliResult): {
  bhavaChalit: BhavaCuspInfo[];
  sripati: BhavaCuspInfo[];
  mcLongitude: number;
} {
  const asc = kundli.ascendant.longitude;
  const mc = computeSiderealMC(kundli);
  const ic = normalizeDeg(mc + 180);
  const desc = normalizeDeg(asc + 180);

  // Equal Bhava Chalit midpoints around Asc (15 deg each side)
  const equalCusps = Array.from({ length: 12 }, (_, i) => normalizeDeg(asc + i * 30));

  // Sripati unequal cusps: trisect 4 quadrants (Asc->IC, IC->Desc, Desc->MC, MC->Asc)
  const q1 = circularForwardSpan(asc, ic) / 3;
  const q2 = circularForwardSpan(ic, desc) / 3;
  const q3 = circularForwardSpan(desc, mc) / 3;
  const q4 = circularForwardSpan(mc, asc) / 3;
  const sripatiCusps = [
    asc,
    normalizeDeg(asc + q1),
    normalizeDeg(asc + 2 * q1),
    ic,
    normalizeDeg(ic + q2),
    normalizeDeg(ic + 2 * q2),
    desc,
    normalizeDeg(desc + q3),
    normalizeDeg(desc + 2 * q3),
    mc,
    normalizeDeg(mc + q4),
    normalizeDeg(mc + 2 * q4),
  ];

  const buildHouses = (cusps: number[]): BhavaCuspInfo[] => {
    const sandhis = cusps.map((c, i) => {
      const prev = cusps[(i + 11) % 12];
      const halfBack = circularForwardSpan(prev, c) / 2;
      return normalizeDeg(c - halfBack);
    });
    return cusps.map((cusp, i) => {
      const start = sandhis[i];
      const end = sandhis[(i + 1) % 12];
      const houseNum = i + 1;
      const inHouse = kundli.planets.filter((p) => isLongitudeInArc(p.longitude, start, end));
      const shifted = inHouse.filter((p) => p.house !== houseNum).map((p) => `${p.id} (D1 H${p.house} -> Bhava H${houseNum})`);
      return {
        house: houseNum,
        cuspLongitude: Number(cusp.toFixed(3)),
        cuspDms: formatDms(cusp % 30),
        sandhiStart: Number(start.toFixed(3)),
        sandhiEnd: Number(end.toFixed(3)),
        signName: ZODIAC_SIGNS[Math.floor(cusp / 30)].name,
        planetsInBhava: inHouse.map((p) => p.id),
        shiftedPlanets: shifted,
      };
    });
  };

  return {
    bhavaChalit: buildHouses(equalCusps),
    sripati: buildHouses(sripatiCusps),
    mcLongitude: Number(mc.toFixed(3)),
  };
}

// --- A-06 & A-07: KP Sub-Lord & Cusp Significator Analyzer ---
export interface KpSubDetail {
  id: string;
  longitude: number;
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  subSubLord: PlanetId;
}

export interface KpCuspSignificator {
  cusp: number;
  longitude: number;
  signName: string;
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  significators: PlanetId[];
}

export function getKpSubChain(longitude: number): {
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  subSubLord: PlanetId;
} {
  const lon = normalizeDeg(longitude);
  const signIdx = Math.floor(lon / 30);
  const signLord = ZODIAC_SIGNS[signIdx].ruler;
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(lon / nakSpan);
  const starLord = NAKSHATRAS[nakIdx].lord;
  const posInNak = lon % nakSpan;

  const startIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === starLord);
  let cursor = 0;
  let subLord: PlanetId = starLord;
  let posInSub = 0;
  let subSpanDeg = nakSpan;

  for (let i = 0; i < 9; i++) {
    const entry = VIMSHOTTARI_ORDER[(startIdx + i) % 9];
    const span = (nakSpan * entry.years) / 120;
    if (posInNak < cursor + span || i === 8) {
      subLord = entry.lord;
      posInSub = posInNak - cursor;
      subSpanDeg = span;
      break;
    }
    cursor += span;
  }

  const subStartIdx = VIMSHOTTARI_ORDER.findIndex((o) => o.lord === subLord);
  let subCursor = 0;
  let subSubLord: PlanetId = subLord;
  for (let j = 0; j < 9; j++) {
    const entry = VIMSHOTTARI_ORDER[(subStartIdx + j) % 9];
    const span = (subSpanDeg * entry.years) / 120;
    if (posInSub < subCursor + span || j === 8) {
      subSubLord = entry.lord;
      break;
    }
    subCursor += span;
  }

  return { signLord, starLord, subLord, subSubLord };
}

export function calculateKpAnalysis(kundli: KundliResult): {
  planets: KpSubDetail[];
  cusps: KpCuspSignificator[];
} {
  const allPoints = [kundli.ascendant, ...kundli.planets];
  const planets: KpSubDetail[] = allPoints.map((p) => ({
    id: p.id,
    longitude: Number(p.longitude.toFixed(4)),
    ...getKpSubChain(p.longitude),
  }));

  const { sripati } = calculateBhavaChalitAndSripati(kundli);
  const cusps: KpCuspSignificator[] = sripati.map((c) => {
    const chain = getKpSubChain(c.cuspLongitude);
    const signIdx = Math.floor(c.cuspLongitude / 30);
    const owner = ZODIAC_SIGNS[signIdx].ruler;
    const occupants = c.planetsInBhava.filter((x) => x !== 'Ascendant') as PlanetId[];
    const starOcc = kundli.planets
      .filter((p) => occupants.includes(p.nakshatraLord))
      .map((p) => p.id as PlanetId);
    const starOfOwner = kundli.planets
      .filter((p) => p.nakshatraLord === owner)
      .map((p) => p.id as PlanetId);
    const significators = Array.from(new Set([...starOcc, ...occupants, ...starOfOwner, owner]));
    return {
      cusp: c.house,
      longitude: c.cuspLongitude,
      signName: c.signName,
      ...chain,
      significators,
    };
  });

  return { planets, cusps };
}

// --- A-08 & A-09: Jaimini Karakamsha & Swamsha Analysis ---
export interface JaiminiKaraka {
  role: string;
  shortCode: string;
  planet: PlanetId;
  degreeInSign: number;
  d1Sign: string;
  d9Sign: string;
}

export interface JaiminiAnalysis {
  karakas: JaiminiKaraka[];
  atmakaraka: JaiminiKaraka;
  karakamshaSignIndex: number;
  karakamshaSignName: string;
  swamshaSignIndex: number;
  swamshaSignName: string;
  ishtaDevataSign: string;
  karakamshaPlacements: Array<{ planet: string; d9Sign: string; houseFromKarakamsha: number }>;
  insights: string[];
}

const JAIMINI_ROLES = [
  { shortCode: 'AK', role: 'Atmakaraka (Soul & Self)' },
  { shortCode: 'AmK', role: 'Amatyakaraka (Career & Advisors)' },
  { shortCode: 'BK', role: 'Bhratrukaraka (Siblings & Courage)' },
  { shortCode: 'MK', role: 'Matrukaraka (Mother & Home)' },
  { shortCode: 'PK', role: 'Putrakaraka (Intelligence & Progeny)' },
  { shortCode: 'GK', role: 'Gnatikaraka (Obstacles & Service)' },
  { shortCode: 'DK', role: 'Darakaraka (Spouse & Partnerships)' },
];

export function calculateJaiminiAnalysis(kundli: KundliResult): JaiminiAnalysis {
  // 7-Karaka scheme (Sun through Saturn sorted descending by degree in sign)
  const seven = kundli.planets.filter((p) =>
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].includes(p.id)
  );
  const sorted = [...seven].sort((a, b) => b.degreeInSign - a.degreeInSign);
  const karakas: JaiminiKaraka[] = sorted.map((p, idx) => {
    const d9SignIdx = getDivisionalSign(p.longitude, 9);
    return {
      role: JAIMINI_ROLES[idx].role,
      shortCode: JAIMINI_ROLES[idx].shortCode,
      planet: p.id as PlanetId,
      degreeInSign: Number(p.degreeInSign.toFixed(3)),
      d1Sign: p.signName,
      d9Sign: ZODIAC_SIGNS[d9SignIdx].name,
    };
  });

  const ak = karakas[0];
  const akPlanet = kundli.planets.find((p) => p.id === ak.planet)!;
  const karakamshaSignIndex = getDivisionalSign(akPlanet.longitude, 9);
  const swamshaSignIndex = getDivisionalSign(kundli.ascendant.longitude, 9);
  const ishtaSignIdx = (karakamshaSignIndex + 11) % 12;

  const d9Chart = kundli.divisionalCharts.find((d) => d.code === 'D9')!;
  const karakamshaPlacements = d9Chart.placements
    .filter((pl) => pl.id !== 'Ascendant')
    .map((pl) => ({
      planet: pl.id,
      d9Sign: pl.signName,
      houseFromKarakamsha: ((pl.signIndex - karakamshaSignIndex + 12) % 12) + 1,
    }));

  const insights = [
    `Atmakaraka is ${ak.planet} at ${ak.degreeInSign.toFixed(2)}° in ${ak.d1Sign}, placing Karakamsha in ${ZODIAC_SIGNS[karakamshaSignIndex].name}.`,
    `Swamsha (D9 Lagna) falls in ${ZODIAC_SIGNS[swamshaSignIndex].name} (${ZODIAC_SIGNS[swamshaSignIndex].element} element).`,
    `12th from Karakamsha is ${ZODIAC_SIGNS[ishtaSignIdx].name} (ruled by ${ZODIAC_SIGNS[ishtaSignIdx].rulerName}), indicating Ishta Devata inclination.`,
  ];
  const amkFromAk = karakamshaPlacements.find((x) => x.planet === karakas[1].planet);
  if (amkFromAk && [1, 5, 9, 10].includes(amkFromAk.houseFromKarakamsha)) {
    insights.push(
      `Amatyakaraka (${karakas[1].planet}) occupies House ${amkFromAk.houseFromKarakamsha} from Karakamsha, creating a strong Jaimini Rajayoga for vocation.`
    );
  }

  return {
    karakas,
    atmakaraka: ak,
    karakamshaSignIndex,
    karakamshaSignName: ZODIAC_SIGNS[karakamshaSignIndex].name,
    swamshaSignIndex,
    swamshaSignName: ZODIAC_SIGNS[swamshaSignIndex].name,
    ishtaDevataSign: ZODIAC_SIGNS[ishtaSignIdx].name,
    karakamshaPlacements,
    insights,
  };
}

// --- A-10, A-11, A-12: Bhinna, Prasthara & Sarva Ashtakavarga ---
// Classical BPHS Parashari Ashtakavarga 1-based benefic houses from each contributor
const BAV_RULES: Record<
  'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn',
  Record<'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Ascendant', number[]>
> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [3, 4, 6, 10, 11, 12],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Ascendant: [3, 6, 10, 11],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 3, 6, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Ascendant: [1, 2, 4, 6, 8, 10, 11],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Ascendant: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Ascendant: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Ascendant: [1, 3, 4, 6, 10, 11],
  },
};

export type AshtakavargaPlanet = keyof typeof BAV_RULES;
export type AshtakavargaContributor = keyof typeof BAV_RULES['Sun'];

export interface AshtakavargaResult {
  bhinna: Record<AshtakavargaPlanet, number[]>; // 12 signs (Aries=0..Pisces=11)
  prasthara: Record<AshtakavargaPlanet, Record<AshtakavargaContributor, number[]>>;
  sarva: number[]; // 12 signs total (sum always 337)
  totalBindus: number;
  strongSigns: string[];
  weakSigns: string[];
}

export function calculateAshtakavarga(kundli: KundliResult): AshtakavargaResult {
  const contributors: AshtakavargaContributor[] = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Ascendant',
  ];
  const signOf = new Map<AshtakavargaContributor, number>();
  signOf.set('Ascendant', kundli.lagnaSignIndex);
  for (const p of kundli.planets) {
    if (p.id !== 'Rahu' && p.id !== 'Ketu') {
      signOf.set(p.id as AshtakavargaContributor, p.signIndex);
    }
  }

  const planets = Object.keys(BAV_RULES) as AshtakavargaPlanet[];
  const bhinna = {} as Record<AshtakavargaPlanet, number[]>;
  const prasthara = {} as Record<AshtakavargaPlanet, Record<AshtakavargaContributor, number[]>>;
  const sarva = new Array(12).fill(0);

  for (const target of planets) {
    const totals = new Array(12).fill(0);
    const rows = {} as Record<AshtakavargaContributor, number[]>;
    for (const contrib of contributors) {
      const row = new Array(12).fill(0);
      const baseSign = signOf.get(contrib) ?? 0;
      for (const offsetHouse of BAV_RULES[target][contrib]) {
        const targetSign = (baseSign + offsetHouse - 1) % 12;
        row[targetSign] = 1;
        totals[targetSign] += 1;
      }
      rows[contrib] = row;
    }
    bhinna[target] = totals;
    prasthara[target] = rows;
    for (let s = 0; s < 12; s++) sarva[s] += totals[s];
  }

  const totalBindus = sarva.reduce((a, b) => a + b, 0);
  const strongSigns = sarva
    .map((v, i) => ({ v, name: `${ZODIAC_SIGNS[i].name} (${v})` }))
    .filter((x) => x.v >= 30)
    .map((x) => x.name);
  const weakSigns = sarva
    .map((v, i) => ({ v, name: `${ZODIAC_SIGNS[i].name} (${v})` }))
    .filter((x) => x.v <= 24)
    .map((x) => x.name);

  return { bhinna, prasthara, sarva, totalBindus, strongSigns, weakSigns };
}

// --- A-13, A-14, A-15: Shadbala, Ishta/Kashta Phala & Planetary Avasthas ---
export interface ShadbalaEntry {
  planet: Exclude<PlanetId, 'Rahu' | 'Ketu'>;
  sthanaBala: number; // Virupas
  digBala: number;
  kalaBala: number;
  chestaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  ratio: number;
  isStrong: boolean;
  uchchaBala: number;
  ishtaPhala: number;
  kashtaPhala: number;
  baladiAvastha: string;
  jagradadiAvastha: string;
  deeptadiAvastha: string;
}

const NAISARGIKA_BALA: Record<Exclude<PlanetId, 'Rahu' | 'Ketu'>, number> = {
  Sun: 60.0,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
};

const REQUIRED_RUPAS: Record<Exclude<PlanetId, 'Rahu' | 'Ketu'>, number> = {
  Sun: 6.5,
  Moon: 6.0,
  Mars: 5.0,
  Mercury: 7.0,
  Jupiter: 6.5,
  Venus: 5.5,
  Saturn: 5.0,
};

const EXALT_DEGREES: Record<Exclude<PlanetId, 'Rahu' | 'Ketu'>, number> = {
  Sun: 10, // Aries 10
  Moon: 33, // Taurus 3
  Mars: 298, // Capricorn 28
  Mercury: 165, // Virgo 15
  Jupiter: 95, // Cancer 5
  Venus: 357, // Pisces 27
  Saturn: 200, // Libra 20
};

export function calculateShadbalaAndAvasthas(kundli: KundliResult): ShadbalaEntry[] {
  const classical: Array<Exclude<PlanetId, 'Rahu' | 'Ketu'>> = [
    'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn',
  ];
  const sun = kundli.planets.find((p) => p.id === 'Sun')!;
  const moon = kundli.planets.find((p) => p.id === 'Moon')!;
  const isDayBirth = [7, 8, 9, 10, 11, 12].includes(sun.house);

  // Dig Bala zero-strength points (opposite of directional house)
  const digBestHouse: Record<Exclude<PlanetId, 'Rahu' | 'Ketu'>, number> = {
    Sun: 10,
    Mars: 10,
    Jupiter: 1,
    Mercury: 1,
    Moon: 4,
    Venus: 4,
    Saturn: 7,
  };

  return classical.map((pid) => {
    const p = kundli.planets.find((x) => x.id === pid)!;
    // 1. Uchcha Bala (0..60 virupas)
    const debilDeg = normalizeDeg(EXALT_DEGREES[pid] + 180);
    let diffFromDebil = Math.abs(p.longitude - debilDeg);
    if (diffFromDebil > 180) diffFromDebil = 360 - diffFromDebil;
    const uchchaBala = (diffFromDebil / 180) * 60;

    // Sthana Bala combines Uchcha + Kendra/Panaphara + Dignity + Ojayugma
    const kendradi = [1, 4, 7, 10].includes(p.house) ? 60 : [2, 5, 8, 11].includes(p.house) ? 30 : 15;
    const dignityBonus =
      p.dignity === 'Exalted' ? 75 : p.dignity === 'Own Sign' ? 60 : p.dignity === 'Friendly' ? 45 : p.dignity === 'Neutral' ? 30 : 15;
    const sthanaBala = uchchaBala + kendradi + dignityBonus;

    // 2. Dig Bala (0..60 virupas)
    const bestAngle = normalizeDeg(kundli.ascendant.longitude + (digBestHouse[pid] - 1) * 30);
    let digDiff = Math.abs(p.longitude - bestAngle);
    if (digDiff > 180) digDiff = 360 - digDiff;
    const digBala = Math.max(0, 60 - (digDiff / 180) * 60);

    // 3. Kala Bala (Natonnata + Paksha)
    const moonSunSep = normalizeDeg(moon.longitude - sun.longitude);
    const pakshaRaw = (moonSunSep <= 180 ? moonSunSep : 360 - moonSunSep) / 3; // 0..60
    const isBenefic = ['Moon', 'Mercury', 'Jupiter', 'Venus'].includes(pid);
    const pakshaBala = isBenefic ? pakshaRaw : 60 - pakshaRaw;
    const diurnalScore = ['Sun', 'Jupiter', 'Venus'].includes(pid)
      ? isDayBirth ? 60 : 20
      : ['Moon', 'Mars', 'Saturn'].includes(pid)
      ? !isDayBirth ? 60 : 20
      : 45;
    const kalaBala = pakshaBala + diurnalScore + 25;

    // 4. Chesta Bala (0..60 virupas)
    let chestaBala = 30;
    if (pid === 'Sun') chestaBala = Math.max(10, Math.min(60, 30 + (p.speedDegPerDay - 0.985) * 400));
    else if (pid === 'Moon') chestaBala = Math.max(15, Math.min(60, pakshaRaw));
    else if (p.isRetrograde) chestaBala = 60;
    else chestaBala = Math.max(12, Math.min(54, 28 + Math.abs(p.speedDegPerDay) * 20));

    // 5. Naisargika Bala
    const naisargikaBala = NAISARGIKA_BALA[pid];

    // 6. Drik Bala (net benefic vs malefic aspect score)
    let drikBala = 0;
    for (const other of kundli.planets) {
      if (other.id === pid) continue;
      if (other.aspectsHouses.includes(p.house)) {
        const benefic = ['Jupiter', 'Venus', 'Moon', 'Mercury'].includes(other.id);
        drikBala += benefic ? 12 : -8;
      }
    }

    const totalVirupas = Math.max(60, sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala);
    const totalRupas = Number((totalVirupas / 60).toFixed(2));
    const req = REQUIRED_RUPAS[pid];
    const ishtaPhala = Number(Math.sqrt(Math.max(0, uchchaBala) * Math.max(0, chestaBala)).toFixed(1));
    const kashtaPhala = Number(Math.sqrt(Math.max(0, 60 - uchchaBala) * Math.max(0, 60 - chestaBala)).toFixed(1));

    // Baladi Avastha (odd vs even sign 6-degree segments)
    const isOddSign = p.signIndex % 2 === 0;
    const seg = Math.min(4, Math.floor(p.degreeInSign / 6));
    const oddStates = ['Bala (Infant)', 'Kumara (Youth)', 'Yuva (Prime)', 'Vriddha (Aged)', 'Mrita (Dormant)'];
    const evenStates = [...oddStates].reverse();
    const baladiAvastha = isOddSign ? oddStates[seg] : evenStates[seg];

    const jagradadiAvastha =
      p.dignity === 'Exalted' || p.dignity === 'Own Sign'
        ? 'Jagrat (Awake)'
        : p.dignity === 'Friendly' || p.dignity === 'Neutral'
        ? 'Swapna (Dreaming)'
        : 'Sushupti (Deep Sleep)';

    const deeptadiAvastha = p.isCombust
      ? 'Vikala / Astha (Combust)'
      : p.dignity === 'Exalted'
      ? 'Deepta (Radiant)'
      : p.dignity === 'Own Sign'
      ? 'Swastha (Confident)'
      : p.dignity === 'Friendly'
      ? 'Mudita (Delighted)'
      : p.dignity === 'Neutral'
      ? 'Shanta (Peaceful)'
      : p.dignity === 'Enemy'
      ? 'Khala (Strained)'
      : 'Deena (Depressed)';

    return {
      planet: pid,
      sthanaBala: Number(sthanaBala.toFixed(1)),
      digBala: Number(digBala.toFixed(1)),
      kalaBala: Number(kalaBala.toFixed(1)),
      chestaBala: Number(chestaBala.toFixed(1)),
      naisargikaBala: Number(naisargikaBala.toFixed(1)),
      drikBala: Number(drikBala.toFixed(1)),
      totalVirupas: Number(totalVirupas.toFixed(1)),
      totalRupas,
      requiredRupas: req,
      ratio: Number((totalRupas / req).toFixed(2)),
      isStrong: totalRupas >= req,
      uchchaBala: Number(uchchaBala.toFixed(1)),
      ishtaPhala,
      kashtaPhala,
      baladiAvastha,
      jagradadiAvastha,
      deeptadiAvastha,
    };
  });
}
