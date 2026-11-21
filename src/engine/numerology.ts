export interface NumerologyReport {
  fullName: string;
  birthDate: string;
  lifePathNumber: number;
  destinyNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  birthdayNumber: number;
  personalYearNumber: number;
  chaldeanNameNumber: number;
  luckyNumbers: number[];
  rulingPlanet: string;
  calculations: {
    label: string;
    formula: string;
    result: number;
    meaning: string;
  }[];
}

const PYTHAGOREAN_MAP: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

function reduceDigit(num: number, keepMaster = true): number {
  let n = num;
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    n = String(n)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
  }
  return n;
}

const NUMBER_MEANINGS: Record<number, { planet: string; trait: string }> = {
  1: { planet: 'Sun (Surya)', trait: 'Leadership, originality, independence, and initiative.' },
  2: { planet: 'Moon (Chandra)', trait: 'Diplomacy, intuition, partnership, and sensitivity.' },
  3: { planet: 'Jupiter (Guru)', trait: 'Expression, optimism, teaching, and creative expansion.' },
  4: { planet: 'Rahu (Uranus)', trait: 'Structure, discipline, systems thinking, and persistence.' },
  5: { planet: 'Mercury (Budha)', trait: 'Adaptability, communication, commerce, and travel.' },
  6: { planet: 'Venus (Shukra)', trait: 'Harmony, responsibility, artistry, and domestic care.' },
  7: { planet: 'Ketu (Neptune)', trait: 'Introspection, research, mysticism, and analytical truth.' },
  8: { planet: 'Saturn (Shani)', trait: 'Authority, material stewardship, justice, and endurance.' },
  9: { planet: 'Mars (Mangal)', trait: 'Compassion, courage, completion, and humanitarian drive.' },
  11: { planet: 'Master 11 (Moon/Sun)', trait: 'Heightened intuition, spiritual insight, and inspirational vision.' },
  22: { planet: 'Master 22 (Rahu/Saturn)', trait: 'Master builder capable of turning grand ideas into tangible reality.' },
  33: { planet: 'Master 33 (Jupiter/Venus)', trait: 'Master teacher, service, and compassionate guidance.' },
};

export function calculateNumerology(fullName: string, birthDate: string): NumerologyReport {
  const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '') || 'ASTRO';
  const [yStr, mStr, dStr] = birthDate.split('-');
  const y = Number(yStr) || 1995;
  const m = Number(mStr) || 1;
  const d = Number(dStr) || 1;

  // Life Path
  const dayRed = reduceDigit(d);
  const monRed = reduceDigit(m);
  const yrRed = reduceDigit(
    String(y)
      .split('')
      .reduce((a, b) => a + Number(b), 0)
  );
  const lifePathNumber = reduceDigit(dayRed + monRed + yrRed);

  // Destiny (all letters Pythagorean)
  const allLettersSum = cleanName
    .split('')
    .reduce((acc, ch) => acc + (PYTHAGOREAN_MAP[ch] || 0), 0);
  const destinyNumber = reduceDigit(allLettersSum);

  // Soul Urge (vowels)
  const vowelSum = cleanName
    .split('')
    .filter((ch) => VOWELS.has(ch))
    .reduce((acc, ch) => acc + (PYTHAGOREAN_MAP[ch] || 0), 0);
  const soulUrgeNumber = reduceDigit(vowelSum || 1);

  // Personality (consonants)
  const consSum = cleanName
    .split('')
    .filter((ch) => !VOWELS.has(ch))
    .reduce((acc, ch) => acc + (PYTHAGOREAN_MAP[ch] || 0), 0);
  const personalityNumber = reduceDigit(consSum || 1);

  // Birthday
  const birthdayNumber = reduceDigit(d, false);

  // Personal Year
  const currentYear = new Date().getFullYear();
  const curYrSum = String(currentYear)
    .split('')
    .reduce((a, b) => a + Number(b), 0);
  const personalYearNumber = reduceDigit(reduceDigit(d, false) + reduceDigit(m, false) + reduceDigit(curYrSum, false), false);

  // Chaldean
  const chaldeanRaw = cleanName
    .split('')
    .reduce((acc, ch) => acc + (CHALDEAN_MAP[ch] || 0), 0);
  const chaldeanNameNumber = reduceDigit(chaldeanRaw, false);

  const coreBase = reduceDigit(lifePathNumber, false);
  const luckyNumbers = Array.from(new Set([coreBase, reduceDigit(destinyNumber, false), birthdayNumber]));

  const meta = NUMBER_MEANINGS[lifePathNumber] || NUMBER_MEANINGS[coreBase];

  return {
    fullName,
    birthDate,
    lifePathNumber,
    destinyNumber,
    soulUrgeNumber,
    personalityNumber,
    birthdayNumber,
    personalYearNumber,
    chaldeanNameNumber,
    luckyNumbers,
    rulingPlanet: meta.planet,
    calculations: [
      {
        label: 'Life Path Number (Mulank-Bhagyank)',
        formula: `Day(${d}→${dayRed}) + Month(${m}→${monRed}) + Year(${y}→${yrRed})`,
        result: lifePathNumber,
        meaning: (NUMBER_MEANINGS[lifePathNumber] || NUMBER_MEANINGS[1]).trait,
      },
      {
        label: 'Destiny / Expression Number',
        formula: `Pythagorean sum of "${cleanName}" = ${allLettersSum}`,
        result: destinyNumber,
        meaning: (NUMBER_MEANINGS[destinyNumber] || NUMBER_MEANINGS[1]).trait,
      },
      {
        label: 'Soul Urge (Heart Desire)',
        formula: `Pythagorean vowels sum = ${vowelSum}`,
        result: soulUrgeNumber,
        meaning: (NUMBER_MEANINGS[soulUrgeNumber] || NUMBER_MEANINGS[1]).trait,
      },
      {
        label: 'Personality Number',
        formula: `Pythagorean consonants sum = ${consSum}`,
        result: personalityNumber,
        meaning: (NUMBER_MEANINGS[personalityNumber] || NUMBER_MEANINGS[1]).trait,
      },
      {
        label: 'Chaldean Name Vibration',
        formula: `Chaldean letter values (1–8) sum = ${chaldeanRaw}`,
        result: chaldeanNameNumber,
        meaning: (NUMBER_MEANINGS[chaldeanNameNumber] || NUMBER_MEANINGS[1]).trait,
      },
      {
        label: `Personal Year (${currentYear})`,
        formula: `Birth Day(${d}) + Birth Month(${m}) + ${currentYear}`,
        result: personalYearNumber,
        meaning: (NUMBER_MEANINGS[personalYearNumber] || NUMBER_MEANINGS[1]).trait,
      },
    ],
  };
}
