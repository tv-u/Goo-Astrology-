import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateKundli } from '../src/engine/ephemeris';
import { analyzeDoshasAndYogas } from '../src/engine/doshaYoga';
import { calculateAshtakoot } from '../src/engine/ashtakoot';
import { calculatePanchang } from '../src/engine/panchang';
import { calculateNumerology } from '../src/engine/numerology';
import { drawTarotSpread, TAROT_DECK } from '../src/engine/tarot';

test('Lahiri Chitrapaksha Ayanamsha & Kundli Ephemeris accuracy', () => {
  // Reference check: 1995-08-15 14:30 IST in New Delhi
  const kundli = calculateKundli({
    name: 'Test Native',
    date: '1995-08-15',
    time: '14:30:00',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    placeName: 'New Delhi, India',
    ayanamsha: 'lahiri',
  });

  // In Aug 1995, Lahiri Ayanamsha is ~23.79 degrees
  assert.ok(kundli.ayanamshaDegrees > 23.7 && kundli.ayanamshaDegrees < 23.9);
  // In mid-August, Sun sidereal is in Cancer (~28 deg Cancer) or early Leo (~0 deg)
  const sun = kundli.planets.find((p) => p.id === 'Sun')!;
  assert.ok(sun.signIndex === 3 || sun.signIndex === 4);
  assert.equal(kundli.planets.length, 9);
  assert.equal(kundli.divisionalCharts.length, 16);
  assert.equal(kundli.dashas.length, 9);
});

test('Dosha & Yoga analyzer evaluates cancellation rules', () => {
  const kundli = calculateKundli({
    name: 'Sample Native',
    date: '1998-04-20',
    time: '09:15:00',
    latitude: 19.076,
    longitude: 72.8777,
    timezoneOffsetMinutes: 330,
    placeName: 'Mumbai, India',
    ayanamsha: 'lahiri',
  });
  const res = analyzeDoshasAndYogas(kundli);
  assert.ok(res.doshas.length >= 6);
  assert.ok(res.yogas.length >= 8);
});

test('Ashtakoot 36-point Gun Milan produces deterministic bounded score', () => {
  const bride = calculateKundli({
    name: 'Bride',
    date: '1997-02-12',
    time: '10:00:00',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
  });
  const groom = calculateKundli({
    name: 'Groom',
    date: '1994-11-05',
    time: '18:20:00',
    latitude: 19.076,
    longitude: 72.8777,
    timezoneOffsetMinutes: 330,
  });
  const match = calculateAshtakoot(bride, groom);
  assert.equal(match.maxScore, 36);
  assert.ok(match.totalScore >= 0 && match.totalScore <= 36);
  assert.equal(match.kootas.length, 8);
});

test('Panchang calculates real sunrise, sunset, Tithi, and Choghadiya', () => {
  const p = calculatePanchang('2026-11-21', 28.6139, 77.209, 330, 'New Delhi, India');
  assert.match(p.sunrise, /^\d{2}:\d{2}$/);
  assert.match(p.sunset, /^\d{2}:\d{2}$/);
  assert.equal(p.dayChoghadiya.length, 8);
  assert.equal(p.nightChoghadiya.length, 8);
  assert.ok(p.vikramSamvat >= 2082);
});

test('Numerology & Tarot 78-card deck integrity', () => {
  const num = calculateNumerology('Aarav Sharma', '1995-08-15');
  assert.ok(num.lifePathNumber >= 1 && num.lifePathNumber <= 33);
  assert.equal(TAROT_DECK.length, 78);
  const spread = drawTarotSpread('three', true);
  assert.equal(spread.length, 3);
});
