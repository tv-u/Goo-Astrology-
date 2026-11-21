import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { BABY_NAMES_DATASET } from '../data/babyNames';
import { NAKSHATRAS, ZODIAC_SIGNS } from '../engine/constants';
import { BirthInputForm } from '../components/BirthInputForm';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { getChineseZodiac, getKpStarAndSubLord, getLivePlanetaryTransits, VASTU_ZONES } from '../engine/astrologySystems';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const VastuPage: React.FC = () => {
  const { t } = useApp();
  const [facing, setFacing] = useState('East (Purva)');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead title="Vastu Shastra Directional Analyzer" description="Eight-direction Vastu Shastra layout recommendations, elements, and room placement guide." />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Vastu Shastra Directional Compass & Room Guide', 'वास्तु शास्त्र दिशा एवं कक्ष मार्गदर्शिका')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Evaluate directional elemental balance across all eight cardinal and ordinal zones.
          </p>
          <div className="pt-2">
            <label className="text-xs text-slate-500 mr-3">Main Entrance Facing:</label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C1226]"
            >
              {VASTU_ZONES.map((z) => <option key={z.direction} value={z.direction}>{z.direction}</option>)}
            </select>
          </div>
        </div>
        <div className="lg:col-span-4 aspect-[4/3] max-h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <img src="/src/assets/images/vastu_compass_1795272509274.jpg" alt="Brass Vastu compass" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {VASTU_ZONES.map((z) => (
          <div
            key={z.direction}
            className={`rounded-xl border p-5 space-y-2 ${
              z.direction === facing
                ? 'border-amber-500 bg-amber-500/5'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226]'
            }`}
          >
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{z.element} · Deity: {z.deity}</p>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{z.direction}</h2>
            <p className="text-xs text-slate-700 dark:text-slate-300">Favored: {z.bestUses.join(', ')}</p>
            <p className="text-xs text-slate-500">Avoid: {z.avoid.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const KpAndLalKitabPage: React.FC<{ mode: 'kp' | 'lalkitab' }> = ({ mode }) => {
  const { activeKundli, setActiveKundli } = useApp();
  const kundli =
    activeKundli ||
    calculateKundli({
      name: 'Native',
      date: '1995-08-15',
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 330,
      ayanamsha: mode === 'kp' ? 'kp' : 'lahiri',
    });

  const prashnaSky = useMemo(() => getLivePlanetaryTransits('kp'), []);
  const chinese = getChineseZodiac(Number(kundli.input.date.slice(0, 4)) || 1995);

  const onUpdate = (inp: BirthInput) => setActiveKundli(calculateKundli({ ...inp, ayanamsha: mode === 'kp' ? 'kp' : inp.ayanamsha }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title={mode === 'kp' ? 'KP Astrology (249 Sub-Lord & Prashna)' : 'Lal Kitab, Western, Chinese Zodiac & Vedic Systems'}
        description="KP Star-Lord and Sub-Lord calculation, Prashna Horary sky chart, Lal Kitab house karaka analysis, Chinese Zodiac, Gemstone, Rudraksha, and Palmistry education."
      />
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
        {mode === 'kp'
          ? 'KP Astrology (Krishnamurti Padhdhati) & Prashna Kundli'
          : 'Lal Kitab, Western, Chinese Zodiac & Classical Remedies'}
      </h1>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
        <BirthInputForm initialValue={kundli.input} onSubmit={onUpdate} submitLabel="Compute Chart" />
      </div>

      {mode === 'kp' ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
            <h2 className="font-display text-2xl font-bold mb-4">KP Significator Table (Rashi Lord / Star Lord / Sub-Lord)</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                  <th className="py-2 pr-3">Body</th>
                  <th className="py-2 pr-3">Sidereal Degree</th>
                  <th className="py-2 pr-3">Rashi Lord</th>
                  <th className="py-2 pr-3">Nakshatra (Star Lord)</th>
                  <th className="py-2">Sub-Lord</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {[kundli.ascendant, ...kundli.planets].map((p) => {
                  const kp = getKpStarAndSubLord(p.longitude);
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-semibold">{p.id}</td>
                      <td className="py-2.5 pr-3 font-mono">{p.signName} {p.dms}</td>
                      <td className="py-2.5 pr-3">{kp.rashiLord}</td>
                      <td className="py-2.5 pr-3">{kp.nakshatra} ({kp.starLord})</td>
                      <td className="py-2.5 font-semibold text-amber-600 dark:text-amber-400">{kp.subLord}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
            <h2 className="font-display text-2xl font-bold mb-2">Live Prashna (Horary) Sky Reference</h2>
            <p className="text-xs text-slate-500 mb-3">Calculated for the exact present UTC moment ({prashnaSky.utcIso}) using KP Ayanamsha.</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {prashnaSky.planets.slice(0, 5).map((p) => (
                <div key={p.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="font-semibold">{p.id}</p>
                  <p className="font-mono text-amber-500">{p.signName} {p.dms}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-3">
            <h2 className="font-display text-2xl font-bold">Lal Kitab Kaalpurush House View</h2>
            <p className="text-xs text-slate-500">Lal Kitab treats Aries as fixed 1st house irrespective of Lagna, focusing on planetary Pakka Ghar (permanent house) & karmic conduct.</p>
            <div className="space-y-1.5 text-xs">
              {kundli.planets.slice(0, 7).map((p) => (
                <div key={p.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold">{p.id} in House {p.house}</span>
                  <span>{p.dignity} · {p.isCombust ? 'Eclipsed/Combust' : 'Clear'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-3">
            <h2 className="font-display text-2xl font-bold">Western Tropical, Chinese Zodiac &amp; Educational Guides</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Chinese Zodiac ({kundli.input.date.slice(0, 4)}): <span className="font-semibold">{chinese.animal} ({chinese.element})</span> — {chinese.summary}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemstone &amp; Rudraksha Note: Classical Ratna-shastra associates {ZODIAC_SIGNS[kundli.lagnaSignIndex].gemstone} with your Lagna lord ({ZODIAC_SIGNS[kundli.lagnaSignIndex].rulerName}). Always verify functional benefic status before wearing any Ratna.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Educational Systems: Nadi Astrology (Agastya/Bhrigu palm-leaf tradition), Samudrika Shastra (Palmistry: Life, Head, Heart &amp; Fate lines), and Face Reading (Mukh Samudrika) are cultural interpretive disciplines distinct from mathematical ephemeris astronomy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const BabyNamesPage: React.FC = () => {
  const { t } = useApp();
  const [query, setQuery] = useState('');
  const [rashiFilter, setRashiFilter] = useState('All');
  const [nakshatraFilter, setNakshatraFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [originFilter, setOriginFilter] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filtered = BABY_NAMES_DATASET.filter((n) => {
    if (rashiFilter !== 'All' && n.rashi !== rashiFilter) return false;
    if (nakshatraFilter !== 'All' && n.nakshatra !== nakshatraFilter) return false;
    if (genderFilter !== 'All' && n.gender !== genderFilter) return false;
    if (originFilter !== 'All' && n.origin !== originFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return (
        n.name.toLowerCase().includes(q) ||
        n.meaning.toLowerCase().includes(q) ||
        n.startingLetter.toLowerCase() === q
      );
    }
    return true;
  });

  const toggleFav = (id: string) =>
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Baby Name Finder by Rashi, Nakshatra & Numerology"
        description="Search curated Sanskrit, Hindi, and Vedic baby names filtered by Rashi, Nakshatra, starting syllable, gender, and numerology."
      />
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          {t('Vedic Baby Name Finder (Rashi & Nakshatra)', 'शिशु नाम खोज (राशि व नक्षत्र अनुसार)')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Curated Sanskrit, Hindi, and Vedic names with pronunciation, meaning, and numerology.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, letter, or meaning..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
        </div>
        <select value={rashiFilter} onChange={(e) => setRashiFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]">
          <option value="All">All Rashis</option>
          {ZODIAC_SIGNS.map((z) => <option key={z.name} value={z.name}>{z.name} ({z.hindiName})</option>)}
        </select>
        <select value={nakshatraFilter} onChange={(e) => setNakshatraFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]">
          <option value="All">All Nakshatras</option>
          {NAKSHATRAS.map((n) => <option key={n.name} value={n.name}>{n.name}</option>)}
        </select>
        <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]">
          <option value="All">All Genders</option>
          <option value="Boy">Boy</option>
          <option value="Girl">Girl</option>
          <option value="Unisex">Unisex</option>
        </select>
        <select value={originFilter} onChange={(e) => setOriginFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]">
          <option value="All">All Origins</option>
          <option value="Sanskrit">Sanskrit</option>
          <option value="Hindi">Hindi</option>
          <option value="Vedic">Vedic</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((n) => {
          const fav = favorites.includes(n.id);
          return (
            <div key={n.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 flex flex-col justify-between space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                    {n.name} <span className="text-base font-normal text-amber-600 dark:text-amber-400">({n.hindi})</span>
                  </h2>
                  <p className="text-xs text-slate-500">{n.gender} · {n.origin} · Pronounced {n.pronunciation}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFav(n.id)}
                  aria-label="Favorite name"
                  className={`p-1.5 rounded-md cursor-pointer ${fav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
                >
                  <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{n.meaning}</p>
              <p className="text-xs font-mono text-slate-500">
                Rashi: {n.rashi} · Nakshatra: {n.nakshatra} · Numerology #{n.numerologyNumber}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FinderToolPage: React.FC<{ finderType: 'nakshatra' | 'rashi' | 'lagna' }> = ({ finderType }) => {
  const [result, setResult] = useState(() =>
    calculateKundli({
      name: 'User',
      date: '1995-08-15',
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 330,
    })
  );
  const moon = result.planets[1];
  const nakInfo = NAKSHATRAS[moon.nakshatraIndex];
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title={`${finderType.toUpperCase()} Calculator`}
        description="Calculate your exact Vedic Moon Nakshatra, Pada, Janma Rashi, or Rising Lagna from astronomical coordinates."
      />
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white capitalize">
        {finderType} Finder Calculator
      </h1>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
        <BirthInputForm initialValue={result.input} onSubmit={(inp) => setResult(calculateKundli(inp))} submitLabel={`Find My ${finderType}`} />
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-2">
        {finderType === 'nakshatra' && (
          <>
            <h2 className="font-display text-2xl font-bold">Janma Nakshatra: {nakInfo.name} ({nakInfo.hindiName}) — Pada {moon.pada}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Lord: {nakInfo.lord} · Deity: {nakInfo.deity} · Gana: {nakInfo.gana} · Nadi: {nakInfo.nadi} · Yoni: {nakInfo.yoni} · Naming Syllable: {nakInfo.padaSyllables[moon.pada - 1]}
            </p>
          </>
        )}
        {finderType === 'rashi' && (
          <>
            <h2 className="font-display text-2xl font-bold">Janma Rashi (Moon Sign): {moon.signName} ({moon.hindiSign})</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Moon Degree: {moon.dms} · Nakshatra: {moon.nakshatraName} Pada {moon.pada}</p>
          </>
        )}
        {finderType === 'lagna' && (
          <>
            <h2 className="font-display text-2xl font-bold">Lagna (Ascendant): {result.ascendant.signName} ({result.ascendant.hindiSign})</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">Ascendant Degree: {result.ascendant.dms} · Nakshatra: {result.ascendant.nakshatraName} Pada {result.ascendant.pada}</p>
          </>
        )}
      </div>
    </div>
  );
};

export const ToolsDirectoryPage: React.FC = () => {
  const tools = [
    ['/free-kundli', 'Free Janam Kundli', 'D1–D60 charts, planetary degrees, aspects & Dasha'],
    ['/kundli-matching', 'Kundli Matching', '36-point Ashtakoot Gun Milan & Manglik check'],
    ['/manglik-calculator', 'Manglik Calculator', 'Kuja Dosha check with classical cancellation rules'],
    ['/sade-sati', 'Sade Sati Calculator', 'Live Saturn transit phases & Dhaiya checker'],
    ['/nakshatra-finder', 'Nakshatra Calculator', 'Exact Moon Nakshatra, Pada & naming syllable'],
    ['/rashi-finder', 'Rashi Calculator', 'Vedic Moon Sign (Chandra Rashi) calculator'],
    ['/lagna-finder', 'Lagna Calculator', 'Rising Ascendant sign & degree calculator'],
    ['/numerology', 'Numerology Calculator', 'Life Path, Destiny, Soul Urge & Personal Year'],
    ['/name-numerology', 'Name Numerology', 'Pythagorean & Chaldean name vibration breakdown'],
    ['/tarot', 'Tarot Calculator', '1, 3, 5-card, Love, Career & Yes/No spreads'],
    ['/panchang', 'Panchang Calculator', 'Tithi, Vara, Nakshatra, Yoga & Karana'],
    ['/muhurat', 'Muhurat Finder', 'Brahma Muhurat, Abhijit Muhurat & Amrit Kaal'],
    ['/rahu-kaal', 'Rahu Kaal Calculator', 'Daily Rahu Kaal, Yamaganda & Gulika Kaal'],
    ['/choghadiya', 'Choghadiya Calculator', '8-slot Day & Night Choghadiya windows'],
    ['/transits', 'Planetary Transit Calculator', 'Live sidereal positions, speeds & retrogrades'],
    ['/dasha', 'Dasha Calculator', '120-year Vimshottari Mahadasha & Antardasha'],
    ['/lucky-number', 'Lucky Number Calculator', 'Numerological core & lucky digits finder'],
    ['/marriage-compatibility', 'Marriage Compatibility', 'Full Gun Milan & Manglik compatibility PDF'],
    ['/baby-names', 'Baby Name Finder', 'Curated Sanskrit & Hindi names with meanings'],
    ['/baby-names', 'Baby Name by Rashi', 'Filter baby names by Moon Rashi'],
    ['/baby-names', 'Baby Name by Nakshatra', 'Filter baby names by birth Nakshatra'],
    ['/horoscope', 'Zodiac Compatibility', 'Elemental compatibility & 12-sign horoscopes'],
    ['/birth-chart', 'Birth Chart Generator', 'North, South & East Indian chart renderer'],
    ['/festival-calendar', 'Festival Calendar', 'Upcoming Ekadashi, Purnima, Amavasya & Sankranti'],
    ['/hindu-calendar', 'Hindu Calendar', 'Vikram Samvat, Shaka Samvat & lunar months'],
    ['/sunrise-sunset', 'Sunrise & Sunset Calculator', 'Astronomical rise/set for global cities'],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="All 26 Free Vedic Astrology Calculators & Tools"
        description="Complete directory of free Vedic astrology calculators: Kundli, Ashtakoot Matching, Panchang, Dasha, Numerology, Tarot, Baby Names, and Transits."
      />
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Free Astrology Tools Directory (26 Calculators)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Every tool uses live astronomical calculations or curated datasets with transparent methodology.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(([path, name, desc]) => (
          <Link
            key={name}
            to={path}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 hover:border-amber-500 transition-colors"
          >
            <h2 className="font-semibold text-slate-900 dark:text-white">{name}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};
