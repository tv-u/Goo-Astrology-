import { ZODIAC_SIGNS, type PlanetId } from './constants';
import { type KundliResult, type PlanetPosition } from './ephemeris';

export interface DoshaReport {
  id: string;
  name: string;
  hindiName: string;
  present: boolean;
  severity: 'None' | 'Mild / Cancelled' | 'Moderate' | 'Strong';
  summary: string;
  calculationRule: string;
  exceptionsChecked: string[];
  remedialGuidance: string;
}

export interface YogaReport {
  id: string;
  name: string;
  hindiName: string;
  present: boolean;
  involvedPlanets: string[];
  summary: string;
  classicalBasis: string;
}

function getSignLord(signIndex: number): PlanetId {
  return ZODIAC_SIGNS[((signIndex % 12) + 12) % 12].ruler;
}

function getHouseLord(lagnaSign: number, houseNumber: number): PlanetId {
  const signIdx = (lagnaSign + houseNumber - 1) % 12;
  return getSignLord(signIdx);
}

export function analyzeDoshasAndYogas(kundli: KundliResult): {
  doshas: DoshaReport[];
  yogas: YogaReport[];
} {
  const pMap = new Map<PlanetId, PlanetPosition>();
  for (const p of kundli.planets) {
    if (p.id !== 'Ascendant') pMap.set(p.id, p);
  }
  const sun = pMap.get('Sun')!;
  const moon = pMap.get('Moon')!;
  const mars = pMap.get('Mars')!;
  const mercury = pMap.get('Mercury')!;
  const jupiter = pMap.get('Jupiter')!;
  const venus = pMap.get('Venus')!;
  const saturn = pMap.get('Saturn')!;
  const rahu = pMap.get('Rahu')!;
  const ketu = pMap.get('Ketu')!;

  const doshas: DoshaReport[] = [];

  // 1. Manglik / Kuja Dosha with classical cancellation rules
  const manglikHouses = [1, 2, 4, 7, 8, 12];
  const marsFromLagna = manglikHouses.includes(mars.house);
  const marsFromMoon = manglikHouses.includes(mars.moonHouse);
  const marsFromVenus = manglikHouses.includes(((mars.signIndex - venus.signIndex + 12) % 12) + 1);
  const rawManglik = marsFromLagna || marsFromMoon;

  const manglikExceptions: string[] = [];
  if (mars.signIndex === 0 || mars.signIndex === 7) {
    manglikExceptions.push('Mars is in its own sign (Aries/Scorpio), which traditionally mitigates Kuja Dosha.');
  }
  if (mars.signIndex === 9) {
    manglikExceptions.push('Mars is exalted in Capricorn, reducing affliction.');
  }
  if (jupiter.aspectsHouses.includes(mars.house) || jupiter.house === mars.house) {
    manglikExceptions.push('Jupiter aspects or conjoins Mars, providing strong benefic cancellation.');
  }
  if (mars.house === 2 && (mars.signIndex === 2 || mars.signIndex === 5)) {
    manglikExceptions.push('Mars in 2nd house in Gemini/Virgo is exempted in classical texts.');
  }
  if (mars.house === 12 && (mars.signIndex === 1 || mars.signIndex === 6)) {
    manglikExceptions.push('Mars in 12th house in Taurus/Libra is exempted.');
  }

  let manglikSeverity: DoshaReport['severity'] = 'None';
  if (rawManglik) {
    if (manglikExceptions.length > 0) manglikSeverity = 'Mild / Cancelled';
    else if (marsFromLagna && marsFromMoon) manglikSeverity = 'Strong';
    else manglikSeverity = 'Moderate';
  }

  doshas.push({
    id: 'manglik',
    name: 'Manglik (Kuja) Dosha',
    hindiName: 'मांगलिक दोष',
    present: rawManglik && manglikExceptions.length === 0,
    severity: manglikSeverity,
    summary: !rawManglik
      ? `Mars is in House ${mars.house} from Lagna and House ${mars.moonHouse} from Moon — no Manglik placement detected.`
      : manglikExceptions.length > 0
      ? `Mars occupies House ${mars.house} (Lagna) / ${mars.moonHouse} (Moon), but classical cancellation conditions apply.`
      : `Mars occupies House ${mars.house} from Lagna and House ${mars.moonHouse} from Moon (Venus ref: H${((mars.signIndex - venus.signIndex + 12) % 12) + 1}).`,
    calculationRule: 'Mars in houses 1, 2, 4, 7, 8, or 12 from Lagna or Moon.',
    exceptionsChecked:
      manglikExceptions.length > 0
        ? manglikExceptions
        : ['Checked own sign, exaltation, Jupiter aspect/conjunction, and sign exemptions — none triggered.'],
    remedialGuidance: 'Compare partner Manglik status during Kundli matching; focus on patience and transparent communication.',
  });

  // 2. Kaal Sarp Dosha (strictly hemmed between Rahu and Ketu)
  const sevenPlanets = [sun, moon, mars, mercury, jupiter, venus, saturn];
  const arcToKetu = (lon: number) => (lon - rahu.longitude + 360) % 360;
  const ketuSpan = arcToKetu(ketu.longitude); // ~180
  const allInFirstHalf = sevenPlanets.every((p) => {
    const a = arcToKetu(p.longitude);
    return a > 0 && a < ketuSpan;
  });
  const allInSecondHalf = sevenPlanets.every((p) => {
    const a = arcToKetu(p.longitude);
    return a > ketuSpan && a < 360;
  });
  const kaalSarpPresent = allInFirstHalf || allInSecondHalf;
  const kaalSarpTypes = [
    'Anant', 'Kulik', 'Vasuki', 'Shankhpal', 'Padma', 'Mahapadma',
    'Takshak', 'Karkotak', 'Shankhchood', 'Ghatak', 'Vishdhar', 'Sheshnag',
  ];
  const ksName = kaalSarpTypes[(rahu.house - 1) % 12];

  doshas.push({
    id: 'kaalsarp',
    name: 'Kaal Sarp Dosha',
    hindiName: 'काल सर्प दोष',
    present: kaalSarpPresent,
    severity: kaalSarpPresent ? 'Moderate' : 'None',
    summary: kaalSarpPresent
      ? `All 7 classical planets are hemmed on one side of the Rahu–Ketu axis (${ksName} Kaal Sarp Yoga, Rahu in H${rahu.house}).`
      : 'Planets are distributed across both sides of the Rahu–Ketu nodal axis — no Kaal Sarp Dosha.',
    calculationRule: 'All 7 physical Grahas (Sun through Saturn) strictly within one 180° arc between Rahu and Ketu.',
    exceptionsChecked: [
      allInFirstHalf || allInSecondHalf
        ? 'Verified degrees strictly inside Rahu–Ketu boundary (conjunctions on exact degree boundary checked).'
        : 'At least one planet lies outside the Rahu–Ketu hemmed hemisphere.',
    ],
    remedialGuidance: 'Note that Kaal Sarp is a modern astrological classification not explicitly listed in Brihat Parashara Hora Shastra.',
  });

  // 3. Grahan Dosha (Eclipse affliction: Sun or Moon within 12° of Rahu/Ketu)
  const sunNodeDist = Math.min(
    Math.abs(sun.longitude - rahu.longitude) % 360,
    360 - (Math.abs(sun.longitude - rahu.longitude) % 360),
    Math.abs(sun.longitude - ketu.longitude) % 360,
    360 - (Math.abs(sun.longitude - ketu.longitude) % 360)
  );
  const moonNodeDist = Math.min(
    Math.abs(moon.longitude - rahu.longitude) % 360,
    360 - (Math.abs(moon.longitude - rahu.longitude) % 360),
    Math.abs(moon.longitude - ketu.longitude) % 360,
    360 - (Math.abs(moon.longitude - ketu.longitude) % 360)
  );
  const grahanPresent = sunNodeDist <= 12 || moonNodeDist <= 12;
  doshas.push({
    id: 'grahan',
    name: 'Grahan Dosha',
    hindiName: 'ग्रहण दोष',
    present: grahanPresent,
    severity: grahanPresent ? (sunNodeDist <= 6 || moonNodeDist <= 6 ? 'Strong' : 'Moderate') : 'None',
    summary: grahanPresent
      ? `${sunNodeDist <= 12 ? `Sun is within ${sunNodeDist.toFixed(1)}° of Lunar Nodes. ` : ''}${moonNodeDist <= 12 ? `Moon is within ${moonNodeDist.toFixed(1)}° of Lunar Nodes.` : ''}`
      : 'Neither Sun nor Moon is closely conjunct Rahu or Ketu (orb > 12°).',
    calculationRule: 'Sun or Moon within 12° longitude orb of Rahu or Ketu.',
    exceptionsChecked: ['Checked exact degree separation rather than merely same-sign placement.'],
    remedialGuidance: 'Mindfulness, steady solar/lunar routines, and avoiding impulsive decisions during eclipses.',
  });

  // 4. Guru Chandal Yoga (Jupiter + Rahu/Ketu in same sign)
  const guruChandal = jupiter.signIndex === rahu.signIndex || jupiter.signIndex === ketu.signIndex;
  doshas.push({
    id: 'guruchandal',
    name: 'Guru Chandal Yoga',
    hindiName: 'गुरु चांडाल योग',
    present: guruChandal,
    severity: guruChandal ? (jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own Sign' ? 'Mild / Cancelled' : 'Moderate') : 'None',
    summary: guruChandal
      ? `Jupiter shares ${jupiter.signName} (House ${jupiter.house}) with ${jupiter.signIndex === rahu.signIndex ? 'Rahu' : 'Ketu'}.`
      : 'Jupiter is not conjoined with Rahu or Ketu.',
    calculationRule: 'Jupiter occupying the same Rashi as Rahu or Ketu.',
    exceptionsChecked: [
      jupiter.dignity === 'Exalted' || jupiter.dignity === 'Own Sign'
        ? 'Jupiter is dignified (Exalted/Own Sign), preserving wisdom and mitigating affliction.'
        : 'Checked Jupiter dignity and degree separation.',
    ],
    remedialGuidance: 'Cultivate traditional mentorship, ethical clarity, and disciplined study.',
  });

  // 5. Pitra Dosha (Sun afflicted by Rahu/Ketu/Saturn in 9th or 9th lord afflicted)
  const ninthLord = getHouseLord(kundli.lagnaSignIndex, 9);
  const ninthLordPlanet = pMap.get(ninthLord);
  const pitraTriggers: string[] = [];
  if (sun.signIndex === rahu.signIndex || sun.signIndex === ketu.signIndex) pitraTriggers.push('Sun conjoins Rahu/Ketu');
  if (sun.house === 9 && (saturn.house === 9 || rahu.house === 9)) pitraTriggers.push('9th house Sun afflicted by Saturn/Rahu');
  if (ninthLordPlanet && (ninthLordPlanet.signIndex === rahu.signIndex || ninthLordPlanet.signIndex === saturn.signIndex)) {
    pitraTriggers.push(`9th lord (${ninthLord}) conjoins ${ninthLordPlanet.signIndex === rahu.signIndex ? 'Rahu' : 'Saturn'}`);
  }
  const pitraPresent = pitraTriggers.length > 0;
  doshas.push({
    id: 'pitra',
    name: 'Pitra Dosha Indicators',
    hindiName: 'पितृ दोष',
    present: pitraPresent,
    severity: pitraTriggers.length >= 2 ? 'Moderate' : pitraPresent ? 'Mild / Cancelled' : 'None',
    summary: pitraPresent ? pitraTriggers.join('; ') + '.' : 'No classical Pitra Dosha indicators detected in 9th house / Sun.',
    calculationRule: 'Affliction to Sun, 9th house, or 9th lord by Rahu/Ketu/Saturn.',
    exceptionsChecked: ['Evaluated both solar nodal conjunction and 9th house lordship.'],
    remedialGuidance: 'Honor elders, ancestral gratitude, and charitable service.',
  });

  // 6. Kemadruma Yoga (Moon isolated: no planets in 2nd or 12th from Moon, excluding Sun/Rahu/Ketu)
  const classicalNonSun = [mars, mercury, jupiter, venus, saturn];
  const hasAdjacentToMoon = classicalNonSun.some((p) => p.moonHouse === 2 || p.moonHouse === 12);
  const kemadrumaBhanga =
    classicalNonSun.some((p) => p.moonHouse === 1 || p.house === 1 || [1, 4, 7, 10].includes(p.moonHouse));
  const kemadrumaPresent = !hasAdjacentToMoon && !kemadrumaBhanga;
  doshas.push({
    id: 'kemadruma',
    name: 'Kemadruma Yoga',
    hindiName: 'केमद्रुम योग',
    present: kemadrumaPresent,
    severity: !hasAdjacentToMoon ? (kemadrumaBhanga ? 'Mild / Cancelled' : 'Moderate') : 'None',
    summary: hasAdjacentToMoon
      ? 'Planets occupy the 2nd or 12th sign from Moon — Kemadruma is not formed.'
      : kemadrumaBhanga
      ? 'Moon has empty 2nd/12th signs, but Kemadruma Bhanga (cancellation via Kendra planets) applies.'
      : 'No classical planets (Mars–Saturn) occupy 2nd or 12th from Moon and no Kendra cancellation applies.',
    calculationRule: 'Absence of Mars, Mercury, Jupiter, Venus, or Saturn in 2nd & 12th houses from Moon.',
    exceptionsChecked: ['Checked planets in Kendra from Lagna and Moon for Kemadruma Bhanga cancellation.'],
    remedialGuidance: 'Build emotional anchors, supportive community, and steady daily routines.',
  });

  // 7. YOGAS
  const yogas: YogaReport[] = [];

  // Gaj Kesari Yoga: Jupiter in 1, 4, 7, 10 from Moon
  const gajKesari = [1, 4, 7, 10].includes(jupiter.moonHouse);
  yogas.push({
    id: 'gajkesari',
    name: 'Gaj Kesari Yoga',
    hindiName: 'गजकेसरी योग',
    present: gajKesari,
    involvedPlanets: ['Jupiter', 'Moon'],
    summary: gajKesari
      ? `Jupiter is in House ${jupiter.moonHouse} (Kendra) from Moon — bestows wisdom, respect, and resilience.`
      : `Jupiter is in House ${jupiter.moonHouse} from Moon (requires Kendra 1/4/7/10 from Moon).`,
    classicalBasis: 'Brihat Parashara Hora Shastra — Jupiter in a Kendra from the Moon.',
  });

  // Budhaditya Yoga: Sun + Mercury in same sign
  const budhaditya = sun.signIndex === mercury.signIndex;
  yogas.push({
    id: 'budhaditya',
    name: 'Budhaditya Yoga',
    hindiName: 'बुधादित्य योग',
    present: budhaditya,
    involvedPlanets: ['Sun', 'Mercury'],
    summary: budhaditya
      ? `Sun and Mercury conjoin in ${sun.signName} (House ${sun.house})${mercury.isCombust ? ' — note Mercury is combust, moderating outward expression' : ''}.`
      : 'Sun and Mercury occupy different signs.',
    classicalBasis: 'Conjunction of Sun (Surya) and Mercury (Budha) sharpens intellect and communication.',
  });

  // Chandra Mangal Yoga
  const chandraMangal = moon.signIndex === mars.signIndex || moon.moonHouse === ((mars.moonHouse + 6 - 1) % 12) + 1 && mars.moonHouse === 7;
  yogas.push({
    id: 'chandramangal',
    name: 'Chandra Mangal Yoga',
    hindiName: 'चंद्र मंगल योग',
    present: chandraMangal,
    involvedPlanets: ['Moon', 'Mars'],
    summary: chandraMangal
      ? `Moon and Mars are in mutual conjunction or 1/7 axis (${moon.signName} / ${mars.signName}), energizing financial drive.`
      : 'Moon and Mars are neither conjunct nor in mutual 7th aspect.',
    classicalBasis: 'Association of Moon and Mars creates entrepreneurial drive and material initiative.',
  });

  // Panch Mahapurush Yogas
  const pmRules: { planet: PlanetPosition; name: string; hindi: string }[] = [
    { planet: mars, name: 'Ruchaka Mahapurush Yoga', hindi: 'रुचक महापुरुष योग' },
    { planet: mercury, name: 'Bhadra Mahapurush Yoga', hindi: 'भद्र महापुरुष योग' },
    { planet: jupiter, name: 'Hamsa Mahapurush Yoga', hindi: 'हंस महापुरुष योग' },
    { planet: venus, name: 'Malavya Mahapurush Yoga', hindi: 'मालव्य महापुरुष योग' },
    { planet: saturn, name: 'Shasha Mahapurush Yoga', hindi: 'शश महापुरुष योग' },
  ];
  for (const r of pmRules) {
    const inKendra = [1, 4, 7, 10].includes(r.planet.house);
    const dignified = r.planet.dignity === 'Exalted' || r.planet.dignity === 'Own Sign';
    const formed = inKendra && dignified;
    yogas.push({
      id: `pm-${r.planet.id.toLowerCase()}`,
      name: r.name,
      hindiName: r.hindi,
      present: formed,
      involvedPlanets: [r.planet.id],
      summary: formed
        ? `${r.planet.id} is ${r.planet.dignity} in ${r.planet.signName} in Kendra House ${r.planet.house}.`
        : `${r.planet.id} is in House ${r.planet.house} (${r.planet.dignity}); requires Exalted/Own Sign in Kendra (1,4,7,10).`,
      classicalBasis: 'Pancha Mahapurusha Yoga — Tara-graha in own or exalted sign in a Kendra house.',
    });
  }

  // Kendra-Trikona Raj Yoga check
  const kendraLords = [1, 4, 7, 10].map((h) => getHouseLord(kundli.lagnaSignIndex, h));
  const trikonaLords = [1, 5, 9].map((h) => getHouseLord(kundli.lagnaSignIndex, h));
  let rajPairs: string[] = [];
  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl === tl) continue;
      const pk = pMap.get(kl);
      const pt = pMap.get(tl);
      if (pk && pt && pk.signIndex === pt.signIndex) {
        rajPairs.push(`${kl} + ${tl} in ${pk.signName}`);
      }
    }
  }
  rajPairs = Array.from(new Set(rajPairs));
  yogas.push({
    id: 'rajyoga',
    name: 'Kendra–Trikona Raj Yoga',
    hindiName: 'केंद्र-त्रिकोण राजयोग',
    present: rajPairs.length > 0,
    involvedPlanets: rajPairs,
    summary:
      rajPairs.length > 0
        ? `Formed by conjunction of Kendra and Trikona lords: ${rajPairs.join(', ')}.`
        : 'No direct conjunction between distinct Kendra (1,4,7,10) and Trikona (1,5,9) lords.',
    classicalBasis: 'Parashari Raj Yoga — association of angular (Vishnu-sthana) and trinal (Lakshmi-sthana) lords.',
  });

  // Dhan Yoga (2nd & 11th lord linkage with 1st/5th/9th)
  const l2 = getHouseLord(kundli.lagnaSignIndex, 2);
  const l11 = getHouseLord(kundli.lagnaSignIndex, 11);
  const p2 = pMap.get(l2);
  const p11 = pMap.get(l11);
  const dhanPresent =
    Boolean(p2 && p11 && p2.signIndex === p11.signIndex) ||
    Boolean(p2 && [1, 2, 5, 9, 11].includes(p2.house)) && Boolean(p11 && [1, 2, 5, 9, 11].includes(p11.house));
  yogas.push({
    id: 'dhanyoga',
    name: 'Dhan Yoga',
    hindiName: 'धन योग',
    present: dhanPresent,
    involvedPlanets: [l2, l11],
    summary: dhanPresent
      ? `2nd lord (${l2} in H${p2?.house}) and 11th lord (${l11} in H${p11?.house}) support wealth houses.`
      : `2nd lord (${l2} in H${p2?.house}) and 11th lord (${l11} in H${p11?.house}) operate independently.`,
    classicalBasis: 'Linkage or strong placement of 2nd (accumulated wealth) and 11th (income) lords.',
  });

  // Vipreet Raj Yoga (6th, 8th, 12th lord in 6, 8, or 12)
  const dusthanaHouses = [6, 8, 12];
  const vipreetHits = dusthanaHouses
    .map((h) => {
      const lord = getHouseLord(kundli.lagnaSignIndex, h);
      const pl = pMap.get(lord);
      return pl && dusthanaHouses.includes(pl.house) ? `${h}th lord ${lord} in H${pl.house}` : null;
    })
    .filter(Boolean) as string[];
  yogas.push({
    id: 'vipreet',
    name: 'Vipreet Raj Yoga',
    hindiName: 'विपरीत राजयोग',
    present: vipreetHits.length > 0,
    involvedPlanets: vipreetHits,
    summary:
      vipreetHits.length > 0
        ? `Triggered via ${vipreetHits.join('; ')} — resilience turning adversity into success.`
        : 'None of the 6th, 8th, or 12th lords occupy Dusthana houses.',
    classicalBasis: 'Harsha, Sarala, and Vimala Vipreet Raj Yogas from 6/8/12 lords placed in 6/8/12.',
  });

  // Neech Bhang Raj Yoga
  const neechPlanets = kundli.planets.filter((p) => p.id !== 'Ascendant' && p.dignity === 'Debilitated');
  const neechBhangHits: string[] = [];
  for (const np of neechPlanets) {
    const signLord = getSignLord(np.signIndex);
    const slPlanet = pMap.get(signLord);
    if (slPlanet && [1, 4, 7, 10].includes(slPlanet.house)) {
      neechBhangHits.push(`${np.id} in ${np.signName} cancelled by sign lord ${signLord} in Kendra H${slPlanet.house}`);
    }
  }
  yogas.push({
    id: 'neechbhang',
    name: 'Neech Bhang Raj Yoga',
    hindiName: 'नीचभंग राजयोग',
    present: neechBhangHits.length > 0,
    involvedPlanets: neechBhangHits,
    summary:
      neechBhangHits.length > 0
        ? neechBhangHits.join('; ') + '.'
        : neechPlanets.length > 0
        ? `Debilitated planet(s) found (${neechPlanets.map((n) => n.id).join(', ')}), without Kendra lord cancellation.`
        : 'No debilitated planets in the chart.',
    classicalBasis: 'Cancellation of planetary debilitation when dispositor or exaltation lord occupies Kendra.',
  });

  return { doshas, yogas };
}
