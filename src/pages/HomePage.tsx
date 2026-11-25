import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Compass, HeartHandshake, Sparkles, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { AdSlot, MonetagDirectLinkCta } from '../components/AdSlot';
import { BirthInputForm } from '../components/BirthInputForm';
import { ZODIAC_SIGNS } from '../engine/constants';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { calculatePanchang } from '../engine/panchang';
import { getLivePlanetaryTransits } from '../engine/astrologySystems';
import { getInterpretedHoroscopes } from '../data/horoscopes';
import { INITIAL_ARTICLES } from '../data/articles';

export const HomePage: React.FC = () => {
  const { setActiveKundli, t } = useApp();
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayPanchang = useMemo(
    () => calculatePanchang(todayStr, 28.6139, 77.209, 330, 'New Delhi, India'),
    [todayStr]
  );

  const liveSky = useMemo(() => getLivePlanetaryTransits('lahiri'), []);
  const horoscopes = useMemo(() => getInterpretedHoroscopes(todayStr), [todayStr]);
  const [selectedSignIdx, setSelectedSignIdx] = useState(0);

  const handleQuickKundli = (input: BirthInput) => {
    const res = calculateKundli(input);
    setActiveKundli(res);
    navigate('/free-kundli');
  };

  const faqs = [
    {
      q: t('How accurate is the Janam Kundli calculation?', 'जन्म कुंडली की गणना कितनी सटीक है?'),
      a: t(
        'Every chart uses NASA/JPL VSOP87 & ELP2000-82B analytical planetary ephemeris via astronomy-engine with Lahiri Chitrapaksha Ayanamsha (configurable to KP, Raman, or Tropical).',
        'प्रत्येक कुंडली NASA/JPL VSOP87 और ELP2000-82B खगोलीय एफेमेरिस तथा लाहिड़ी चित्रापक्ष अयनांश पर आधारित है।'
      ),
    },
    {
      q: t('Are all 16 Divisional Charts and Ashtakoot Matching free?', 'क्या सभी 16 वर्ग कुंडली और अष्टकूट मिलान निःशुल्क हैं?'),
      a: t(
        'Yes. D1 through D60 charts, Vimshottari Dasha, Dosha & Yoga checks, 36-point Gun Milan, Panchang, Tarot, and Numerology are 100% free with no paywalls.',
        'हाँ। D1 से D60 वर्ग चार्ट, विंशोत्तरी दशा, दोष-योग, 36 गुण मिलान, पंचांग, टैरो और अंकशास्त्र पूरी तरह निःशुल्क हैं।'
      ),
    },
    {
      q: t('Do I need an API key to use GOO AI Astrologer?', 'क्या GOO AI ज्योतिषी के लिए किसी API Key की आवश्यकता है?'),
      a: t(
        'No. When an external AI model is not configured, GOO AI Astrologer runs on our built-in deterministic Vedic Knowledge Engine grounded in your computed chart.',
        'नहीं। बिना किसी बाहरी API Key के भी यह हमारे अंतर्निर्मित वैदिक ज्ञान इंजन द्वारा आपकी कुंडली के आधार पर उत्तर देता है।'
      ),
    },
  ];

  return (
    <div>
      <SeoHead
        title="GOO ASTROLOGY UNLIMITED FREE – Indian Vedic Kundli, Research & Panchang"
        description="Your Universe. Your Kundli. Your Cosmic Journey. Open-source Lahiri Sidereal Janam Kundli, Shadbala, Ashtakavarga, Eclipses, 16 Divisional Charts, Ashtakoot Matching, Daily Panchang & 12-Language SEO."
      />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E7DEC8] dark:border-slate-800 cosmic-stars">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <p className="text-xs font-medium tracking-wider uppercase text-[#9A6D12] dark:text-amber-400">
              {t('350 Real Vedic Modules · Open-Source & 100% Free-First · 12 Indian Languages', '350 वास्तविक वैदिक मॉड्यूल · ओपन-सोर्स एवं पूर्णतः निःशुल्क · 12 भारतीय भाषाएँ')}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.35rem] font-bold leading-[1.08] tracking-tight text-[#0D1B3E] dark:text-white text-balance">
              {t('Your Universe. Your Kundli. Your Cosmic Journey.', 'आपका ब्रह्मांड। आपकी कुंडली। आपकी जीवन यात्रा।')}
            </h1>
            <p className="text-base sm:text-lg text-[#4A5568] dark:text-slate-300 max-w-2xl leading-relaxed">
              {t(
                'Enterprise Indian Vedic Astrology powered by NASA/JPL VSOP87 astronomical ephemeris. Compute D1–D60 charts, Shadbala, Sarva Ashtakavarga, KP Sub-Lords, Eclipses, 36-point Matching, and Muhurat calendars offline with zero paywalls.',
                'NASA/JPL VSOP87 खगोलीय गणना पर आधारित संपूर्ण भारतीय वैदिक ज्योतिष मंच। D1–D60 चार्ट, षड्बल, अष्टकवर्ग, केपी सब-लॉर्ड, ग्रहण, अष्टकूट मिलान और मुहूर्त बिना किसी शुल्क के प्राप्त करें।'
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/free-kundli"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white transition-colors"
              >
                {t('Generate Free Kundli', 'मुफ्त जन्म कुंडली बनाएं')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] hover:border-[#C59326] text-[#0D1B3E] dark:text-slate-100 transition-colors"
              >
                {t('Vedic Research Engine', 'वैदिक शोध इंजन')}
              </Link>
              <Link
                to="/kundli-matching"
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-[#F7F2E4] dark:bg-[#0C1226] hover:border-[#C59326] text-[#0D1B3E] dark:text-slate-100 transition-colors"
              >
                {t('Kundli Matching', 'कुंडली मिलान')}
              </Link>
              <Link
                to="/ai-astrologer"
                className="inline-flex items-center gap-2 px-3 py-3 text-sm font-medium text-[#9A6D12] dark:text-amber-300 hover:underline"
              >
                <Sparkles className="w-4 h-4" />
                {t('Ask GOO AI', 'GOO AI से पूछें')}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[280px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#0B1124]">
              <img
                src="/src/assets/images/hero_cosmic_mandala_1795272508492.jpg"
                alt="Brass Indian armillary sphere and carved zodiac wheel under midnight sky"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex items-end p-5">
                <div className="text-xs text-slate-200 space-y-1">
                  <p className="font-mono text-amber-300">
                    {t('Ephemeris: VSOP87 / ELP2000-82B', 'एफेमेरिस: VSOP87 / ELP2000-82B')}
                  </p>
                  <p className="text-slate-300">
                    {t('Ayanamsha:', 'अयनांश:')} {liveSky.ayanamshaDms} · {todayPanchang.hinduMonth} {todayPanchang.vikramSamvat} VS
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Planetary Ephemeris Strip (Full-Width 4-Column Row below Hero) */}
      <section className="border-b border-[#E7DEC8] dark:border-slate-800 bg-[#F7F2E4]/75 dark:bg-[#0B1021]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-[#6B5B3E] dark:text-slate-400">{t("Today's Tithi & Paksha", 'आज की तिथि एवं पक्ष')}</p>
            <p className="text-lg font-semibold text-[#0D1B3E] dark:text-white mt-0.5">
              {todayPanchang.tithi.name}
            </p>
            <p className="text-xs text-[#9A6D12] dark:text-amber-400 font-mono">
              {todayPanchang.tithi.paksha} · {todayPanchang.vara.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B5B3E] dark:text-slate-400">{t("Today's Nakshatra", 'आज का नक्षत्र')}</p>
            <p className="text-lg font-semibold text-[#0D1B3E] dark:text-white mt-0.5">
              {todayPanchang.nakshatra.name} ({todayPanchang.nakshatra.hindiName})
            </p>
            <p className="text-xs text-[#6B5B3E] dark:text-slate-400 font-mono">
              Pada {todayPanchang.nakshatra.pada} · Lord {todayPanchang.nakshatra.lord}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B5B3E] dark:text-slate-400">{t('Rahu Kaal (New Delhi)', 'राहुकाल (नई दिल्ली)')}</p>
            <p className="text-lg font-semibold font-mono tabular-nums text-[#0D1B3E] dark:text-white mt-0.5">
              {todayPanchang.rahuKaal}
            </p>
            <p className="text-xs text-[#6B5B3E] dark:text-slate-400 font-mono">
              Sunrise {todayPanchang.sunrise} · Sunset {todayPanchang.sunset}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B5B3E] dark:text-slate-400">{t('Abhijit Muhurat', 'अभिजित मुहूर्त')}</p>
            <p className="text-lg font-semibold font-mono tabular-nums text-[#0D1B3E] dark:text-white mt-0.5">
              {todayPanchang.abhijitMuhurat}
            </p>
            <Link to="/panchang" className="text-xs font-medium text-[#9A6D12] dark:text-amber-400 hover:underline">
              {t('Open Full Panchang & City Selector →', 'पूर्ण पंचांग देखें →')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2B. Enterprise 350-Module Ecosystem (Core + Domains A–Q) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#9A6D12] dark:text-amber-400">
              {t('Open-Source Vedic Technology Ecosystem (350 Audited Modules · Core + A–Q)', 'ओपन-सोर्स वैदिक ज्योतिष पारिस्थितिकी तंत्र (350 मॉड्यूल)')}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B3E] dark:text-white mt-1">
              {t('Advanced Research, Horary, Varshaphal, India Hubs & 3D Workspace', 'उन्नत शोध, प्रश्न, वर्षफल, भारतीय स्थान एवं 3D कार्यक्षेत्र')}
            </h2>
          </div>
          <Link to="/test-registry" className="text-xs font-semibold text-[#9A6D12] dark:text-amber-400 hover:underline">
            {t('Inspect 350-Module Registry & Live QA →', 'सभी 350 मॉड्यूल व लाइव टेस्ट देखें →')}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['/research', 'Domain A', 'Vedic Research Engine', 'Shadbala, Sarva/Bhinna Ashtakavarga, Bhava Chalit, Sripati, KP Sub-Lord & Jaimini Karakamsha.'],
            ['/planetary-intelligence', 'Domain B', 'Planetary Intelligence', 'Graha Yuddha, Speeds, Stations, Exact Conjunctions, Solar/Lunar Eclipses & Retrograde Shadows.'],
            ['/prashna-varshaphal', 'Horary & Tajika', 'Prashna & Varshaphal', 'Live Prashna Kundli (Karyesha & Ithasala Yoga) plus exact annual Solar Return, Muntha & Mudda Dasha.'],
            ['/muhurat-calendar', 'Domain D', 'Calendar, Hora & .ICS', 'All-India Festivals, Ekadashi, Sankranti, 24h Planetary Hora, Tara/Chandra Bala & .ICS Export.'],
            ['/india-locations', 'Domain H', 'India 28 States + 8 UTs', 'Full Bharat Gazetteer, Kashi/Bombay historical alias resolution, Haversine nearest city & IST math.'],
            ['/academy', 'Domains J & L', 'Jyotish Academy & 12 Languages', 'Interactive Vedic learning curriculum, live quiz grading & 12-Indian-language Devanagari/regional glossary.'],
            ['/report-studio', 'Domain K', 'Unicode & PDF Studio', 'Generate print-ready Devanagari HTML, sanitized A4 PDFs, JSON archives & crisp Chart PNG downloads.'],
            ['/verification-center', 'Domain I & QA', 'Verification & 350 Registry', '12 astronomical benchmark tests, Swiss Ephemeris / VSOP87 precision audits & 350-module status tracker.'],
            ['/vedic-suite', 'New Suite #1–20', 'Jaimini, Yogini & Sudarshan', 'Chara, Yogini, Ashtottari, Kalachakra, Narayana Dasha, 12 Arudha Padas, Sudarshan 3-Ring SVG & KP 249.'],
            ['/muhurat-explorer', 'New Suite #21–32', 'Griha Pravesh, Calendars & BTR', 'Griha Pravesh, Vehicle & Business Muhurat + .ICS, Agni/Shiv Vaas, 6 Regional Calendars & Birth Time Rectifier.'],
            ['/numerology-vastu-suite', 'New Suite #33–44', 'Lo Shu, MahaVastu 16 & Mantra', '3×3 Lo Shu Grid, Chaldean Vehicle/Mobile, 16-Direction MahaVastu, Palmistry, Swapna Shastra & 136.1Hz Om.'],
            ['/sudarshan-comparator', 'New Suite #45–60', '10-Yr Timeline & Comparator', '10-Year Dasha + Gochar forecast, Dual Chart Comparator, QR Share Cards, City Panchang SEO & RSS Feeds.'],
            ['/horoscope', '84-Panel Portal', 'Horoscope & Chinese 2026/27', '12 Signs × 8 Tabs (Daily to 2027), Personalized DOB Horoscope & Shani/Rahu/Jupiter transit forecasts.'],
            ['/brihat-kundli', 'Free Dossier', 'Brihat Kundli PDF Studio', 'Complete free printable multi-chapter Brihat Kundli PDF with Dasha, Doshas, Yogas, Life Forecast & Remedies.'],
            ['/tamil-porutham', 'South Indian', 'Tamil 10-Porutham Matching', 'Dinam, Ganam, Mahendram, Stree Deergham, Yoni, Rasi, Vasya, Rajju & Vedhai astronomical compatibility.'],
            ['/spiritual-tools', 'Prashnavali & Healing', 'Ramshalaka, Hanuman & Kua', '15×15 Ramshalaka, 49-cell Hanuman Yantra, Chalisa Reader plus Feng Shui Kua, Swarodaya & Ayurveda.'],
          ].map(([href, code, title, desc]) => (
            <Link
              key={href}
              to={href}
              className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 hover:border-[#C59326] transition-colors flex flex-col justify-between space-y-2"
            >
              <div>
                <p className="text-[11px] font-mono font-semibold text-[#9A6D12] dark:text-amber-400">{code}</p>
                <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-white mt-0.5">{title}</h3>
                <p className="text-xs text-[#4A5568] dark:text-slate-400 mt-1.5 leading-relaxed">{desc}</p>
              </div>
              <span className="text-xs font-semibold text-[#9A6D12] dark:text-amber-400 pt-1">Open Module →</span>
            </Link>
          ))}
        </div>
      </section>

      <MonetagDirectLinkCta placement="homepage_top" />
      <AdSlot placement="homepage" />

      {/* 3. Instant Free Kundli Generator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {t('01. Free Janam Kundli Generator', '01. निःशुल्क जन्म कुंडली निर्माण')}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t(
                  'Enter birth details to compute North, South & East Indian charts, D1–D60 Vargas, Vimshottari Dasha, and Dosha analysis.',
                  'उत्तर, दक्षिण और पूर्व भारतीय कुंडली, D1–D60 वर्ग चार्ट, विंशोत्तरी दशा और दोष विश्लेषण तुरंत प्राप्त करें।'
                )}
              </p>
            </div>
            <Link to="/kundli-matching" className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline shrink-0">
              {t('Need Marriage Matching? →', 'विवाह गुण मिलान करें →')}
            </Link>
          </div>
          <BirthInputForm onSubmit={handleQuickKundli} />
        </div>
      </section>

      {/* 4. Today's Panchang + Kundli Matching + Tarot & Numerology Bento */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] overflow-hidden flex flex-col">
          <div className="aspect-[4/3] bg-slate-900">
            <img
              src="/src/assets/images/panchang_almanac_1795272507611.jpg"
              alt="Brass Vedic Panchang astrolabe, almanac scroll, and diya"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {todayStr} · Vikram Samvat {todayPanchang.vikramSamvat}
              </p>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t("Today's Panchang & Choghadiya", 'आज का पंचांग और चौघड़िया')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {t(
                  `Yoga: ${todayPanchang.yoga.name} · Karana: ${todayPanchang.karana.name} · Brahma Muhurat: ${todayPanchang.brahmaMuhurat}`,
                  `योग: ${todayPanchang.yoga.name} · करण: ${todayPanchang.karana.name} · ब्रह्म मुहूर्त: ${todayPanchang.brahmaMuhurat}`
                )}
              </p>
            </div>
            <Link to="/panchang" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              <Calendar className="w-4 h-4" />
              {t('Explore Panchang & Muhurat', 'पंचांग एवं मुहूर्त खोलें')}
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] overflow-hidden flex flex-col">
          <div className="aspect-[4/3] bg-slate-900">
            <img
              src="/src/assets/images/tarot_celestial_deck_1795272508164.jpg"
              alt="Gold-foil midnight celestial Tarot deck on basalt slate"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">78-Card Deck · Pythagorean &amp; Chaldean</p>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('Tarot & Numerology Suite', 'टैरो और अंकशास्त्र')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {t(
                  'Draw 1, 3, or 5-card Tarot spreads for love, career, and Yes/No clarity, or compute your full Life Path & Chaldean Name numbers.',
                  'प्रेम, करियर और मार्गदर्शन के लिए टैरो कार्ड निकालें या अपना मूलांक, भाग्यांक और नाम अंक जानें।'
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link to="/tarot" className="text-amber-600 dark:text-amber-400 hover:underline">
                {t('Draw Tarot', 'टैरो रीडिंग')}
              </Link>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <Link to="/numerology" className="text-amber-600 dark:text-amber-400 hover:underline">
                {t('Numerology', 'अंकशास्त्र')}
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] overflow-hidden flex flex-col">
          <div className="aspect-[4/3] bg-slate-900">
            <img
              src="/src/assets/images/vastu_compass_1795272509274.jpg"
              alt="Engraved brass Vastu directional compass and rose quartz on stone grid"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ashtakoot 36 Gun · Vastu · KP · Lal Kitab</p>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('Matching, Vastu & Vedic Systems', 'मिलान, वास्तु एवं अन्य प्रणालियां')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {t(
                  'Evaluate 36-point Ashtakoot marriage compatibility with Manglik exceptions, inspect 8-direction Vastu, KP Sub-lords, and Lal Kitab principles.',
                  'मांगलिक परिहार सहित 36-गुण अष्टकूट मिलान, 8 दिशाओं का वास्तु और केपी सब-लॉर्ड गणना देखें।'
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link to="/kundli-matching" className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline">
                <HeartHandshake className="w-4 h-4" />
                {t('Match Kundli', 'कुंडली मिलान')}
              </Link>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <Link to="/vastu" className="text-amber-600 dark:text-amber-400 hover:underline">
                {t('Vastu', 'वास्तु')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Daily Interpretive Horoscope & 12 Zodiac Signs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t('02. Daily Interpretive Horoscope & 12 Rashis', '02. दैनिक राशिफल एवं 12 राशियाँ')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t(
                `Interpretive editorial guide published ${todayStr}. Not a substitute for your individual birth-chart calculation.`,
                `प्रकाशन तिथि ${todayStr} · यह सामान्य राशि व्याख्या है; व्यक्तिगत फल के लिए जन्म कुंडली देखें।`
              )}
            </p>
          </div>
          <Link to="/horoscope" className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            {t('All Periods (Daily / Weekly / Yearly) →', 'साप्ताहिक व वार्षिक राशिफल →')}
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2.5 mb-5">
          {ZODIAC_SIGNS.map((z, idx) => (
            <button
              key={z.name}
              type="button"
              onClick={() => setSelectedSignIdx(idx)}
              className={`p-3 rounded-lg border text-center transition-colors cursor-pointer ${
                selectedSignIdx === idx
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <div className="text-xl leading-none mb-1">{z.symbol}</div>
              <div className="text-xs font-semibold truncate">{z.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{z.hindiName}</div>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ZODIAC_SIGNS[selectedSignIdx].sanskritName} · {ZODIAC_SIGNS[selectedSignIdx].element} · Ruler: {ZODIAC_SIGNS[selectedSignIdx].rulerName}
            </p>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {ZODIAC_SIGNS[selectedSignIdx].name} ({ZODIAC_SIGNS[selectedSignIdx].hindiName})
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {horoscopes[selectedSignIdx].daily}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Love: {horoscopes[selectedSignIdx].love} · Career: {horoscopes[selectedSignIdx].career}
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-between lg:items-end border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
            <div className="text-xs space-y-1 font-mono text-slate-600 dark:text-slate-300">
              <div>Lucky Number: {horoscopes[selectedSignIdx].luckyNumber}</div>
              <div>Lucky Colour: {horoscopes[selectedSignIdx].luckyColour}</div>
              <div>Lucky Time: {horoscopes[selectedSignIdx].luckyTime}</div>
            </div>
            <Link
              to={`/zodiac/${ZODIAC_SIGNS[selectedSignIdx].name.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 whitespace-nowrap shrink-0"
            >
              {t('Open Full Sign Profile', 'राशि विवरण खोलें')}
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Live Planetary Positions + Free Astrology Tools Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t('03. Live Sidereal Planetary Transits (Gochar)', '03. वर्तमान ग्रह गोचर (निरयण)')}
            </h2>
            <Link to="/transits" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              {t('Sade Sati & Transits →', 'साढ़ेसाती एवं गोचर →')}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-3 font-medium">Planet</th>
                  <th className="py-2 pr-3 font-medium">Rashi</th>
                  <th className="py-2 pr-3 font-medium">Degree</th>
                  <th className="py-2 pr-3 font-medium">Nakshatra</th>
                  <th className="py-2 font-medium text-right">Motion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {liveSky.planets.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-100">{p.id}</td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{p.signName} ({p.hindiSign})</td>
                    <td className="py-2 pr-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">{p.dms}</td>
                    <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{p.nakshatraName} P{p.pada}</td>
                    <td className="py-2 text-right font-mono">
                      {p.isRetrograde ? 'Retrograde (R)' : 'Direct'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('04. Free Astrology Services & Tools', '04. निःशुल्क ज्योतिष सेवाएं')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
              {t('Every calculator runs instantaneously with validated astronomical math.', 'सभी कैलकुलेटर सटीक खगोलीय गणित के साथ तुरंत परिणाम देते हैं।')}
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-xs font-medium">
              {[
                ['/free-kundli', 'Janam Kundli (D1–D60)'],
                ['/kundli-matching', 'Ashtakoot Matching'],
                ['/manglik-calculator', 'Manglik Calculator'],
                ['/sade-sati', 'Sade Sati & Dhaiya'],
                ['/dasha', 'Vimshottari Dasha'],
                ['/nakshatra-finder', 'Nakshatra Finder'],
                ['/baby-names', 'Baby Name Finder'],
                ['/kp-astrology', 'KP Sub-Lord Table'],
                ['/lal-kitab', 'Lal Kitab Analysis'],
                ['/tools', 'View All 26 Tools →'],
              ].map(([path, label]) => (
                <Link
                  key={path}
                  to={path}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-slate-700 dark:text-slate-200 transition-colors truncate"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">{t('Want human guidance?', 'आचार्य परामर्श चाहते हैं?')}</span>
            <Link to="/astrologers" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
              {t('Verified Astrologers Directory →', 'ज्योतिषाचार्य सूची →')}
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Latest Astrology Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {t('05. Latest Vedic Astrology Guides', '05. नवीनतम ज्योतिष लेख एवं मार्गदर्शिकाएं')}
          </h2>
          <Link to="/blog" className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            {t('Read All Articles →', 'सभी लेख पढ़ें →')}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_ARTICLES.slice(0, 3).map((art) => (
            <Link
              key={art.slug}
              to={`/articles/${art.slug}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 hover:border-amber-500/60 transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {art.category} · {art.publishedAt} · {art.readTime}
                </p>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {art.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                  {art.excerpt}
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {t('Read Guide →', 'पूरा लेख पढ़ें →')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {t('Frequently Asked Questions', 'अक्सर पूछे जाने वाले प्रश्न')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((item) => (
              <div key={item.q} className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
