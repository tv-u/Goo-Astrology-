import {
  LOCALE_STRINGS,
  SUPPORTED_LANGUAGES,
  type IndianLanguageCode,
  type LocaleDictionary,
} from '../data/locales';

export interface VedicGlossaryTerm {
  id: string;
  english: string;
  sanskrit: string;
  category: 'Core' | 'Panchang' | 'Dasha' | 'Divisional' | 'Research';
  definition: string;
  translations: Partial<Record<IndianLanguageCode, string>>;
}

export const VEDIC_MULTILINGUAL_GLOSSARY: VedicGlossaryTerm[] = [
  {
    id: 'lagna',
    english: 'Ascendant (Lagna)',
    sanskrit: 'लग्नम्',
    category: 'Core',
    definition: 'The exact eastern zodiac sign rising on the local horizon at the moment of birth; anchors House 1 of the Rashi chart.',
    translations: {
      en: 'Ascendant (Lagna)', hi: 'लग्न', sa: 'लग्नम्', bn: 'লগ্ন', ta: 'லக்னம்', te: 'లగ్నం',
      mr: 'लग्न', gu: 'લગ્ન', kn: 'ಲಗ್ನ', ml: 'ലഗ്നം', pa: 'ਲਗਨ', or: 'ଲଗ୍ନ',
    },
  },
  {
    id: 'rashi',
    english: 'Moon Sign (Rashi)',
    sanskrit: 'चन्द्रराशिः',
    category: 'Core',
    definition: 'The 30-degree sidereal zodiac sign occupied by the Moon at birth; foundational for emotional mind, Gochar transits, and Ashtakoot.',
    translations: {
      en: 'Moon Sign (Rashi)', hi: 'चंद्र राशि', sa: 'चन्द्रराशिः', bn: 'চন্দ্র রাশি', ta: 'சந்திர ராசி', te: 'చంద్ర రాశి',
      mr: 'चंद्र रास', gu: 'ચંદ્ર રાશિ', kn: 'ಚಂದ್ರ ರಾಶಿ', ml: 'ചന്ദ്ര രാശി', pa: 'ਚੰਦਰ ਰਾਸ਼ੀ', or: 'ଚନ୍ଦ୍ର ରାଶି',
    },
  },
  {
    id: 'nakshatra',
    english: 'Lunar Mansion (Nakshatra)',
    sanskrit: 'नक्षत्रम्',
    category: 'Core',
    definition: 'One of 27 equal 13°20′ divisions of the sidereal ecliptic, each split into 4 Padas of 3°20′.',
    translations: {
      en: 'Nakshatra', hi: 'नक्षत्र', sa: 'नक्षत्रम्', bn: 'নক্ষত্র', ta: 'நட்சத்திரம்', te: 'నక్షత్రం',
      mr: 'नक्षत्र', gu: 'નક્ષત્ર', kn: 'ನಕ್ಷತ್ರ', ml: 'നക്ഷത്രം', pa: 'ਨਕਸ਼ਤਰ', or: 'ନକ୍ଷତ୍ର',
    },
  },
  {
    id: 'ayanamsha',
    english: 'Precession Offset (Ayanamsha)',
    sanskrit: 'अयनांशः',
    category: 'Research',
    definition: 'Angular difference between the Tropical (Sayana) vernal equinox and the fixed Sidereal (Nirayana) star reference (Lahiri Chitrapaksha).',
    translations: {
      en: 'Ayanamsha', hi: 'अयनांश', sa: 'अयनांशः', bn: 'অয়নাংশ', ta: 'அயனாம்சம்', te: 'అయనాంశం',
      mr: 'अयनांश', gu: 'અયનાંશ', kn: 'ಅಯನಾಂಶ', ml: 'അയനാംശം', pa: 'ਅਯਨਾਂਸ਼', or: 'ଅୟନାଂଶ',
    },
  },
  {
    id: 'tithi',
    english: 'Lunar Day (Tithi)',
    sanskrit: 'तिथिः',
    category: 'Panchang',
    definition: 'Each 12° increment of elongation between Moon and Sun sidereal longitudes across Shukla (waxing) and Krishna (waning) fortnights.',
    translations: {
      en: 'Tithi', hi: 'तिथि', sa: 'तिथिः', bn: 'তিথি', ta: 'திதி', te: 'తిథి',
      mr: 'तिथी', gu: 'તિથિ', kn: 'ತಿಥಿ', ml: 'തിഥി', pa: 'ਤਿਥੀ', or: 'ତିଥି',
    },
  },
  {
    id: 'muhurat',
    english: 'Electional Timing (Muhurat)',
    sanskrit: 'मुहूर्तः',
    category: 'Panchang',
    definition: 'Auspicious electional time window validated against Tithi, Vara, Nakshatra, Tara Bala, Chandra Bala, and avoiding Rahu Kaal / Bhadra.',
    translations: {
      en: 'Muhurat', hi: 'मुहूर्त', sa: 'मुहूर्तः', bn: 'মুহূর্ত', ta: 'முகூர்த்தம்', te: 'ముహూర్తం',
      mr: 'मुहूर्त', gu: 'મુહૂર્ત', kn: 'ಮುಹೂರ್ತ', ml: 'മുഹൂർത്തം', pa: 'ਮੁਹੂਰਤ', or: 'ମୁହୂର୍ତ୍ତ',
    },
  },
  {
    id: 'vimshottari',
    english: 'Vimshottari Dasha (120-Yr Cycle)',
    sanskrit: 'विंशोत्तरी दशा',
    category: 'Dasha',
    definition: 'The premier Parashari planetary timeline spanning 120 years seeded by the natal Moon Nakshatra degree balance.',
    translations: {
      en: 'Vimshottari Dasha', hi: 'विंशोत्तरी दशा', sa: 'विंशोत्तरीदशा', bn: 'বিংশোত্তরী দশা', ta: 'விம்சோத்தரி தசா', te: 'వింశోత్తరి దశ',
      mr: 'विंशोत्तरी दशा', gu: 'વિંશોત્તરી દશા', kn: 'ವಿಂಶೋತ್ತರಿ ದಶೆ', ml: 'വിംശോത്തരി ദശ', pa: 'ਵਿਮਸ਼ੋਤਰੀ ਦਸ਼ਾ', or: 'ବିଂଶୋତ୍ତରୀ ଦଶା',
    },
  },
  {
    id: 'navamsa',
    english: 'Navamsa (D9 Chart)',
    sanskrit: 'नवांशः',
    category: 'Divisional',
    definition: 'Ninth-harmonic divisional chart (3°20′ per pada) showing inner planetary strength, dharma, and marital partnership.',
    translations: {
      en: 'Navamsa (D9)', hi: 'नवांश (D9)', sa: 'नवांशः', bn: 'নবাংশ (D9)', ta: 'நவாம்சம் (D9)', te: 'నవాంశం (D9)',
      mr: 'नवमांश (D9)', gu: 'નવમાંશ (D9)', kn: 'ನವಾಂಶ (D9)', ml: 'നവാംശം (D9)', pa: 'ਨਵਾਂਸ਼ (D9)', or: 'ନବାଂଶ (D9)',
    },
  },
  {
    id: 'ashtakavarga',
    english: 'Ashtakavarga (SAV 337 Bindus)',
    sanskrit: 'अष्टकवर्गः',
    category: 'Research',
    definition: 'Point-based strength grid across 8 benefic contributors per planet summing mathematically to exactly 337 Bindus in Sarva Ashtakavarga.',
    translations: {
      en: 'Ashtakavarga', hi: 'अष्टकवर्ग', sa: 'अष्टकवर्गः', bn: 'অষ্টকবর্গ', ta: 'அஷ்டவர்க்கம்', te: 'అష్టకవర్గు',
      mr: 'अष्टकवर्ग', gu: 'અષ્ટકવર્ગ', kn: 'ಅಷ್ಟಕವರ್ಗ', ml: 'അഷ്ടകവർഗ്ഗം', pa: 'ਅਸ਼ਟਕਵਰਗ', or: 'ଅଷ୍ଟକବର୍ଗ',
    },
  },
  {
    id: 'shadbala',
    english: 'Shadbala (Six-Fold Strength)',
    sanskrit: 'षड्बलम्',
    category: 'Research',
    definition: 'Composite Virupa/Rupa planetary evaluation summing Sthana, Dig, Kala, Cheshta, Naisargika, and Drik Bala.',
    translations: {
      en: 'Shadbala', hi: 'षड्बल', sa: 'षड्बलम्', bn: 'ষড়বল', ta: 'ஷட்பலம்', te: 'షడ్బలం',
      mr: 'षड्बल', gu: 'ષડ્બળ', kn: 'ಷಡ್ಬಲ', ml: 'ഷഡ്ബലം', pa: 'ਸ਼ਡਬਲ', or: 'ଷଡ଼୍ବଳ',
    },
  },
  {
    id: 'ashtakoot',
    english: 'Ashtakoot Milan (36 Gunas)',
    sanskrit: 'अष्टकूटमेलनम्',
    category: 'Core',
    definition: '8-factor Vedic compatibility scoring system totaling 36 Gunas: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi.',
    translations: {
      en: 'Ashtakoot (36 Gunas)', hi: 'अष्टकूट मिलान', sa: 'अष्टकूटमेलनम्', bn: 'অষ্টকূট মিলন', ta: 'அஷ்டகூட பொருத்தம்', te: 'అష్టకూట పొంతన',
      mr: 'अष्टकूट गुणमिलन', gu: 'અષ્ટકૂટ મિલન', kn: 'ಅಷ್ಟಕೂಟ ಹೊಂದಾಣಿಕೆ', ml: 'അഷ്ടകൂട പൊരുത്തം', pa: 'ਅਸ਼ਟਕੂਟ ਮਿਲਾਨ', or: 'ଅଷ୍ଟକୂଟ ମିଳନ',
    },
  },
  {
    id: 'karakamsha',
    english: 'Karakamsha (Jaimini D9)',
    sanskrit: 'कारकांशः',
    category: 'Research',
    definition: 'Navamsa sign occupied by the planet holding the highest sidereal longitude within its sign (Atmakaraka).',
    translations: {
      en: 'Karakamsha', hi: 'कारकांश', sa: 'कारकांशः', bn: 'কারকাংশ', ta: 'காரகாம்சம்', te: 'కారకాంశ',
      mr: 'कारकांश', gu: 'કારકાંશ', kn: 'ಕಾರಕಾಂಶ', ml: 'കാരകാംശം', pa: 'ਕਾਰਕਾਂਸ਼', or: 'ਕਾਰକାଂଶ',
    },
  },
];

export function formatLocalizedNumber(value: number, language: IndianLanguageCode): string {
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const localeTag = meta?.hreflang || 'en-IN';
  try {
    return new Intl.NumberFormat(localeTag).format(value);
  } catch {
    return new Intl.NumberFormat('en-IN').format(value);
  }
}

export function formatLocalizedDate(dateInput: Date | string, language: IndianLanguageCode): string {
  const date = typeof dateInput === 'string' ? new Date(`${dateInput}T00:00:00Z`) : dateInput;
  if (Number.isNaN(date.getTime())) return String(dateInput);
  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const localeTag = meta?.hreflang || 'en-IN';
  try {
    return new Intl.DateTimeFormat(localeTag, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function translateDictKey(language: IndianLanguageCode, key: keyof LocaleDictionary): string {
  return LOCALE_STRINGS[language]?.[key] || LOCALE_STRINGS.en[key];
}

export interface LanguageAuditReport {
  code: IndianLanguageCode;
  name: string;
  nativeName: string;
  script: string;
  uiKeysTotal: number;
  uiKeysTranslated: number;
  uiCoveragePct: number;
  glossaryTermsTotal: number;
  glossaryTermsTranslated: number;
}

export function auditMultilingualCompleteness(): LanguageAuditReport[] {
  const enDict = LOCALE_STRINGS.en;
  const allKeys = Object.keys(enDict) as (keyof LocaleDictionary)[];

  return SUPPORTED_LANGUAGES.map((lang) => {
    const dict = LOCALE_STRINGS[lang.code];
    const uiTranslated = allKeys.filter((k) => Boolean(dict?.[k] && dict[k].trim().length > 0)).length;
    const glossaryTranslated = VEDIC_MULTILINGUAL_GLOSSARY.filter((g) =>
      Boolean(g.translations[lang.code])
    ).length;

    return {
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      script: lang.script,
      uiKeysTotal: allKeys.length,
      uiKeysTranslated: uiTranslated,
      uiCoveragePct: Math.round((uiTranslated / allKeys.length) * 100),
      glossaryTermsTotal: VEDIC_MULTILINGUAL_GLOSSARY.length,
      glossaryTermsTranslated: glossaryTranslated,
    };
  });
}

export function searchVedicGlossary(query: string, category?: string): VedicGlossaryTerm[] {
  const q = query.trim().toLowerCase();
  return VEDIC_MULTILINGUAL_GLOSSARY.filter((item) => {
    const catMatch = !category || category === 'All' || item.category === category;
    if (!catMatch) return false;
    if (!q) return true;
    return (
      item.english.toLowerCase().includes(q) ||
      item.sanskrit.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      Object.values(item.translations).some((v) => v?.toLowerCase().includes(q))
    );
  });
}
