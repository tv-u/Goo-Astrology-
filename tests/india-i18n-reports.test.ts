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
