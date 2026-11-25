import * as Astronomy from 'astronomy-engine';
import { HINDU_MONTHS, NAKSHATRAS, ZODIAC_SIGNS } from './constants';
import { calculateKundli, dateToJulianDay, getAyanamshaDegrees, normalizeDeg, type BirthInput } from './ephemeris';
import { calculatePanchang } from './panchang';
import { getUpcomingEclipses } from './planetaryIntelligence';

export type MuhuratPurpose = 'griha_pravesh' | 'vehicle_property' | 'mundan_vidyarambh' | 'business_trading';

export interface PurposeMuhuratItem {
  date: string;
  weekday: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  bestWindow: string;
  reasons: string[];
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// #21–24: Real Astronomical Muhurat Scanners by Purpose
export function findPurposeMuhurats(purpose: MuhuratPurpose, year: number, limit = 16): PurposeMuhuratItem[] {
  const results: PurposeMuhuratItem[] = [];
  const startMs = Date.UTC(year, 0, 1, 1, 30, 0); // ~7 AM IST

  // Classical Nakshatra sets per ceremony
  const allowedNaks: Record<MuhuratPurpose, Set<number>> = {
    griha_pravesh: new Set([3, 4, 11, 12, 13, 16, 20, 22, 23, 25, 26]), // Rohini, Mrigashira, U.Phalguni, Hasta, Chitra, Anuradha, U.Ashadha, Dhanishta, Shatabhisha, U.Bhadra, Revati
    vehicle_property: new Set([0, 3, 4, 6, 7, 12, 13, 14, 16, 20, 21, 22, 26]), // Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, etc.
    mundan_vidyarambh: new Set([0, 4, 6, 7, 12, 13, 14, 21, 22, 26]),
    business_trading: new Set([0, 3, 6, 7, 11, 12, 13, 14, 16, 20, 21, 25, 26]),
  };
  const riktaTithis = new Set([3, 8, 13, 18, 23, 28, 29]);

  for (let d = 0; d < 365 && results.length < limit; d++) {
    const dt = new Date(startMs + d * 86400000);
    const dateStr = dt.toISOString().slice(0, 10);
    const weekdayIdx = dt.getUTCDay();
    const panchang = calculatePanchang(dateStr, 28.6139, 77.209, 330, 'New Delhi');

    if (riktaTithis.has(panchang.tithi.index)) continue;
    if (!allowedNaks[purpose].has(panchang.nakshatra.index)) continue;
    // Skip Tuesday for peaceful ceremonies unless business/property
    if ((purpose === 'griha_pravesh' || purpose === 'mundan_vidyarambh') && weekdayIdx === 2) continue;
    // Skip Vishti / Bhadra Karana
    if (panchang.karana.name === 'Vishti') continue;

    results.push({
      date: dateStr,
      weekday: WEEKDAYS[weekdayIdx],
      tithi: `${panchang.tithi.paksha} ${panchang.tithi.name}`,
      nakshatra: panchang.nakshatra.name,
      yoga: panchang.yoga.name,
      bestWindow: panchang.abhijitMuhurat,
      reasons: [
        `Non-Rikta ${panchang.tithi.name}`,
        `Auspicious ${panchang.nakshatra.name} Nakshatra`,
        `Non-Bhadra (${panchang.karana.name} Karana)`,
      ],
    });
  }
  return results;
}

// #25: Agni Vaas, Shiv Vaas & Disha Shool Checker
export function calculateDailyAlmanacChecks(dateStr: string) {
  const panchang = calculatePanchang(dateStr, 28.6139, 77.209, 330, 'New Delhi');
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekdayIdx = new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay(); // 0=Sun..6=Sat
  const varaNum = weekdayIdx + 1; // 1=Sun..7=Sat
  const tithiNum = panchang.tithi.index + 1; // 1..30

  // Classical Agni Vaas formula: (Tithi + Vara + 1) % 4 => 0=Prithvi (Auspicious for Havan), 1=Akasha (Avoid), 2=Patala (Avoid), 3=Prithvi/Swarga
  const agniMod = (tithiNum + varaNum + 1) % 4;
  const agniResidence =
    agniMod === 0 || agniMod === 3
      ? { residence: 'Prithvi (Earth)', auspicious: true, note: 'Auspicious for Havan, Yajna & Agnihotra.' }
      : agniMod === 1
        ? { residence: 'Akasha (Sky)', auspicious: false, note: 'Agni in Sky — classically deferred for Havan.' }
        : { residence: 'Patala (Netherworld)', auspicious: false, note: 'Agni in Patala — classically deferred for Havan.' };

  // Shiv Vaas formula: (Tithi * 2 + 5) % 7 classical check
  const shivMod = (tithiNum + varaNum) % 7;
  const shivMap = [
    { label: 'Kailash (Auspicious)', auspicious: true },
    { label: 'Gauri Sannidhya (Very Auspicious)', auspicious: true },
    { label: 'Vrishabharudha (Auspicious)', auspicious: true },
    { label: 'Sabhayam (Caution)', auspicious: false },
    { label: 'Bhojane (Caution)', auspicious: false },
    { label: 'Kreedayam (Moderate)', auspicious: true },
    { label: 'Shmashane (Avoid Rudrabhishek)', auspicious: false },
  ];
  const shivVaas = shivMap[shivMod];

  const dishaShoolByDay: Record<number, { direction: string; remedy: string }> = {
    0: { direction: 'West (पश्चिम)', remedy: 'Before travel west, consume ghee/pan or step out after sunrise.' },
    1: { direction: 'East (पूर्व)', remedy: 'Mirror glance or milk sip before morning east travel.' },
    2: { direction: 'North (उत्तर)', remedy: 'Jaggery (गुड़) consumption before north departure.' },
    3: { direction: 'North (उत्तर)', remedy: 'Coriander / til before departure.' },
    4: { direction: 'South (दक्षिण)', remedy: 'Curd or jeera before south travel.' },
    5: { direction: 'West (पश्चिम)', remedy: 'Barley/curd before western travel.' },
    6: { direction: 'East (पूर्व)', remedy: 'Ginger or urad before east departure.' },
  };

  return {
    dateStr,
    tithi: `${panchang.tithi.paksha} ${panchang.tithi.name}`,
    vara: WEEKDAYS[weekdayIdx],
    agniVaas: agniResidence,
    shivVaas,
    dishaShool: dishaShoolByDay[weekdayIdx],
  };
}

// #26: Drik Ganita (Modern JPL/VSOP87) vs Classical Surya Siddhanta Mean Solar Comparison
export function compareDrikVsSuryaSiddhanta(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 0, 30, 0));
  const jd = dateToJulianDay(utc);
  const astro = Astronomy.MakeTime(utc);
  const aya = getAyanamshaDegrees(jd, 'lahiri');
  const drikSunSid = normalizeDeg(Astronomy.SunPosition(astro).elon - aya);
  const drikMoonSid = normalizeDeg(Astronomy.EclipticGeoMoon(astro).lon - aya);

  // Classical Surya Siddhanta Kaliyuga Ahargana mean motion approximation
  const kaliDays = jd - 588465.5; // Epoch Feb 18, 3102 BCE
  const suryaMeanSun = normalizeDeg((kaliDays * 0.98560265) % 360);
  const suryaMeanMoon = normalizeDeg((kaliDays * 13.176356) % 360);

  return {
    dateStr,
    drikSunDeg: Number(drikSunSid.toFixed(3)),
    suryaSiddhantaMeanSunDeg: Number(suryaMeanSun.toFixed(3)),
    sunDifferenceDeg: Number((((drikSunSid - suryaMeanSun + 540) % 360) - 180).toFixed(3)),
    drikMoonDeg: Number(drikMoonSid.toFixed(3)),
    suryaSiddhantaMeanMoonDeg: Number(suryaMeanMoon.toFixed(3)),
  };
}

// #27: 6 Regional Indian Panchang Calendar Variants
export function getRegionalIndianCalendars(dateStr: string) {
  const panchang = calculatePanchang(dateStr, 28.6139, 77.209, 330, 'New Delhi');
  const [y, m] = dateStr.split('-').map(Number);
  const monthIdx = (m - 1) % 12;
  const tamilMonths = ['Thai', 'Maasi', 'Panguni', 'Chithirai', 'Vaikasi', 'Aani', 'Aadi', 'Aavani', 'Purattasi', 'Aippasi', 'Karthigai', 'Margazhi'];
  const bengaliMonths = ['Poush', 'Magh', 'Falgun', 'Chaitra', 'Boishakh', 'Joishtho', 'Asharh', 'Srabon', 'Bhadro', 'Ashwin', 'Kartik', 'Agrahayan'];
  const malayalamMonths = ['Makaram', 'Kumbham', 'Meenam', 'Medam', 'Idavam', 'Mithunam', 'Karkidakam', 'Chingam', 'Kanni', 'Thulam', 'Vrishchikam', 'Dhanu'];

  return [
    { tradition: 'North India (Purnimanta Vikram Samvat)', yearLabel: `VS ${panchang.vikramSamvat}`, monthName: panchang.hinduMonth },
    { tradition: 'Maharashtra / Telangana (Shalivahana Shaka Amanta)', yearLabel: `Shaka ${panchang.shakaSamvat}`, monthName: panchang.hinduMonth },
    { tradition: 'Gujarat (Amanta Vikram Samvat)', yearLabel: `VS ${panchang.vikramSamvat} (Kartakadi)`, monthName: HINDU_MONTHS[monthIdx] },
    { tradition: 'Tamil Panchangam (Solar)', yearLabel: `Thiruvalluvar ${y + 31}`, monthName: tamilMonths[monthIdx] },
    { tradition: 'Bengali Panjika (Bangabda)', yearLabel: `Bangabda ${y - 593}`, monthName: bengaliMonths[monthIdx] },
    { tradition: 'Kerala Malayalam (Kollam Era)', yearLabel: `Kollam ${y - 825}`, monthName: malayalamMonths[monthIdx] },
  ];
}

// #28–30: Yearly Special Vrats, Sarvartha Siddhi, Ravi/Guru Pushya & Eclipse Sutak Countdown
export function findSpecialAstronomicalYogas(year: number) {
  const startMs = Date.UTC(year, 0, 1, 1, 30, 0);
  const matches: Array<{ date: string; weekday: string; nakshatra: string; yogaType: string; description: string }> = [];

  for (let d = 0; d < 365; d++) {
    const dt = new Date(startMs + d * 86400000);
    const dateStr = dt.toISOString().slice(0, 10);
    const wd = dt.getUTCDay(); // 0=Sun..6=Sat
    const p = calculatePanchang(dateStr, 28.6139, 77.209, 330, 'New Delhi');
    const nak = p.nakshatra.index;

    // Guru Pushya: Thursday(4) + Pushya(7)
    if (wd === 4 && nak === 7) {
      matches.push({ date: dateStr, weekday: WEEKDAYS[wd], nakshatra: p.nakshatra.name, yogaType: 'Guru Pushya Yoga', description: 'Rare Thursday + Pushya confluence for gold, education & wealth starts.' });
    }
    // Ravi Pushya: Sunday(0) + Pushya(7)
    if (wd === 0 && nak === 7) {
      matches.push({ date: dateStr, weekday: WEEKDAYS[wd], nakshatra: p.nakshatra.name, yogaType: 'Ravi Pushya Yoga', description: 'Sunday + Pushya healing, remedies & auspicious initiatives.' });
    }
    // Sankashti Chaturthi (Krishna Paksha 4th Tithi = index 18)
    if (p.tithi.index === 18) {
      matches.push({ date: dateStr, weekday: WEEKDAYS[wd], nakshatra: p.nakshatra.name, yogaType: 'Sankashti Chaturthi', description: 'Monthly Ganesha Vrat observed on Krishna Chaturthi moonrise.' });
    }
    // Pradosh Vrat (Trayodashi = index 12 or 27)
    if (p.tithi.index === 12 || p.tithi.index === 27) {
      matches.push({ date: dateStr, weekday: WEEKDAYS[wd], nakshatra: p.nakshatra.name, yogaType: 'Pradosh Vrat', description: `${p.tithi.paksha} Trayodashi evening Shiva worship.` });
    }
    // Sarvartha Siddhi sample combinations (e.g. Sun+Ashwini(0)/Pushya(7)/Hasta(12), Thu+Ashwini(0)/Punarvasu(6)/Pushya(7))
    if ((wd === 0 && [0, 12].includes(nak)) || (wd === 4 && [0, 6, 16].includes(nak))) {
      matches.push({ date: dateStr, weekday: WEEKDAYS[wd], nakshatra: p.nakshatra.name, yogaType: 'Sarvartha Siddhi Yoga', description: 'All-purpose auspicious weekday-nakshatra Siddhi combination.' });
    }
  }

  const ec = getUpcomingEclipses(`${year}-01-01`, 28.6139, 77.209);
  const eclipses = [...ec.solar, ...ec.lunar]
    .sort((a, b) => a.peakUtc.localeCompare(b.peakUtc))
    .slice(0, 4)
    .map((e) => ({
      ...e,
      sutakHoursBefore: e.kind === 'Solar' ? 12 : 9,
    }));

  return { yogas: matches.slice(0, 60), eclipses };
}

// #31: Birth Time Rectification (BTR) Engine using Life Event Years + Dasha Alignment
export function runBirthTimeRectification(
  baseInput: BirthInput,
  lifeEvents: Array<{ year: number; category: 'career' | 'marriage' | 'education' | 'relocation' }>,
  windowMinutes = 30
) {
  const [hh, mm] = (baseInput.time || '12:00').split(':').map(Number);
  const centerMins = (hh || 12) * 60 + (mm || 0);
  const candidates: Array<{ time: string; lagnaSign: string; navamsaLagna: string; alignmentScore: number; notes: string[] }> = [];

  for (let delta = -windowMinutes; delta <= windowMinutes; delta += 6) {
    const mTotal = (centerMins + delta + 1440) % 1440;
    const candTime = `${String(Math.floor(mTotal / 60)).padStart(2, '0')}:${String(mTotal % 60).padStart(2, '0')}:00`;
    const k = calculateKundli({ ...baseInput, time: candTime });
    const d9 = k.divisionalCharts.find((d) => d.code === 'D9')!;
    const birthYear = Number(baseInput.date.slice(0, 4));

    let score = 50;
    const notes: string[] = [];
    for (const ev of lifeEvents) {
      const targetYearStr = `${ev.year}-06-15`;
      const activeMd = k.dashas.find((md) => md.startDate <= targetYearStr && md.endDate >= targetYearStr);
      if (activeMd) {
        const mdPlanet = k.planets.find((p) => p.id === activeMd.lord)!;
        const favHouses =
          ev.category === 'career' ? [1, 6, 10, 11] :
          ev.category === 'marriage' ? [2, 7, 11] :
          ev.category === 'education' ? [1, 4, 5, 9] : [3, 4, 9, 12];
        if (favHouses.includes(mdPlanet.house)) {
          score += 14;
          notes.push(`${ev.year} ${ev.category}: ${activeMd.lord} MD activates H${mdPlanet.house}`);
        } else {
          score += 4;
        }
      }
      if (ev.year > birthYear) score += 2;
    }

    candidates.push({
      time: candTime.slice(0, 5),
      lagnaSign: k.ascendant.signName,
      navamsaLagna: ZODIAC_SIGNS[d9.ascendantSignIndex].name,
      alignmentScore: Math.min(99, score),
      notes: notes.slice(0, 3),
    });
  }

  return candidates.sort((a, b) => b.alignmentScore - a.alignmentScore).slice(0, 7);
}
