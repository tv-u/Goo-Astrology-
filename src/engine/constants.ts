export interface ZodiacSignInfo {
  index: number; // 0..11
  name: string;
  hindiName: string;
  sanskritName: string;
  westernName: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  hindiElement: string;
  modality: 'Movable' | 'Fixed' | 'Dual';
  ruler: PlanetId;
  rulerName: string;
  gender: 'Masculine' | 'Feminine';
  luckyNumber: number[];
  luckyColors: string[];
  luckyDay: string;
  gemstone: string;
  bodyPart: string;
  description: string;
  hindiDescription: string;
}

export type PlanetId =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export interface NakshatraInfo {
  index: number; // 0..26
  name: string;
  hindiName: string;
  lord: PlanetId;
  deity: string;
  symbol: string;
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  yoni: string;
  nadi: 'Adi' | 'Madhya' | 'Antya';
  padaSyllables: [string, string, string, string];
}

export const ZODIAC_SIGNS: ZodiacSignInfo[] = [
  {
    index: 0,
    name: 'Aries',
    hindiName: 'मेष',
    sanskritName: 'Mesha',
    westernName: 'Aries',
    symbol: '♈',
    element: 'Fire',
    hindiElement: 'अग्नि',
    modality: 'Movable',
    ruler: 'Mars',
    rulerName: 'Mars (Mangal)',
    gender: 'Masculine',
    luckyNumber: [1, 9],
    luckyColors: ['Crimson', 'Coral'],
    luckyDay: 'Tuesday',
    gemstone: 'Red Coral (Moonga)',
    bodyPart: 'Head & Brain',
    description: 'Pioneering cardinal fire sign ruled by Mars, marked by initiative, courage, and direct action.',
    hindiDescription: 'मंगल द्वारा शासित अग्नि तत्व की चर राशि; साहस, नेतृत्व और नई शुरुआत का प्रतीक।'
  },
  {
    index: 1,
    name: 'Taurus',
    hindiName: 'वृषभ',
    sanskritName: 'Vrishabha',
    westernName: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    hindiElement: 'पृथ्वी',
    modality: 'Fixed',
    ruler: 'Venus',
    rulerName: 'Venus (Shukra)',
    gender: 'Feminine',
    luckyNumber: [2, 6],
    luckyColors: ['Ivory', 'Emerald'],
    luckyDay: 'Friday',
    gemstone: 'Diamond / White Sapphire',
    bodyPart: 'Throat & Neck',
    description: 'Steadfast fixed earth sign ruled by Venus, valuing stability, craft, aesthetics, and material endurance.',
    hindiDescription: 'शुक्र द्वारा शासित पृथ्वी तत्व की स्थिर राशि; धैर्य, कला और भौतिक समृद्धि की प्रतीक।'
  },
  {
    index: 2,
    name: 'Gemini',
    hindiName: 'मिथुन',
    sanskritName: 'Mithuna',
    westernName: 'Gemini',
    symbol: '♊',
    element: 'Air',
    hindiElement: 'वायु',
    modality: 'Dual',
    ruler: 'Mercury',
    rulerName: 'Mercury (Budha)',
    gender: 'Masculine',
    luckyNumber: [3, 5],
    luckyColors: ['Emerald Green', 'Saffron'],
    luckyDay: 'Wednesday',
    gemstone: 'Emerald (Panna)',
    bodyPart: 'Arms & Shoulders',
    description: 'Curious dual air sign ruled by Mercury, excelling in communication, commerce, synthesis, and intellect.',
    hindiDescription: 'बुध द्वारा शासित वायु तत्व की द्विस्वभाव राशि; संवाद, बुद्धि और बहुमुखी प्रतिभा का प्रतीक।'
  },
  {
    index: 3,
    name: 'Cancer',
    hindiName: 'कर्क',
    sanskritName: 'Karka',
    westernName: 'Cancer',
    symbol: '♋',
    element: 'Water',
    hindiElement: 'जल',
    modality: 'Movable',
    ruler: 'Moon',
    rulerName: 'Moon (Chandra)',
    gender: 'Feminine',
    luckyNumber: [2, 7],
    luckyColors: ['Pearl White', 'Silver'],
    luckyDay: 'Monday',
    gemstone: 'Natural Pearl (Moti)',
    bodyPart: 'Chest & Heart',
    description: 'Intuitive cardinal water sign ruled by the Moon, centered on emotional depth, memory, and protection.',
    hindiDescription: 'चंद्रमा द्वारा शासित जल तत्व की चर राशि; संवेदनशीलता, मातृत्व और अंतर्ज्ञान की प्रतीक।'
  },
  {
    index: 4,
    name: 'Leo',
    hindiName: 'सिंह',
    sanskritName: 'Simha',
    westernName: 'Leo',
    symbol: '♌',
    element: 'Fire',
    hindiElement: 'अग्नि',
    modality: 'Fixed',
    ruler: 'Sun',
    rulerName: 'Sun (Surya)',
    gender: 'Masculine',
    luckyNumber: [1, 4],
    luckyColors: ['Burnished Gold', 'Ruby'],
    luckyDay: 'Sunday',
    gemstone: 'Ruby (Manik)',
    bodyPart: 'Spine & Upper Back',
    description: 'Regal fixed fire sign ruled by the Sun, expressing dignity, authority, creative pride, and vitality.',
    hindiDescription: 'सूर्य द्वारा शासित अग्नि तत्व की स्थिर राशि; तेज, आत्मविश्वास और राजसी नेतृत्व का प्रतीक।'
  },
  {
    index: 5,
    name: 'Virgo',
    hindiName: 'कन्या',
    sanskritName: 'Kanya',
    westernName: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    hindiElement: 'पृथ्वी',
    modality: 'Dual',
    ruler: 'Mercury',
    rulerName: 'Mercury (Budha)',
    gender: 'Feminine',
    luckyNumber: [5, 6],
    luckyColors: ['Olive', 'Slate'],
    luckyDay: 'Wednesday',
    gemstone: 'Emerald (Panna)',
    bodyPart: 'Digestive System',
    description: 'Analytical dual earth sign ruled by Mercury, focused on precision, discernment, service, and healing.',
    hindiDescription: 'बुध द्वारा शासित पृथ्वी तत्व की द्विस्वभाव राशि; विश्लेषण, सेवा और व्यवस्थित कार्यशैली की प्रतीक।'
  },
  {
    index: 6,
    name: 'Libra',
    hindiName: 'तुला',
    sanskritName: 'Tula',
    westernName: 'Libra',
    symbol: '♎',
    element: 'Air',
    hindiElement: 'वायु',
    modality: 'Movable',
    ruler: 'Venus',
    rulerName: 'Venus (Shukra)',
    gender: 'Masculine',
    luckyNumber: [6, 9],
    luckyColors: ['Indigo', 'Ivory'],
    luckyDay: 'Friday',
    gemstone: 'Opal / White Sapphire',
    bodyPart: 'Kidneys & Lower Back',
    description: 'Harmonious cardinal air sign ruled by Venus, seeking balance, diplomacy, justice, and partnership.',
    hindiDescription: 'शुक्र द्वारा शासित वायु तत्व की चर राशि; संतुलन, न्याय और मधुर संबंधों की प्रतीक।'
  },
  {
    index: 7,
    name: 'Scorpio',
    hindiName: 'वृश्चिक',
    sanskritName: 'Vrishchika',
    westernName: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    hindiElement: 'जल',
    modality: 'Fixed',
    ruler: 'Mars',
    rulerName: 'Mars (Mangal)',
    gender: 'Feminine',
    luckyNumber: [8, 9],
    luckyColors: ['Maroon', 'Deep Violet'],
    luckyDay: 'Tuesday',
    gemstone: 'Red Coral (Moonga)',
    bodyPart: 'Pelvic Region',
    description: 'Transformative fixed water sign ruled by Mars, embodying research, resilience, and hidden depth.',
    hindiDescription: 'मंगल द्वारा शासित जल तत्व की स्थिर राशि; गहन शोध, परिवर्तन और अदम्य इच्छाशक्ति की प्रतीक।'
  },
  {
    index: 8,
    name: 'Sagittarius',
    hindiName: 'धनु',
    sanskritName: 'Dhanu',
    westernName: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    hindiElement: 'अग्नि',
    modality: 'Dual',
    ruler: 'Jupiter',
    rulerName: 'Jupiter (Guru)',
    gender: 'Masculine',
    luckyNumber: [3, 9],
    luckyColors: ['Turmeric Yellow', 'Gold'],
    luckyDay: 'Thursday',
    gemstone: 'Yellow Sapphire (Pukhraj)',
    bodyPart: 'Thighs & Hips',
    description: 'Philosophical dual fire sign ruled by Jupiter, pursuing dharma, higher knowledge, and long journeys.',
    hindiDescription: 'बृहस्पति द्वारा शासित अग्नि तत्व की द्विस्वभाव राशि; धर्म, उच्च ज्ञान और सत्य की खोज का प्रतीक।'
  },
  {
    index: 9,
    name: 'Capricorn',
    hindiName: 'मकर',
    sanskritName: 'Makara',
    westernName: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    hindiElement: 'पृथ्वी',
    modality: 'Movable',
    ruler: 'Saturn',
    rulerName: 'Saturn (Shani)',
    gender: 'Feminine',
    luckyNumber: [4, 8],
    luckyColors: ['Midnight Blue', 'Charcoal'],
    luckyDay: 'Saturday',
    gemstone: 'Blue Sapphire (Neelam)',
    bodyPart: 'Knees & Joints',
    description: 'Disciplined cardinal earth sign ruled by Saturn, driven by perseverance, structure, and long-term mastery.',
    hindiDescription: 'शनि द्वारा शासित पृथ्वी तत्व की चर राशि; कर्म, अनुशासन और दीर्घकालिक सफलता की प्रतीक।'
  },
  {
    index: 10,
    name: 'Aquarius',
    hindiName: 'कुंभ',
    sanskritName: 'Kumbha',
    westernName: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    hindiElement: 'वायु',
    modality: 'Fixed',
    ruler: 'Saturn',
    rulerName: 'Saturn (Shani)',
    gender: 'Masculine',
    luckyNumber: [4, 8],
    luckyColors: ['Cobalt', 'Violet'],
    luckyDay: 'Saturday',
    gemstone: 'Blue Sapphire / Amethyst',
    bodyPart: 'Ankles & Calves',
    description: 'Visionary fixed air sign ruled by Saturn, dedicated to collective systems, reform, and detached insight.',
    hindiDescription: 'शनि द्वारा शासित वायु तत्व की स्थिर राशि; नवाचार, समाज कल्याण और गहन चिंतन की प्रतीक।'
  },
  {
    index: 11,
    name: 'Pisces',
    hindiName: 'मीन',
    sanskritName: 'Meena',
    westernName: 'Pisces',
    symbol: '♓',
    element: 'Water',
    hindiElement: 'जल',
    modality: 'Dual',
    ruler: 'Jupiter',
    rulerName: 'Jupiter (Guru)',
    gender: 'Feminine',
    luckyNumber: [3, 7],
    luckyColors: ['Saffron Gold', 'Seafoam'],
    luckyDay: 'Thursday',
    gemstone: 'Yellow Sapphire (Pukhraj)',
    bodyPart: 'Feet & Lymphatics',
    description: 'Compassionate dual water sign ruled by Jupiter, reflecting spiritual wisdom, empathy, and dissolution of boundaries.',
    hindiDescription: 'बृहस्पति द्वारा शासित जल तत्व की द्विस्वभाव राशि; आध्यात्मिक ज्ञान, करुणा और मोक्ष की प्रतीक।'
  }
];

export const NAKSHATRAS: NakshatraInfo[] = [
  { index: 0, name: 'Ashwini', hindiName: 'अश्विनी', lord: 'Ketu', deity: 'Ashwini Kumaras', symbol: 'Horse Head', gana: 'Deva', yoni: 'Horse', nadi: 'Adi', padaSyllables: ['Chu', 'Che', 'Cho', 'La'] },
  { index: 1, name: 'Bharani', hindiName: 'भरणी', lord: 'Venus', deity: 'Yama', symbol: 'Yoni', gana: 'Manushya', yoni: 'Elephant', nadi: 'Madhya', padaSyllables: ['Li', 'Lu', 'Le', 'Lo'] },
  { index: 2, name: 'Krittika', hindiName: 'कृत्तिका', lord: 'Sun', deity: 'Agni', symbol: 'Razor / Flame', gana: 'Rakshasa', yoni: 'Sheep', nadi: 'Antya', padaSyllables: ['A', 'I', 'U', 'E'] },
  { index: 3, name: 'Rohini', hindiName: 'रोहिणी', lord: 'Moon', deity: 'Brahma', symbol: 'Chariot', gana: 'Manushya', yoni: 'Serpent', nadi: 'Antya', padaSyllables: ['O', 'Va', 'Vi', 'Vu'] },
  { index: 4, name: 'Mrigashira', hindiName: 'मृगशिरा', lord: 'Mars', deity: 'Soma', symbol: 'Deer Head', gana: 'Deva', yoni: 'Serpent', nadi: 'Madhya', padaSyllables: ['Ve', 'Vo', 'Ka', 'Ki'] },
  { index: 5, name: 'Ardra', hindiName: 'आर्द्रा', lord: 'Rahu', deity: 'Rudra', symbol: 'Teardrop', gana: 'Manushya', yoni: 'Dog', nadi: 'Adi', padaSyllables: ['Ku', 'Gha', 'Ng', 'Chha'] },
  { index: 6, name: 'Punarvasu', hindiName: 'पुनर्वसु', lord: 'Jupiter', deity: 'Aditi', symbol: 'Bow & Quiver', gana: 'Deva', yoni: 'Cat', nadi: 'Adi', padaSyllables: ['Ke', 'Ko', 'Ha', 'Hi'] },
  { index: 7, name: 'Pushya', hindiName: 'पुष्य', lord: 'Saturn', deity: 'Brihaspati', symbol: 'Lotus / Udder', gana: 'Deva', yoni: 'Sheep', nadi: 'Madhya', padaSyllables: ['Hu', 'He', 'Ho', 'Da'] },
  { index: 8, name: 'Ashlesha', hindiName: 'आश्लेषा', lord: 'Mercury', deity: 'Nagas', symbol: 'Coiled Serpent', gana: 'Rakshasa', yoni: 'Cat', nadi: 'Antya', padaSyllables: ['Di', 'Du', 'De', 'Do'] },
  { index: 9, name: 'Magha', hindiName: 'मघा', lord: 'Ketu', deity: 'Pitris', symbol: 'Royal Throne', gana: 'Rakshasa', yoni: 'Rat', nadi: 'Antya', padaSyllables: ['Ma', 'Mi', 'Mu', 'Me'] },
  { index: 10, name: 'Purva Phalguni', hindiName: 'पूर्व फाल्गुनी', lord: 'Venus', deity: 'Bhaga', symbol: 'Swinging Hammock', gana: 'Manushya', yoni: 'Rat', nadi: 'Madhya', padaSyllables: ['Mo', 'Ta', 'Ti', 'Tu'] },
  { index: 11, name: 'Uttara Phalguni', hindiName: 'उत्तर फाल्गुनी', lord: 'Sun', deity: 'Aryaman', symbol: 'Bedstead', gana: 'Manushya', yoni: 'Cow', nadi: 'Adi', padaSyllables: ['Te', 'To', 'Pa', 'Pi'] },
  { index: 12, name: 'Hasta', hindiName: 'हस्त', lord: 'Moon', deity: 'Savitar', symbol: 'Open Hand', gana: 'Deva', yoni: 'Buffalo', nadi: 'Adi', padaSyllables: ['Pu', 'Sha', 'Na', 'Tha'] },
  { index: 13, name: 'Chitra', hindiName: 'चित्रा', lord: 'Mars', deity: 'Tvashtar', symbol: 'Bright Jewel', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Madhya', padaSyllables: ['Pe', 'Po', 'Ra', 'Ri'] },
  { index: 14, name: 'Swati', hindiName: 'स्वाति', lord: 'Rahu', deity: 'Vayu', symbol: 'Young Shoot', gana: 'Deva', yoni: 'Buffalo', nadi: 'Antya', padaSyllables: ['Ru', 'Re', 'Ro', 'Ta'] },
  { index: 15, name: 'Vishakha', hindiName: 'विशाखा', lord: 'Jupiter', deity: 'Indra-Agni', symbol: 'Triumphal Arch', gana: 'Rakshasa', yoni: 'Tiger', nadi: 'Antya', padaSyllables: ['Ti', 'Tu', 'Te', 'To'] },
  { index: 16, name: 'Anuradha', hindiName: 'अनुराधा', lord: 'Saturn', deity: 'Mitra', symbol: 'Lotus Flower', gana: 'Deva', yoni: 'Deer', nadi: 'Madhya', padaSyllables: ['Na', 'Ni', 'Nu', 'Ne'] },
  { index: 17, name: 'Jyeshtha', hindiName: 'ज्येष्ठा', lord: 'Mercury', deity: 'Indra', symbol: 'Earring / Umbrella', gana: 'Rakshasa', yoni: 'Deer', nadi: 'Adi', padaSyllables: ['No', 'Ya', 'Yi', 'Yu'] },
  { index: 18, name: 'Mula', hindiName: 'मूल', lord: 'Ketu', deity: 'Nirriti', symbol: 'Tied Roots', gana: 'Rakshasa', yoni: 'Dog', nadi: 'Adi', padaSyllables: ['Ye', 'Yo', 'Bha', 'Bhi'] },
  { index: 19, name: 'Purva Ashadha', hindiName: 'पूर्वाषाढ़ा', lord: 'Venus', deity: 'Apas', symbol: 'Winnowing Fan', gana: 'Manushya', yoni: 'Monkey', nadi: 'Madhya', padaSyllables: ['Bhu', 'Dha', 'Pha', 'Dha'] },
  { index: 20, name: 'Uttara Ashadha', hindiName: 'उत्तराषाढ़ा', lord: 'Sun', deity: 'Vishvedevas', symbol: 'Elephant Tusk', gana: 'Manushya', yoni: 'Mongoose', nadi: 'Antya', padaSyllables: ['Bhe', 'Bho', 'Ja', 'Ji'] },
  { index: 21, name: 'Shravana', hindiName: 'श्रवण', lord: 'Moon', deity: 'Vishnu', symbol: 'Ear / Three Footprints', gana: 'Deva', yoni: 'Monkey', nadi: 'Antya', padaSyllables: ['Ju', 'Je', 'Jo', 'Gha'] },
  { index: 22, name: 'Dhanishta', hindiName: 'धनिष्ठा', lord: 'Mars', deity: 'Vasus', symbol: 'Drum (Mridanga)', gana: 'Rakshasa', yoni: 'Lion', nadi: 'Madhya', padaSyllables: ['Ga', 'Gi', 'Gu', 'Ge'] },
  { index: 23, name: 'Shatabhisha', hindiName: 'शतभिषा', lord: 'Rahu', deity: 'Varuna', symbol: 'Empty Circle', gana: 'Rakshasa', yoni: 'Horse', nadi: 'Adi', padaSyllables: ['Go', 'Sa', 'Si', 'Su'] },
  { index: 24, name: 'Purva Bhadrapada', hindiName: 'पूर्व भाद्रपद', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: 'Sword / Two-Faced', gana: 'Manushya', yoni: 'Lion', nadi: 'Adi', padaSyllables: ['Se', 'So', 'Da', 'Di'] },
  { index: 25, name: 'Uttara Bhadrapada', hindiName: 'उत्तर भाद्रपद', lord: 'Saturn', deity: 'Ahir Budhnya', symbol: 'Twins / Serpent', gana: 'Manushya', yoni: 'Cow', nadi: 'Madhya', padaSyllables: ['Du', 'Tha', 'Jha', 'Na'] },
  { index: 26, name: 'Revati', hindiName: 'रेवती', lord: 'Mercury', deity: 'Pushan', symbol: 'Pair of Fish', gana: 'Deva', yoni: 'Elephant', nadi: 'Antya', padaSyllables: ['De', 'Do', 'Cha', 'Chi'] },
];

export const VIMSHOTTARI_ORDER: { lord: PlanetId; years: number }[] = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
];

export const PLANET_HINDI_NAMES: Record<PlanetId, string> = {
  Sun: 'सूर्य (Sun)',
  Moon: 'चंद्र (Moon)',
  Mars: 'मंगल (Mars)',
  Mercury: 'बुध (Mercury)',
  Jupiter: 'गुरु (Jupiter)',
  Venus: 'शुक्र (Venus)',
  Saturn: 'शनि (Saturn)',
  Rahu: 'राहु (Rahu)',
  Ketu: 'केतु (Ketu)',
};

export const PLANET_SHORT: Record<PlanetId | 'Ascendant', string> = {
  Ascendant: 'Asc',
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

// Exaltation (sign index 0..11) and Debilitation (sign index 0..11)
export const PLANET_DIGNITY_SIGNS: Record<
  PlanetId,
  { exalted: number; debilitated: number; own: number[]; friends: PlanetId[]; enemies: PlanetId[] }
> = {
  Sun: { exalted: 0, debilitated: 6, own: [4], friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'] },
  Moon: { exalted: 1, debilitated: 7, own: [3], friends: ['Sun', 'Mercury'], enemies: ['Rahu', 'Ketu'] },
  Mars: { exalted: 9, debilitated: 3, own: [0, 7], friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury', 'Rahu', 'Ketu'] },
  Mercury: { exalted: 5, debilitated: 11, own: [2, 5], friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { exalted: 3, debilitated: 9, own: [8, 11], friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus: { exalted: 11, debilitated: 5, own: [1, 6], friends: ['Mercury', 'Saturn', 'Rahu'], enemies: ['Sun', 'Moon'] },
  Saturn: { exalted: 6, debilitated: 0, own: [9, 10], friends: ['Mercury', 'Venus', 'Rahu'], enemies: ['Sun', 'Moon', 'Mars'] },
  Rahu: { exalted: 1, debilitated: 7, own: [10], friends: ['Mercury', 'Venus', 'Saturn'], enemies: ['Sun', 'Moon', 'Mars'] },
  Ketu: { exalted: 7, debilitated: 1, own: [7], friends: ['Mars', 'Jupiter', 'Venus'], enemies: ['Sun', 'Moon'] },
};

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

export const NITYA_YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti',
];

export const HINDU_MONTHS = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha',
  'Shravana', 'Bhadrapada', 'Ashwin', 'Kartika',
  'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
];
