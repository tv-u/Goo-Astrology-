import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INDIA_STATES_AND_UTS,
  findNearestVerifiedCity,
  getIndiaLocationCoverageSummary,
  haversineDistanceKm,
  resolveIndiaLocation,
} from '../src/data/indiaLocations';
import { CITIES_DATASET, searchCities } from '../src/data/cities';
import { LOCALE_STRINGS, SUPPORTED_LANGUAGES } from '../src/data/locales';
import {
  VEDIC_MULTILINGUAL_GLOSSARY,
  auditMultilingualCompleteness,
  formatLocalizedDate,
  formatLocalizedNumber,
  searchVedicGlossary,
  translateDictKey,
} from '../src/engine/i18nKnowledge';
import {
  buildKundliPdfDocument,
  buildUnicodePrintableHtml,
  containsNonLatinScript,
  sanitizeTextForStandardPdfFont,
  validateReportSpec,
} from '../src/utils/reportExporter';
import {
  ACADEMY_CURRICULUM,
  gradeAcademyQuiz,
  runReferenceVerificationSuite,
} from '../src/engine/academyAndVerification';
import {
  PLATFORM_350_FEATURES,
  getRegistrySummary,
} from '../src/data/featureRegistry';
import {
  buildAstrologyCalendarIcs,
  calculateLifetimeSadeSatiTimeline,
  calculatePrashnaKundli,
  calculateVarshaphal,
} from '../src/engine/prashnaAndVarshaphal';
import { generateAstronomicalCalendarYear } from '../src/engine/lifeAndMuhurat';
import {
  isValidMonetagDirectUrl,
  isValidMonetagMetaToken,
  isValidMonetagZoneId,
  sanitizeAdsTxtContent,
  validateAdPlacementConfig,
} from '../src/utils/adConfig';
import { calculateKundli } from '../src/engine/ephemeris';
import {
  analyzeSensitiveAndCriticalDegrees,
  calculateArudhaPadas,
  calculateAshtottariDasha,
  calculateBhriguBindu,
  calculateCharaDasha,
  calculateKalachakraDasha,
  calculateKakshyaTransitScores,
  calculateKpHorary249,
  calculateNarayanaDasha,
  calculatePanchadhaMaitri,
  calculatePanchapakshi,
  calculateYoginiDasha,
} from '../src/engine/advancedVedic60';
import {
  calculateDailyAlmanacChecks,
  compareDrikVsSuryaSiddhanta,
  findPurposeMuhurats,
  findSpecialAstronomicalYogas,
  getRegionalIndianCalendars,
  runBirthTimeRectification,
} from '../src/engine/muhuratExtended60';
import {
  MAHAVASTU_16_ZONES,
  SWAPNA_SHASTRA_DREAMS,
  calculateLoShuGrid,
  compareMultiPartnerMatrix,
  evaluateChaldeanIdentifier,
  recommendGemstonesAndRudraksha,
} from '../src/engine/lifestyleAndRemedies60';

test('Domain H: Complete 28 States + 8 Union Territories & Gazetteer Alias/Ambiguity Resolution', () => {
  const states = INDIA_STATES_AND_UTS.filter((r) => r.type === 'State');
  const uts = INDIA_STATES_AND_UTS.filter((r) => r.type === 'Union Territory');
  assert.equal(states.length, 28);
  assert.equal(uts.length, 8);
  assert.equal(INDIA_STATES_AND_UTS.length, 36);

  const cov = getIndiaLocationCoverageSummary();
  assert.equal(cov.totalStates, 28);
  assert.equal(cov.totalUnionTerritories, 8);
  assert.equal(cov.totalIndiaRegionsCovered, 36);
  assert.ok(cov.verifiedCitiesCount >= 65);
  assert.ok(cov.aliasesSupportedCount >= 20);
  assert.ok(CITIES_DATASET.length >= cov.verifiedCitiesCount);

  // Historical / alternate city aliases
  const bombay = resolveIndiaLocation('Bombay');
  assert.equal(bombay.resolvedByAlias, true);
  assert.equal(bombay.matches[0]?.city, 'Mumbai');

  const kashi = resolveIndiaLocation('Kashi');
  assert.equal(kashi.resolvedByAlias, true);
  assert.equal(kashi.matches[0]?.city, 'Varanasi');

  const allahabad = resolveIndiaLocation('Allahabad');
  assert.equal(allahabad.resolvedByAlias, true);
  assert.equal(allahabad.matches[0]?.city, 'Prayagraj');

  const madras = resolveIndiaLocation('Madras');
  assert.equal(madras.resolvedByAlias, true);
  assert.equal(madras.matches[0]?.city, 'Chennai');

  // Ambiguous city detection (Aurangabad MH vs BR, Hamirpur HP vs UP)
  const aurangabad = resolveIndiaLocation('Aurangabad');
  assert.equal(aurangabad.ambiguous, true);
  assert.ok(aurangabad.matches.length >= 2);

  const hamirpur = resolveIndiaLocation('Hamirpur');
  assert.equal(hamirpur.ambiguous, true);
  assert.ok(hamirpur.matches.length >= 2);

  // Haversine & nearest-city calculation (Mumbai -> Pune ~120 km)
  const distKm = haversineDistanceKm(19.076, 72.8777, 18.5204, 73.8567);
  assert.ok(distKm > 110 && distKm < 135);

  const nearest = findNearestVerifiedCity(28.61, 77.21);
  assert.equal(nearest.withinIndiaBoundingBox, true);
  assert.equal(nearest.city.city, 'New Delhi');

  assert.ok(searchCities('Jaipur').length >= 1);
});

test('Domain J: 12 Indian Languages Completeness, Glossary & Localized Formatting', () => {
  assert.equal(SUPPORTED_LANGUAGES.length, 12);
  const audit = auditMultilingualCompleteness();
  assert.equal(audit.length, 12);

  const enKeys = Object.keys(LOCALE_STRINGS.en);
  assert.ok(enKeys.length >= 39);

  for (const row of audit) {
    assert.equal(row.uiCoveragePct, 100, `Language ${row.code} missing UI translations`);
    assert.equal(row.glossaryTermsTranslated, VEDIC_MULTILINGUAL_GLOSSARY.length);
  }

  assert.equal(translateDictKey('hi', 'freeKundli'), LOCALE_STRINGS.hi.freeKundli);
  assert.equal(translateDictKey('ta', 'panchang'), LOCALE_STRINGS.ta.panchang);
  assert.ok(searchVedicGlossary('Nakshatra').length >= 1);

  const fmtNum = formatLocalizedNumber(123456, 'hi');
  assert.ok(fmtNum.length > 0);
  const fmtDate = formatLocalizedDate('2026-03-20', 'en');
  assert.ok(fmtDate.includes('2026'));
});

test('Domain K: Report Studio Validation, Sanitized PDF Bytes & Unicode Printable HTML', () => {
  assert.throws(() =>
    validateReportSpec({
      title: '',
      subtitle: 'Sub',
      metadataLines: [],
      sections: [{ heading: 'A', rows: ['Row 1'] }],
      filename: 'out.pdf',
    })
  );

  assert.throws(() =>
    validateReportSpec({
      title: 'Test Report',
      subtitle: 'Sub',
      metadataLines: [],
      sections: [{ heading: 'Empty', rows: [] }],
      filename: 'out.pdf',
    })
  );

  assert.equal(containsNonLatinScript('मेष लग्न'), true);
  assert.equal(containsNonLatinScript('Aries 14°22′10″'), false);
  const sanitized = sanitizeTextForStandardPdfFont('Aries 14°22′10″ → Vrishabha');
  assert.ok(sanitized.includes("14°22'10\" -> Vrishabha"));

  const pdf = buildKundliPdfDocument({
    title: 'Sample Birth Chart Report',
    subtitle: 'Generated 2026',
    metadataLines: ['Subject: Aarav Sharma', 'Place: New Delhi'],
    sections: [
      {
        heading: 'Planetary Longitudes',
        rows: ['Ascendant: Libra 15°20\'', 'Sun: Cancer 28°10\''],
      },
    ],
    filename: 'sample.pdf',
  });
  const pdfOutput = pdf.output('arraybuffer');
  const headerText = new TextDecoder().decode(new Uint8Array(pdfOutput).slice(0, 5));
  assert.equal(headerText, '%PDF-');

  const unicodeHtml = buildUnicodePrintableHtml({
    title: 'जन्म कुंडली रिपोर्ट (Aarav Sharma)',
    subtitle: 'संस्कृत एवं हिन्दी प्रतिवेदन',
    metadataLines: ['स्थान: वाराणसी'],
    sections: [{ heading: 'मुख्य ग्रह', rows: ['लग्न: मेष | चंद्र: रोहिणी'] }],
    filename: 'unicode.html',
  });
  assert.ok(unicodeHtml.includes('जन्म कुंडली रिपोर्ट'));
  assert.ok(unicodeHtml.includes('रोहिणी'));
});

test('Domains I & L: 12 Reference Verification Checks & Jyotish Academy Curriculum', () => {
  const verification = runReferenceVerificationSuite();
  assert.equal(verification.total, 12);
  assert.equal(verification.allPassed, true);
  assert.equal(verification.failed, 0);

  assert.equal(ACADEMY_CURRICULUM.length, 12);
  const perfectAnswers: Record<string, number> = {};
  for (const lesson of ACADEMY_CURRICULUM) {
    perfectAnswers[lesson.id] = lesson.correctOptionIndex;
  }
  const perfectGrade = gradeAcademyQuiz(perfectAnswers);
  assert.equal(perfectGrade.scorePct, 100);
  assert.equal(perfectGrade.levelBadge, 'Jyotish Acharya Readiness');

  const partialGrade = gradeAcademyQuiz({ 'L-01': ACADEMY_CURRICULUM[0].correctOptionIndex });
  assert.equal(partialGrade.answered, 1);
  assert.equal(partialGrade.correct, 1);
});

test('350-Module Registry: Exact Count, Unique Codes, Honest Status Classification', () => {
  assert.equal(PLATFORM_350_FEATURES.length, 350);

  const codes = new Set(PLATFORM_350_FEATURES.map((m) => m.code));
  const numbers = new Set(PLATFORM_350_FEATURES.map((m) => m.number));
  assert.equal(codes.size, 350);
  assert.equal(numbers.size, 350);

  const summary = getRegistrySummary();
  assert.equal(summary.totalModules, 350);
  assert.equal(
    summary.counts.WORKING + summary.counts.PARTIALLY_IMPLEMENTED + summary.counts.BLOCKED +
      summary.counts.UI_ONLY + summary.counts.NOT_IMPLEMENTED + summary.counts.FAILED,
    350
  );

  // Verify blocked external features are NEVER falsely labeled WORKING
  const webrtc = PLATFORM_350_FEATURES.find((m) => m.code === 'CORE-24');
  assert.equal(webrtc?.implementationStatus, 'BLOCKED');

  const census = PLATFORM_350_FEATURES.find((m) => m.code === 'H-120');
  assert.equal(census?.implementationStatus, 'BLOCKED');

  const astrologersDir = PLATFORM_350_FEATURES.find((m) => m.code === 'CORE-22');
  assert.equal(astrologersDir?.implementationStatus, 'PARTIALLY_IMPLEMENTED');
});

test('Prashna Horary, Varshaphal Solar Return (<0.001°), 90-Yr Sade Sati & RFC-5545 .ICS Calendar', () => {
  const prashna = calculatePrashnaKundli({
    questionCategory: 'career',
    date: '2026-05-14',
    time: '10:15:00',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    placeName: 'New Delhi, India',
  });
  assert.equal(prashna.questionCategory.houseNumber, 10);
  assert.ok(prashna.favorableScore >= 12 && prashna.favorableScore <= 96);
  assert.ok(prashna.classicalFactors.length >= 2);
  assert.ok(prashna.horaLord.length >= 3);

  const varsha = calculateVarshaphal(
    {
      name: 'Test Subject',
      date: '1995-08-15',
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 330,
      placeName: 'New Delhi, India',
      ayanamsha: 'lahiri',
    },
    2026
  );
  assert.equal(varsha.targetYear, 2026);
  assert.equal(varsha.ageAtReturn, 31);
  assert.ok(varsha.solarReturnErrorArcsec < 3.6, `Expected < 0.001 deg error, got ${varsha.solarReturnErrorArcsec} arcsec`);
  assert.equal(varsha.muddaDashas.length, 9);

  const timeline = calculateLifetimeSadeSatiTimeline(1995, 0, 90);
  assert.ok(timeline.length >= 6, 'Expected multiple Sade Sati & Dhaiya cycles over 90 years');

  const cal = generateAstronomicalCalendarYear(2026);
  const ics = buildAstrologyCalendarIcs(cal.events.slice(0, 5), 2026);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('BEGIN:VEVENT'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:'));
  assert.ok(ics.trim().endsWith('END:VCALENDAR'));
});

test('Monetag & AdSlot Configuration Security Validation (Strict Allowlist & Zero XSS)', () => {
  assert.equal(isValidMonetagMetaToken('a9b8c7d6e5f4123456'), true);
  assert.equal(isValidMonetagMetaToken('<script>alert(1)</script>'), false);

  assert.equal(isValidMonetagZoneId('9123456'), true);
  assert.equal(isValidMonetagZoneId('abc123'), false);

  const validMonetag = validateAdPlacementConfig({
    placement: 'homepage',
    enabled: true,
    networkCode: 'monetag',
    adSlotId: '9123456',
  });
  assert.equal(validMonetag.valid, true);

  const xssRejected = validateAdPlacementConfig({
    placement: 'header',
    enabled: true,
    networkCode: 'monetag',
    adSlotId: 'https://evil.example.com/payload.js',
  });
  assert.equal(xssRejected.valid, false);

  const htmlRejected = validateAdPlacementConfig({
    placement: 'footer',
    enabled: true,
    networkCode: 'monetag',
    adSlotId: '<script>evil()</script>',
  });
  assert.equal(htmlRejected.valid, false);

  const cleanAdsTxt = sanitizeAdsTxtContent(
    'monetag.com, 123456, DIRECT, f08c47fec0942fa0\n<script>bad</script>\nevil line without comma'
  );
  assert.equal(cleanAdsTxt, 'monetag.com, 123456, DIRECT, f08c47fec0942fa0');

  assert.equal(isValidMonetagDirectUrl('https://uplcm.com/4/12282219'), true);
  assert.equal(isValidMonetagDirectUrl('http://uplcm.com/4/12282219'), false);
  assert.equal(isValidMonetagDirectUrl('https://evil-phishing.example.com/123'), false);
  assert.equal(isValidMonetagDirectUrl('javascript:alert(1)'), false);
});

test('60 Advanced Features Engines: Jaimini, Conditional Dashas, KP 249, Muhurats, Lo Shu & MahaVastu', () => {
  const birth = {
    name: 'Test Subject',
    date: '1995-08-15',
    time: '14:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    placeName: 'New Delhi, India',
  };
  const kundli = calculateKundli(birth);

  assert.equal(calculateCharaDasha(kundli).length, 12);
  assert.equal(calculateArudhaPadas(kundli).length, 12);
  assert.equal(calculateYoginiDasha(kundli).length, 8);
  assert.equal(calculateAshtottariDasha(kundli).length, 8);
  assert.equal(calculateKalachakraDasha(kundli).sequence.length, 9);
  assert.equal(calculateNarayanaDasha(kundli).rows.length, 12);
  assert.equal(calculateKakshyaTransitScores(kundli, '2026-05-15').length, 7);
  assert.ok(calculateBhriguBindu(kundli).signName.length >= 3);
  assert.equal(calculatePanchapakshi(kundli, '2026-05-15').yamaSlots.length, 5);

  const sens = analyzeSensitiveAndCriticalDegrees(kundli);
  assert.equal(sens.planetChecks.length, 9);
  assert.ok(sens.ishtaDevata.length > 5);
  assert.equal(calculatePanchadhaMaitri(kundli).length, 7);

  const kp249 = calculateKpHorary249(108, birth);
  assert.equal(kp249.horaryNumber, 108);
  assert.ok(kp249.rulingPlanets.length >= 3);

  assert.ok(findPurposeMuhurats('griha_pravesh', 2026, 5).length >= 1);
  assert.ok(calculateDailyAlmanacChecks('2026-05-15').agniVaas.residence.length > 3);
  assert.ok(Math.abs(compareDrikVsSuryaSiddhanta('2026-05-15').sunDifferenceDeg) < 25);
  assert.equal(getRegionalIndianCalendars('2026-05-15').length, 6);
  assert.ok(findSpecialAstronomicalYogas(2026).yogas.length >= 10);
  assert.equal(runBirthTimeRectification(birth, [{ year: 2021, category: 'career' }], 30).length, 7);

  assert.equal(
    compareMultiPartnerMatrix(birth, [
      { ...birth, name: 'Cand 1', date: '1997-04-06' },
      { ...birth, name: 'Cand 2', date: '1996-11-18' },
    ]).length,
    2
  );
  assert.ok(recommendGemstonesAndRudraksha(kundli).length >= 1);
  assert.equal(calculateLoShuGrid('1995-08-15').arrows.length, 5);
  assert.equal(evaluateChaldeanIdentifier('DL01AB1234', 'vehicle').category, 'vehicle');
  assert.equal(MAHAVASTU_16_ZONES.length, 16);
  assert.ok(SWAPNA_SHASTRA_DREAMS.length >= 10);
});

test('Portal Expansion: 84-Panel Horoscopes, Tamil 10-Porutham, Ramshalaka, Feng Shui Kua, Swarodaya, Ayurveda & Brihat Kundli PDF', async () => {
  const { getChineseHoroscopeAnnual, getInterpretedHoroscopes, getPersonalizedHoroscope } = await import('../src/data/horoscopes');
  const {
    SACRED_TEXTS,
    analyzeAyurvedaAndHealing,
    calculateFengShuiKua,
    calculateSwarodayaCycle,
    calculateTamilPorutham,
    consultDevotionalOracle,
    consultHanumanPrashna,
    consultRamshalaka,
  } = await import('../src/engine/spiritualAndHealing');
  const { buildBrihatKundliReportSpec } = await import('../src/utils/reportExporter');

  // 12 signs x 8 periods + personalized + Chinese 2026/2027
  const list = getInterpretedHoroscopes('2026-05-15');
  assert.equal(list.length, 12);
  assert.ok(list[0].nextWeek.length > 20);
  assert.ok(list[0].nextMonth.length > 20);
  assert.ok(list[0].yearly2026.includes('2026'));
  assert.ok(list[0].yearly2027.includes('2027'));

  const personal = getPersonalizedHoroscope('Ananya', 'Female', '1995-08-15');
  assert.ok(personal.moonSign.length > 3);
  assert.ok(personal.personalDailyOutlook.includes('Ananya'));

  const cn = getChineseHoroscopeAnnual(1995, 2026);
  assert.equal(cn.yearAnimal, 'Fire Horse (2026)');
  assert.ok(cn.outlook.length > 20);

  // Tamil 10-Porutham
  const porutham = calculateTamilPorutham(
    { name: 'Bride', date: '1997-04-06', time: '09:15', latitude: 13.0827, longitude: 80.2707, timezoneOffsetMinutes: 330 },
    { name: 'Groom', date: '1995-08-15', time: '14:30', latitude: 9.9252, longitude: 78.1198, timezoneOffsetMinutes: 330 }
  );
  assert.equal(porutham.items.length, 10);
  assert.ok(porutham.totalPassed >= 0 && porutham.totalPassed <= 10);

  // Ramshalaka, Hanuman 49, Ganesha/Sai, Sacred Texts
  const ram = consultRamshalaka(4, 7);
  assert.equal(ram.row, 5);
  assert.ok(ram.verse.length > 10);
  assert.equal(consultHanumanPrashna(21).cellNumber, 21);
  assert.ok(consultDevotionalOracle('ganesha', 'Should I start study?').message.length > 15);
  assert.ok(SACRED_TEXTS.length >= 4);

  // Feng Shui Kua, Swarodaya & Ayurveda
  const kua = calculateFengShuiKua(1995, 'female');
  assert.ok(kua.kuaNumber >= 1 && kua.kuaNumber <= 9 && kua.kuaNumber !== 5);
  assert.equal(kua.favorableDirections.length, 4);

  const swara = calculateSwarodayaCycle('2026-05-15', 1.5);
  assert.ok(['Ida (Left / Chandra)', 'Pingala (Right / Surya)', 'Sushumna (Center Transition)'].includes(swara.currentHourSwara));

  const kundli = calculateKundli({
    name: 'Brihat Subject',
    date: '1995-08-15',
    time: '14:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
  });
  const ayur = analyzeAyurvedaAndHealing(kundli);
  assert.ok(['Vata', 'Pitta', 'Kapha'].includes(ayur.dominantDosha));

  const brihatSpec = buildBrihatKundliReportSpec(kundli, { targetYear: 2026 });
  assert.equal(brihatSpec.sections.length, 6);
  const brihatPdf = buildKundliPdfDocument(brihatSpec);
  const header = new TextDecoder().decode(new Uint8Array(brihatPdf.output('arraybuffer')).slice(0, 5));
  assert.equal(header, '%PDF-');
});

