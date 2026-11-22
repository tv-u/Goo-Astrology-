import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateKundli } from '../src/engine/ephemeris';
import {
  analyzeDegreePrecision,
  analyzeNakshatraLordRelationships,
  analyzeNakshatraPadaMatrix,
  calculateAshtakavarga,
  calculateBhavaChalitAndSripati,
  calculateJaiminiAnalysis,
  calculateKpAnalysis,
  calculateShadbalaAndAvasthas,
} from '../src/engine/vedicResearch';
import {
  analyzePlanetarySpeeds,
  calculateAspectStrengths,
  calculateCombustionDistances,
  compareNatalVsTransitDignity,
  detectPlanetaryStations,
  detectPlanetaryWar,
  findExactConjunctions,
  getMoonPhaseCalendar,
  getNakshatraPadaTransits,
  getPlanetaryIngresses,
  getRetrogradeShadowSummary,
  getUpcomingEclipses,
} from '../src/engine/planetaryIntelligence';
import {
  analyzeChildBirthNakshatra,
  calculateDailyHoras,
  calculateSpecialMuhuratChecks,
  compareParentChildKundli,
  generateAstronomicalCalendarYear,
  generateLifeAnalysis,
} from '../src/engine/lifeAndMuhurat';
import { analyzeDetailedCompatibilityExtras } from '../src/engine/ashtakoot';
import {
  compareAyanamshaEngines,
  processBulkKundliCsv,
  resolveHistoricalTimezone,
  resolveLocationCoordinates,
  runBirthDataAudit,
  runCalculationBenchmark,
  validateEphemerisEngine,
} from '../src/engine/dataTools';
import { ADVANCED_100_FEATURES } from '../src/data/featureRegistry';
import { SUPPORTED_LANGUAGES } from '../src/data/locales';
import { initializeDatabase } from '../server/db';
import {
  getPublicDatasetPayload,
  getSyncOverview,
  initializeSyncDatasets,
  rollbackDataset,
  runDatasetSync,
} from '../server/syncEngine';

const SAMPLE_NATIVE = {
  name: 'Aarav Sharma',
  date: '1995-08-15',
  time: '14:30',
  latitude: 28.6139,
  longitude: 77.209,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  placeName: 'New Delhi, India',
  ayanamsha: 'lahiri' as const,
};

test('Feature Registry & 12 Indian Languages Localization metadata are complete', () => {
  assert.equal(ADVANCED_100_FEATURES.length, 100);
  const codes = new Set(ADVANCED_100_FEATURES.map((f) => f.code));
  assert.equal(codes.size, 100);
  assert.equal(SUPPORTED_LANGUAGES.length, 12);
});

test('Category A (1–15): Vedic Research Engine invariants (Bhava, KP, Jaimini, SAV 337, Shadbala)', () => {
  const kundli = calculateKundli(SAMPLE_NATIVE);
  const degs = analyzeDegreePrecision(kundli);
  assert.equal(degs.length, 10); // Ascendant + 9 planets

  const padaMatrix = analyzeNakshatraPadaMatrix(kundli);
  assert.equal(padaMatrix.length, 9);

  const lordRels = analyzeNakshatraLordRelationships(kundli);
  assert.equal(lordRels.length, 9);

  const bhavas = calculateBhavaChalitAndSripati(kundli);
  assert.equal(bhavas.bhavaChalit.length, 12);
  assert.equal(bhavas.sripati.length, 12);

  const kp = calculateKpAnalysis(kundli);
  assert.equal(kp.cusps.length, 12);
  assert.equal(kp.planets.length, 10);

  const jaimini = calculateJaiminiAnalysis(kundli);
  assert.ok(jaimini.karakas.length >= 7);
  assert.ok(jaimini.karakamshaSignName.length > 0);
  assert.ok(jaimini.swamshaSignName.length > 0);

  const av = calculateAshtakavarga(kundli);
  assert.equal(Object.keys(av.bhinna).length, 7);
  assert.equal(av.sarva.length, 12);
  assert.equal(av.totalBindus, 337); // Classical Parashari SAV total invariant!

  const shadbala = calculateShadbalaAndAvasthas(kundli);
  assert.equal(shadbala.length, 7);
  for (const row of shadbala) {
    assert.ok(row.totalVirupas > 0 && row.totalRupas > 0);
  }
});

test('Category B (16–30): Planetary Intelligence (Speeds, Stations, Phases, Eclipses, Ingresses)', () => {
  const kundli = calculateKundli(SAMPLE_NATIVE);
  const war = detectPlanetaryWar(kundli.planets);
  assert.ok(Array.isArray(war));

  const speeds = analyzePlanetarySpeeds(kundli.planets);
  assert.equal(speeds.length, 9);

  const stations = detectPlanetaryStations('2026-01-01', 90);
  assert.ok(Array.isArray(stations));

  const conj = findExactConjunctions(kundli.planets, 15);
  assert.ok(Array.isArray(conj));

  const aspects = calculateAspectStrengths(kundli.planets);
  assert.ok(aspects.length > 0);

  const nakTransits = getNakshatraPadaTransits('2026-11-21');
  assert.equal(nakTransits.length, 9);

  const phases = getMoonPhaseCalendar('2026-11-21');
  assert.equal(phases.length, 8);

  const eclipses = getUpcomingEclipses('2026-01-01');
  assert.equal(eclipses.lunar.length, 4);
  assert.equal(eclipses.solar.length, 4);

  const ingresses = getPlanetaryIngresses('2026-01-01', 120);
  assert.ok(ingresses.length >= 5);

  const shadows = getRetrogradeShadowSummary(kundli.planets, '2026-11-21');
  assert.ok(shadows.length >= 1);

  const combustions = calculateCombustionDistances(kundli.planets);
  assert.equal(combustions.length, 6);

  const transitKundli = calculateKundli({ ...SAMPLE_NATIVE, date: '2026-11-21', time: '12:00' });
  const matrix = compareNatalVsTransitDignity(kundli, transitKundli);
  assert.equal(matrix.length, 9);
});

test('Categories C, D & E (31–70): Life Analysis, Calendar/Muhurat, Parent-Child & Compatibility Extras', () => {
  const parent = calculateKundli(SAMPLE_NATIVE);
  const child = calculateKundli({ ...SAMPLE_NATIVE, name: 'Diya Sharma', date: '2022-05-10', time: '08:15' });

  const life = generateLifeAnalysis(parent);
  assert.ok(life.lifeAreas.length >= 8);
  assert.equal(life.planetaryRanking.length, 7);

  const pc = compareParentChildKundli(parent, child);
  assert.ok(pc.guidance.length === 3);

  const childNak = analyzeChildBirthNakshatra(child);
  assert.ok(childNak.namingSyllable.length > 0);

  const horas = calculateDailyHoras('2026-11-21', 28.6139, 77.209, 330);
  assert.equal(horas.length, 24);

  const muhurat = calculateSpecialMuhuratChecks('2026-11-21', 0, 0);
  assert.ok(muhurat.taraBala.taraNumber >= 1 && muhurat.taraBala.taraNumber <= 9);
  assert.ok(muhurat.chandraBala.moonHouseFromNatal >= 1 && muhurat.chandraBala.moonHouseFromNatal <= 12);

  const cal = generateAstronomicalCalendarYear(2026);
  assert.ok(cal.events.length >= 30);
  assert.ok(cal.vivahMuhurats.length >= 1);
  assert.ok(cal.naamkaranMuhurats.length >= 5);

  const transit = calculateKundli({ ...SAMPLE_NATIVE, date: '2026-11-21', time: '12:00' });
  const extras = analyzeDetailedCompatibilityExtras(parent, child, transit);
  assert.equal(extras.coupleTransits.length, 7);
  assert.ok(extras.manglikCancellations.length === 3);
});

test('Category F (71–85): Ephemeris QA, Luxon Historical TZ/DST, Bulk CSV & Benchmark', () => {
  const qa = validateEphemerisEngine();
  assert.equal(qa.allPassed, true);
  assert.ok(qa.checks.length >= 3);

  const multiEngine = compareAyanamshaEngines(SAMPLE_NATIVE);
  assert.equal(multiEngine.length, 4);

  const geo = resolveLocationCoordinates('Mumbai');
  assert.ok(geo.length >= 1);

  // Check New York DST summer vs winter via Luxon
  const summer = resolveHistoricalTimezone('2025-07-15', '12:00', 'America/New_York');
  const winter = resolveHistoricalTimezone('2025-01-15', '12:00', 'America/New_York');
  assert.equal(summer.isInDST, true);
  assert.equal(summer.offsetMinutes, -240);
  assert.equal(winter.isInDST, false);
  assert.equal(winter.offsetMinutes, -300);

  const audit = runBirthDataAudit(SAMPLE_NATIVE, calculateKundli(SAMPLE_NATIVE));
  assert.equal(audit.schemaValid, true);
  assert.ok(audit.auditTrail.julianDay > 2400000);

  const bench = runCalculationBenchmark(10);
  assert.equal(bench.iterations, 10);
  assert.ok(bench.totalMs >= 0);

  const csvRows = processBulkKundliCsv(
    'name,date,time,place,latitude,longitude,tzOffsetMinutes\nAarav,1995-08-15,14:30,New Delhi,28.6139,77.2090,330\nBadRow,invalid,12:00,Nowhere,0,0,0'
  );
  assert.equal(csvRows.length, 2);
  assert.equal(csvRows[0].status, 'ok');
  assert.equal(csvRows[1].status, 'error');
});

test('Sync Engine (F-79..82): Schema validation, corrupt recovery fallback, versioning & rollback', () => {
  initializeDatabase();
  initializeSyncDatasets();

  const initialOverview = getSyncOverview();
  assert.ok(initialOverview.datasets.length >= 5);

  const dsPayload = getPublicDatasetPayload('indian_cities_coordinates');
  assert.ok(dsPayload && dsPayload.payload.records.length >= 50);

  const synced = runDatasetSync({ datasetKey: 'indian_cities_coordinates' });
  assert.equal(synced.length, 1);
  assert.equal(synced[0].status, 'updated');

  const recovered = runDatasetSync({ datasetKey: 'indian_cities_coordinates', simulateCorruptPayload: true });
  assert.equal(recovered[0].status, 'recovered_fallback');

  const rolled = rollbackDataset('indian_cities_coordinates');
  assert.equal(rolled.ok, true);
});
