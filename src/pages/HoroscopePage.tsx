import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { ZODIAC_SIGNS } from '../engine/constants';
import {
  getChineseHoroscopeAnnual,
  getInterpretedHoroscopes,
  getPersonalizedHoroscope,
} from '../data/horoscopes';
import { SeoHead } from '../components/SeoHead';
import { VoiceReadAloudButton } from '../components/MonetagAndSeoExtras';
import { useApp } from '../context/AppContext';

type HoroscopeTab = 'daily' | 'tomorrow' | 'weekly' | 'nextWeek' | 'monthly' | 'nextMonth' | 'yearly2026' | 'yearly2027';

const PERIOD_TABS: Array<{ key: HoroscopeTab; label: string }> = [
  { key: 'daily', label: 'Daily' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'nextWeek', label: 'Next Week' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'nextMonth', label: 'Next Month' },
  { key: 'yearly2026', label: 'Yearly 2026' },
  { key: 'yearly2027', label: 'Yearly 2027' },
];

const EDUCATIONAL_GUIDES = [
  {
    q: 'Historical Significance of Vedic Rashifal & Moon Sign Astrology',
    a: 'Classical Jyotish (Parashara, Varahamihira Brihat Samhita) interprets daily and annual transits primarily from Janma Rashi (Moon Sign) and Lagna (Ascendant), honoring how lunar rhythm modulates mind, decisions, and timing.',
  },
  {
    q: 'How Planets Shape Human Life & 2026–2027 Gochar Transits',
    a: 'Slow-moving planets—Saturn (Shani), Jupiter (Guru), and the Rahu-Ketu lunar nodes—establish multi-year thematic backdrops across career, relationships, and finances, while fast Moon transits trigger daily events.',
  },
  {
    q: 'Using Daily, Weekly & Monthly Horoscopes Wisely',
    a: 'Treat daily Rashifal as a tactical compass for pacing meetings, finances, and rest. Combine weekly and monthly trends with your personal Mahadasha/Antardasha period in our Free Kundli engine for full precision.',
  },
  {
    q: 'Long-Term Guidance: Western Sun Signs vs Vedic Sidereal Rashis',
    a: 'Western Sun astrology uses seasonal Tropical dates, whereas Indian Vedic Rashifal uses the Lahiri Chitrapaksha Sidereal zodiac (~24° offset) anchored to fixed star constellations.',
  },
];

export const HoroscopePage: React.FC = () => {
  const { sign } = useParams<{ sign?: string }>();
  const { t } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const horoscopes = useMemo(() => getInterpretedHoroscopes(today), [today]);

  const initialIdx = sign
    ? Math.max(
        0,
        ZODIAC_SIGNS.findIndex((z) => z.name.toLowerCase() === sign.toLowerCase())
      )
    : 0;
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const [period, setPeriod] = useState<HoroscopeTab>('daily');
  const [compatSign2, setCompatSign2] = useState(4);

  // Personalized Horoscope Form State
  const [pName, setPName] = useState('');
  const [pGender, setPGender] = useState('Female');
  const [pDob, setPDob] = useState('1995-08-15');
  const [personalResult, setPersonalResult] = useState<ReturnType<typeof getPersonalizedHoroscope> | null>(null);

  // Chinese Horoscope 2026 / 2027 State
  const [cnBirthYear, setCnBirthYear] = useState(1995);
  const [cnTargetYear, setCnTargetYear] = useState<2026 | 2027>(2026);
  const chineseAnnual = useMemo(() => getChineseHoroscopeAnnual(cnBirthYear, cnTargetYear), [cnBirthYear, cnTargetYear]);

  // Educational Accordions
  const [openGuideIdx, setOpenGuideIdx] = useState<number | null>(0);

  const z = ZODIAC_SIGNS[selectedIdx];
  const h = horoscopes[selectedIdx];
  const z2 = ZODIAC_SIGNS[compatSign2];
  const sameElement = z.element === z2.element;
  const complementary =
    (z.element === 'Fire' && z2.element === 'Air') ||
    (z.element === 'Air' && z2.element === 'Fire') ||
    (z.element === 'Earth' && z2.element === 'Water') ||
    (z.element === 'Water' && z2.element === 'Earth');

  const faqSchemaJson = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: EDUCATIONAL_GUIDES.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }),
    []
  );

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalResult(getPersonalizedHoroscope(pName || 'Guest', pGender, pDob));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title={`${z.name} (${z.hindiName}) Horoscope 2026 & 2027 — Daily, Weekly & Yearly`}
        description={`84-panel Vedic & Zodiac Horoscope portal for ${z.name} (${z.sanskritName}): Daily, Tomorrow, Weekly, Next Week, Monthly, Next Month, 2026/2027 Transits, Personalized DOB Horoscope & Chinese Zodiac.`}
      />
      <script type="application/ld+json">{faqSchemaJson}</script>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A6D12] dark:text-amber-400">
            12 Zodiac Signs · 84 Structured Rashifal Panels · 2026–2027 Transits
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
            {t('Horoscope & 12 Zodiac Portal', 'राशिफल एवं 12 राशियाँ पोर्टल')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              `Published ${h.publishedDate} · ${h.dateRange}. For exact astronomical Dashas & Houses, generate your Janam Kundli.`,
              `प्रकाशन तिथि ${h.publishedDate} · ${h.dateRange}। सटीक ग्रह फलित के लिए अपनी जन्म कुंडली बनाएं।`
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <VoiceReadAloudButton text={`${z.name} ${period} horoscope: ${h[period]} Career: ${h.career} Love: ${h.love}`} />
          <Link to="/brihat-kundli" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            {t('Free Brihat Kundli PDF →', 'निःशुल्क बृहत् कुंडली PDF →')}
          </Link>
        </div>
      </div>

      {/* 12 Zodiac Sign Quick Jump Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {ZODIAC_SIGNS.map((item, idx) => (
          <Link
            key={item.name}
            to={`/zodiac/${item.name.toLowerCase()}`}
            onClick={() => setSelectedIdx(idx)}
            className={`p-2.5 rounded-lg border text-center transition-colors ${
              selectedIdx === idx
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] hover:border-amber-400/60'
            }`}
          >
            <div className="text-xl leading-none">{item.symbol}</div>
            <div className="text-xs font-semibold mt-1">{item.name}</div>
            <div className="text-[11px] text-slate-500">{item.hindiName}</div>
          </Link>
        ))}
      </div>

      {/* Main Selected Sign Card with 8 Period Tabs */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {z.sanskritName} · {z.element} ({z.hindiElement}) · {z.modality} · Ruler: {z.rulerName} · {h.dateRange}
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {z.symbol} {z.name} / {z.hindiName}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPeriod(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  period === tab.key
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">{h[period]}</p>
        <p className="text-xs font-mono text-amber-700 dark:text-amber-300">{h.transitSummary}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {z.description} ({z.hindiDescription})
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            ['Love & Relationships', h.love],
            ['Career & Profession', h.career],
            ['Business Outlook', h.business],
            ['Finance & Wealth', h.finance],
            ['Health & Wellness', h.health],
            ['Education & Focus', h.education],
          ].map(([heading, text]) => (
            <div key={heading} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">{heading}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div><span className="text-slate-500 block">Lucky Number</span><span className="font-semibold text-sm">{h.luckyNumber}</span></div>
          <div><span className="text-slate-500 block">Lucky Colour</span><span className="font-semibold text-sm">{h.luckyColour}</span></div>
          <div><span className="text-slate-500 block">Lucky Time</span><span className="font-semibold text-sm">{h.luckyTime}</span></div>
          <div><span className="text-slate-500 block">Gemstone</span><span className="font-semibold text-sm">{z.gemstone}</span></div>
          <div><span className="text-slate-500 block">Body Focus</span><span className="font-semibold text-sm">{z.bodyPart}</span></div>
        </div>
      </div>

      {/* Personalized Horoscope Form + Chinese Horoscope 2026/2027 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handlePersonalSubmit}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4"
        >
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Instant DOB Calculation
            </p>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t('Personalized Horoscope by Date of Birth', 'जन्मतिथि आधारित व्यक्तिगत राशिफल')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={pName}
              onChange={(e) => setPName(e.target.value)}
              placeholder="Your Name"
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
            <select
              value={pGender}
              onChange={(e) => setPGender(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="date"
              value={pDob}
              onChange={(e) => setPDob(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('Get Personalized Horoscope', 'व्यक्तिगत राशिफल देखें')}
          </button>

          {personalResult && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-sm">
              <p className="font-mono text-xs text-amber-600 dark:text-amber-400">
                Moon Rashi: {personalResult.moonSign} · Sun Sign: {personalResult.sunSign} · {personalResult.nakshatra}
              </p>
              <p className="text-slate-700 dark:text-slate-200">{personalResult.personalDailyOutlook}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Career: {personalResult.careerAdvice} · Love: {personalResult.loveAdvice} · Lucky #{personalResult.luckyNumber} ({personalResult.luckyColor})
              </p>
            </div>
          )}
        </form>

        {/* Chinese Horoscope 2026 / 2027 */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
              12-Animal Eastern Cycle
            </p>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t('Chinese Horoscope 2026 & 2027', 'चीनी राशिफल 2026 एवं 2027')}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-slate-500">
              Birth Year:
              <input
                type="number"
                min={1925}
                max={2035}
                value={cnBirthYear}
                onChange={(e) => setCnBirthYear(Number(e.target.value) || 1995)}
                className="ml-2 w-24 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              />
            </label>
            <div className="flex gap-1.5">
              {([2026, 2027] as const).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setCnTargetYear(yr)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                    cnTargetYear === yr
                      ? 'bg-[#0D1B3E] dark:bg-amber-500 text-white dark:text-slate-950'
                      : 'border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <p className="font-mono text-xs text-amber-600 dark:text-amber-400">
              Your Sign: {chineseAnnual.element} {chineseAnnual.animal} · Transit Cycle: {chineseAnnual.yearAnimal}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{chineseAnnual.outlook}</p>
          </div>
        </div>
      </div>

      {/* Zodiac Compatibility Quick Checker */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t('Zodiac Elemental Compatibility & Tamil 10-Porutham', 'राशि तत्व अनुकूलता एवं तमिल 10-पोरुत्तम')}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold">{z.name} ({z.element})</span>
            <span className="text-slate-400">+</span>
            <select
              value={compatSign2}
              onChange={(e) => setCompatSign2(Number(e.target.value))}
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              {ZODIAC_SIGNS.map((item, idx) => (
                <option key={item.name} value={idx}>{item.name} ({item.hindiName})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 text-xs font-semibold">
            <Link to="/kundli-matching" className="text-amber-600 dark:text-amber-400 hover:underline">
              36-Pt Ashtakoot →
            </Link>
            <Link to="/tamil-porutham" className="text-amber-600 dark:text-amber-400 hover:underline">
              Tamil 10-Porutham →
            </Link>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {sameElement
            ? `Strong Natural Affinity: Both ${z.name} and ${z2.name} share the ${z.element} element, creating intuitive mutual understanding.`
            : complementary
            ? `Supportive Complementary Pairing: ${z.element} (${z.name}) and ${z2.element} (${z2.name}) stimulate constructive balance.`
            : `Growth-Oriented Pairing: ${z.element} (${z.name}) and ${z2.element} (${z2.name}) bring contrasting rhythms—evaluate full Ashtakoot or Tamil Porutham for marriage.`}
        </p>
      </div>

      {/* Educational & Historical Horoscope Knowledge Accordions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-3">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t('Understanding Horoscopes: Classical Jyotish Guides', 'राशिफल ज्ञान: शास्त्रीय ज्योतिष मार्गदर्शिका')}
        </h2>
        {EDUCATIONAL_GUIDES.map((item, idx) => {
          const open = openGuideIdx === idx;
          return (
            <div key={item.q} className="border border-slate-200 dark:border-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setOpenGuideIdx(open ? null : idx)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-semibold text-slate-900 dark:text-white cursor-pointer"
              >
                <span>{item.q}</span>
                {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
