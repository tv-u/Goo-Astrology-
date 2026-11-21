import * as Astronomy from 'astronomy-engine';
import {
  HINDU_MONTHS,
  NAKSHATRAS,
  NITYA_YOGAS,
  TITHI_NAMES,
  ZODIAC_SIGNS,
} from './constants';
import {
  dateToJulianDay,
  getAyanamshaDegrees,
  normalizeDeg,
} from './ephemeris';

export interface ChoghadiyaSlot {
  name: string;
  hindiName: string;
  quality: 'Good' | 'Neutral' | 'Avoid';
  startTime: string;
  endTime: string;
}

export interface PanchangResult {
  date: string;
  placeName: string;
  timezoneOffsetMinutes: number;
  vara: { name: string; hindiName: string; lord: string };
  tithi: { index: number; name: string; paksha: 'Shukla Paksha' | 'Krishna Paksha'; percentElapsed: number };
  nakshatra: { index: number; name: string; hindiName: string; pada: number; lord: string };
  yoga: { index: number; name: string };
  karana: { name: string };
  hinduMonth: string;
  vikramSamvat: number;
  shakaSamvat: number;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  brahmaMuhurat: string;
  abhijitMuhurat: string;
  rahuKaal: string;
  yamaganda: string;
  gulikaKaal: string;
  amritKaal: string;
  dayChoghadiya: ChoghadiyaSlot[];
  nightChoghadiya: ChoghadiyaSlot[];
  specialEvents: string[];
  sunSign: string;
  moonSign: string;
}

const WEEKDAYS = [
  { name: 'Sunday', hindiName: 'रविवार', lord: 'Sun' },
  { name: 'Monday', hindiName: 'सोमवार', lord: 'Moon' },
  { name: 'Tuesday', hindiName: 'मंगलवार', lord: 'Mars' },
  { name: 'Wednesday', hindiName: 'बुधवार', lord: 'Mercury' },
  { name: 'Thursday', hindiName: 'गुरुवार', lord: 'Jupiter' },
  { name: 'Friday', hindiName: 'शुक्रवार', lord: 'Venus' },
  { name: 'Saturday', hindiName: 'शनिवार', lord: 'Saturn' },
];

const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti (Bhadra)',
];

// Choghadiya sequences (0=Sun .. 6=Sat)
const CHOGHADIYA_META: Record<string, { hindi: string; quality: 'Good' | 'Neutral' | 'Avoid' }> = {
  Udveg: { hindi: 'उद्वेग', quality: 'Avoid' },
  Char: { hindi: 'चर', quality: 'Neutral' },
  Labh: { hindi: 'लाभ', quality: 'Good' },
  Amrit: { hindi: 'अमृत', quality: 'Good' },
  Kaal: { hindi: 'काल', quality: 'Avoid' },
  Shubh: { hindi: 'शुभ', quality: 'Good' },
  Rog: { hindi: 'रोग', quality: 'Avoid' },
};

const DAY_CHOGHADIYA_START: Record<number, string[]> = {
  0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
  2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
  4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
  5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],
};

const NIGHT_CHOGHADIYA_START: Record<number, string[]> = {
  0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
  1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],
  2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],
  3: ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],
  4: ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],
  5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],
  6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],
};

function formatLocalTime(utcMs: number, tzOffsetMin: number): string {
  const local = new Date(utcMs + tzOffsetMin * 60000);
  const hh = String(local.getUTCHours()).padStart(2, '0');
  const mm = String(local.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function calculatePanchang(
  dateStr: string,
  latitude: number,
  longitude: number,
  timezoneOffsetMinutes: number,
  placeName: string
): PanchangResult {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Local midnight in UTC
  const localMidnightUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0) - timezoneOffsetMinutes * 60000;
  const searchStart = new Date(localMidnightUtcMs);
  const observer = new Astronomy.Observer(latitude, longitude, 0);

  const sunriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, searchStart, 1);
  const sunsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, searchStart, 1);
  const nextSunriseResult = Astronomy.SearchRiseSet(
    Astronomy.Body.Sun,
    observer,
    +1,
    new Date(localMidnightUtcMs + 24 * 3600 * 1000),
    1
  );
  const moonriseResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, searchStart, 1);
  const moonsetResult = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, searchStart, 1);

  const sunriseMs = sunriseResult ? sunriseResult.date.getTime() : localMidnightUtcMs + 6 * 3600000;
  const sunsetMs = sunsetResult ? sunsetResult.date.getTime() : localMidnightUtcMs + 18 * 3600000;
  const nextSunriseMs = nextSunriseResult
    ? nextSunriseResult.date.getTime()
    : sunriseMs + 24 * 3600000;

  // Evaluate lunar/solar positions at local Sunrise (standard Vedic Udita Panchang)
  const evalDate = new Date(sunriseMs);
  const jd = dateToJulianDay(evalDate);
  const ayanamsha = getAyanamshaDegrees(jd, 'lahiri');
  const astroTime = Astronomy.MakeTime(evalDate);

  const sunTrop = Astronomy.SunPosition(astroTime).elon;
  const moonTrop = Astronomy.EclipticGeoMoon(astroTime).lon;
  const sunSid = normalizeDeg(sunTrop - ayanamsha);
  const moonSid = normalizeDeg(moonTrop - ayanamsha);

  // Tithi (0..29)
  const elong = normalizeDeg(moonSid - sunSid);
  const tithiIdx = Math.floor(elong / 12);
  const tithiPercent = Math.round(((elong % 12) / 12) * 100);
  const paksha = tithiIdx < 15 ? 'Shukla Paksha' : 'Krishna Paksha';

  // Nakshatra (0..26)
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSid / nakSpan);
  const pada = Math.floor((moonSid % nakSpan) / (nakSpan / 4)) + 1;

  // Yoga (0..26)
  const yogaAngle = normalizeDeg(sunSid + moonSid);
  const yogaIdx = Math.floor(yogaAngle / nakSpan);

  // Karana (0..59 half-tithis)
  const halfTithi = Math.floor(elong / 6);
  let karanaName = '';
  if (halfTithi === 0) karanaName = 'Kimstughna';
  else if (halfTithi === 57) karanaName = 'Shakuni';
  else if (halfTithi === 58) karanaName = 'Chatushpada';
  else if (halfTithi === 59) karanaName = 'Naga';
  else karanaName = KARANA_NAMES[(halfTithi - 1) % 7];

  // Vara (weekday in local calendar)
  const localDayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const vara = WEEKDAYS[localDayOfWeek];

  // Dynamic Muhurats from Sunrise-Sunset span
  const dayDuration = sunsetMs - sunriseMs;
  const nightDuration = nextSunriseMs - sunsetMs;
  const eighthDay = dayDuration / 8;

  const rahuSlotMap = [7, 1, 6, 4, 5, 3, 2]; // 0-indexed out of 8 segments (Sun..Sat)
  const yamaSlotMap = [3, 2, 1, 0, 6, 5, 4];
  const gulikaSlotMap = [6, 5, 4, 3, 2, 1, 0];

  const fmtRange = (start: number, end: number) =>
    `${formatLocalTime(start, timezoneOffsetMinutes)} – ${formatLocalTime(end, timezoneOffsetMinutes)}`;

  const rahuSlot = rahuSlotMap[localDayOfWeek];
  const yamaSlot = yamaSlotMap[localDayOfWeek];
  const gulikaSlot = gulikaSlotMap[localDayOfWeek];

  const solarNoon = sunriseMs + dayDuration / 2;
  const abhijitHalf = dayDuration / 30; // ~24 min each side
  const brahmaStart = sunriseMs - 96 * 60000;
  const brahmaEnd = sunriseMs - 48 * 60000;

  // Amrit Kaal approximation (depends on Nakshatra)
  const amritOffsetHrs = ((nakIdx % 7) + 2) * 1.4;
  const amritStart = sunriseMs + amritOffsetHrs * 3600000;
  const amritEnd = amritStart + 90 * 60000;

  const dayChoghadiya: ChoghadiyaSlot[] = DAY_CHOGHADIYA_START[localDayOfWeek].map((name, i) => ({
    name,
    hindiName: CHOGHADIYA_META[name].hindi,
    quality: CHOGHADIYA_META[name].quality,
    startTime: formatLocalTime(sunriseMs + i * eighthDay, timezoneOffsetMinutes),
    endTime: formatLocalTime(sunriseMs + (i + 1) * eighthDay, timezoneOffsetMinutes),
  }));

  const eighthNight = nightDuration / 8;
  const nightChoghadiya: ChoghadiyaSlot[] = NIGHT_CHOGHADIYA_START[localDayOfWeek].map((name, i) => ({
    name,
    hindiName: CHOGHADIYA_META[name].hindi,
    quality: CHOGHADIYA_META[name].quality,
    startTime: formatLocalTime(sunsetMs + i * eighthNight, timezoneOffsetMinutes),
    endTime: formatLocalTime(sunsetMs + (i + 1) * eighthNight, timezoneOffsetMinutes),
  }));

  // Hindu Lunar Month & Samvat
  const sunSignIdx = Math.floor(sunSid / 30);
  const moonSignIdx = Math.floor(moonSid / 30);
  const hinduMonth = HINDU_MONTHS[(sunSignIdx + 1) % 12];
  const vikramSamvat = m > 3 || (m === 3 && d >= 22) ? y + 57 : y + 56;
  const shakaSamvat = m > 3 || (m === 3 && d >= 22) ? y - 78 : y - 79;

  // Special astronomical events
  const specialEvents: string[] = [];
  if (tithiIdx === 10 || tithiIdx === 25) specialEvents.push('Ekadashi Vrat');
  if (tithiIdx === 14) specialEvents.push('Purnima (Full Moon)');
  if (tithiIdx === 29) specialEvents.push('Amavasya (New Moon)');
  if (tithiIdx === 12 || tithiIdx === 27) specialEvents.push('Pradosh Vrat');
  if (tithiIdx === 3 || tithiIdx === 18) specialEvents.push('Chaturthi');
  if (sunSid % 30 < 1.0) specialEvents.push(`${ZODIAC_SIGNS[sunSignIdx].sanskritName} Sankranti`);

  return {
    date: dateStr,
    placeName,
    timezoneOffsetMinutes,
    vara,
    tithi: {
      index: tithiIdx + 1,
      name: TITHI_NAMES[tithiIdx],
      paksha,
      percentElapsed: tithiPercent,
    },
    nakshatra: {
      index: nakIdx + 1,
      name: NAKSHATRAS[nakIdx].name,
      hindiName: NAKSHATRAS[nakIdx].hindiName,
      pada,
      lord: NAKSHATRAS[nakIdx].lord,
    },
    yoga: { index: yogaIdx + 1, name: NITYA_YOGAS[yogaIdx] },
    karana: { name: karanaName },
    hinduMonth,
    vikramSamvat,
    shakaSamvat,
    sunrise: formatLocalTime(sunriseMs, timezoneOffsetMinutes),
    sunset: formatLocalTime(sunsetMs, timezoneOffsetMinutes),
    moonrise: moonriseResult
      ? formatLocalTime(moonriseResult.date.getTime(), timezoneOffsetMinutes)
      : 'No rise today',
    moonset: moonsetResult
      ? formatLocalTime(moonsetResult.date.getTime(), timezoneOffsetMinutes)
      : 'No set today',
    brahmaMuhurat: fmtRange(brahmaStart, brahmaEnd),
    abhijitMuhurat:
      localDayOfWeek === 3
        ? 'Not auspicious on Wednesday'
        : fmtRange(solarNoon - abhijitHalf, solarNoon + abhijitHalf),
    rahuKaal: fmtRange(sunriseMs + rahuSlot * eighthDay, sunriseMs + (rahuSlot + 1) * eighthDay),
    yamaganda: fmtRange(sunriseMs + yamaSlot * eighthDay, sunriseMs + (yamaSlot + 1) * eighthDay),
    gulikaKaal: fmtRange(sunriseMs + gulikaSlot * eighthDay, sunriseMs + (gulikaSlot + 1) * eighthDay),
    amritKaal: fmtRange(amritStart, amritEnd),
    dayChoghadiya,
    nightChoghadiya,
    specialEvents,
    sunSign: ZODIAC_SIGNS[sunSignIdx].name,
    moonSign: ZODIAC_SIGNS[moonSignIdx].name,
  };
}
