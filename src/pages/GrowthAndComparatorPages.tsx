import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Code2, Columns2, Copy, Check, MapPin } from 'lucide-react';
import { BirthInputForm } from '../components/BirthInputForm';
import { KundliChartSvg } from '../components/KundliChartSvg';
import { MonetagDirectLinkCta } from '../components/AdSlot';
import { BrowserPanchangReminder } from '../components/MonetagAndSeoExtras';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { BABY_NAMES_DATASET } from '../data/babyNames';
import { CITIES_DATASET } from '../data/cities';
import { calculateKundli } from '../engine/ephemeris';
import { calculatePanchang } from '../engine/panchang';
import { calculateVarshaphal } from '../engine/prashnaAndVarshaphal';
import { getLivePlanetaryTransits } from '../engine/astrologySystems';

// Features #51 & #52: 10-Year Life Timeline + Side-by-Side Dual Chart Comparator
export const SudarshanAndTimelinePage: React.FC = () => {
  const { activeKundli, setActiveKundli, t } = useApp();
  const [compareMode, setCompareMode] = useState<'transit' | 'varshaphal'>('transit');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const kundli = useMemo(
    () =>
      activeKundli ||
      calculateKundli({
        name: 'Aarav Sharma',
        date: '1995-08-15',
        time: '14:30',
        latitude: 28.6139,
        longitude: 77.209,
        timezoneOffsetMinutes: 330,
      }),
    [activeKundli]
  );

  const currentYear = new Date().getUTCFullYear();
  const liveTransit = useMemo(() => getLivePlanetaryTransits('lahiri'), []);
  const varshaphal = useMemo(() => calculateVarshaphal(kundli.input, currentYear), [kundli.input, currentYear]);

  // 10-Year Combined Timeline (Dasha + Jupiter + Saturn annual Gochar)
  const timeline10 = useMemo(() => {
    const rows = [];
    for (let offset = 0; offset < 10; offset++) {
      const yr = currentYear + offset;
      const probeDate = `${yr}-06-15`;
      const md = kundli.dashas.find((d) => d.startDate <= probeDate && d.endDate >= probeDate);
      const ad = md?.children?.find((c) => c.startDate <= probeDate && c.endDate >= probeDate);
      const sky = calculateKundli({ ...kundli.input, name: `Gochar ${yr}`, date: probeDate, time: '12:00' });
      const saturn = sky.planets.find((p) => p.id === 'Saturn')!;
      const jupiter = sky.planets.find((p) => p.id === 'Jupiter')!;
      const satFromMoon = ((saturn.signIndex - kundli.moonSignIndex + 12) % 12) + 1;
      const sadeSatiPhase =
        satFromMoon === 12 ? 'Sade Sati Rising' : satFromMoon === 1 ? 'Sade Sati Peak' : satFromMoon === 2 ? 'Sade Sati Setting' : 'Clear of Sade Sati';
      rows.push({
        year: yr,
        dasha: `${md?.lord || '-'} / ${ad?.lord || '-'}`,
        saturnSign: `${saturn.signName} (H${((saturn.signIndex - kundli.lagnaSignIndex + 12) % 12) + 1})`,
        jupiterSign: `${jupiter.signName} (H${((jupiter.signIndex - kundli.lagnaSignIndex + 12) % 12) + 1})`,
        sadeSatiPhase,
      });
    }
    return rows;
  }, [kundli, currentYear]);

  const birthPlacements = [
    { id: 'Ascendant' as const, signIndex: kundli.lagnaSignIndex, signName: kundli.ascendant.signName, house: 1 },
    ...kundli.planets.map((p) => ({ id: p.id, signIndex: p.signIndex, signName: p.signName, house: p.house })),
  ];

  const rightPlacements =
    compareMode === 'transit'
      ? [
          { id: 'Ascendant' as const, signIndex: kundli.lagnaSignIndex, signName: kundli.ascendant.signName, house: 1 },
          ...liveTransit.planets.map((tp) => ({
            id: tp.id,
            signIndex: tp.signIndex,
            signName: tp.signName,
            house: ((tp.signIndex - kundli.lagnaSignIndex + 12) % 12) + 1,
          })),
        ]
      : [
          { id: 'Ascendant' as const, signIndex: varshaphal.varshaKundli.lagnaSignIndex, signName: varshaphal.varshaKundli.ascendant.signName, house: 1 },
          ...varshaphal.varshaKundli.planets.map((p) => ({ id: p.id, signIndex: p.signIndex, signName: p.signName, house: p.house })),
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="10-Year Dasha & Transit Timeline + Dual Kundli Comparator"
        description="View your 10-year consolidated Vimshottari Dasha, Jupiter & Saturn Gochar timeline and compare Janam Kundli side-by-side against Live Transits or Annual Varshaphal."
      />
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#9A6D12] dark:text-amber-400">
          Features #51 &amp; #52 · Consolidated Forecasting
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-white mt-1">
          {t('10-Year Cosmic Timeline & Dual Chart Comparator', '10-वर्षीय जीवन टाइमलाइन एवं दोहरी कुंडली तुलना')}
        </h1>
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
        <BirthInputForm initialValue={kundli.input} onSubmit={(inp) => setActiveKundli(calculateKundli(inp))} submitLabel="Update Timeline & Comparator" />
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-[#C59326]" /> Side-by-Side Dual Chart Comparator
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setCompareMode('transit')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${compareMode === 'transit' ? 'bg-[#C59326] text-white' : 'border border-slate-300 dark:border-slate-700'}`}
            >
              Birth vs Live Sky Transit
            </button>
            <button
              type="button"
              onClick={() => setCompareMode('varshaphal')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${compareMode === 'varshaphal' ? 'bg-[#C59326] text-white' : 'border border-slate-300 dark:border-slate-700'}`}
            >
              Birth vs {currentYear} Varshaphal
            </button>
            <button
              type="button"
              onClick={() => setChartStyle(chartStyle === 'north' ? 'south' : 'north')}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              Style: {chartStyle === 'north' ? 'North' : 'South'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KundliChartSvg
            title={`Janam Kundli (${kundli.ascendant.signName})`}
            ascendantSignIndex={kundli.lagnaSignIndex}
            placements={birthPlacements}
            styleType={chartStyle}
          />
          <KundliChartSvg
            title={compareMode === 'transit' ? 'Live Planetary Gochar Overlay' : `Varshaphal ${currentYear} (Muntha H${varshaphal.munthaHouse})`}
            ascendantSignIndex={compareMode === 'transit' ? kundli.lagnaSignIndex : varshaphal.varshaKundli.lagnaSignIndex}
            placements={rightPlacements}
            styleType={chartStyle}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
        <h2 className="font-display text-2xl font-bold mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#C59326]" /> 10-Year Dasha + Jupiter &amp; Saturn Gochar Timeline
        </h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
              <th className="py-2 pr-3">Year</th><th>Vimshottari Dasha</th><th>Jupiter Gochar</th><th>Saturn Gochar</th><th>Sade Sati Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {timeline10.map((r) => (
              <tr key={r.year}>
                <td className="py-2 pr-3 font-mono font-bold text-[#9A6D12] dark:text-amber-400">{r.year}</td>
                <td className="py-2 font-semibold">{r.dasha}</td>
                <td className="py-2">{r.jupiterSign}</td>
                <td className="py-2">{r.saturnSign}</td>
                <td className="py-2">{r.sadeSatiPhase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MonetagDirectLinkCta placement="sudarshan_comparator" />
    </div>
  );
};

// Feature #46: Dynamic Indian City Panchang & Rahu Kaal SEO Pages (/panchang/:citySlug, /rahu-kaal/:citySlug)
export const CityPanchangSeoPage: React.FC<{ mode: 'panchang' | 'rahu' }> = ({ mode }) => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const cityObj = useMemo(
    () =>
      CITIES_DATASET.find(
        (c) => c.id === citySlug || c.city.toLowerCase().replace(/\s+/g, '-') === (citySlug || '').toLowerCase()
      ) || CITIES_DATASET.find((c) => c.id === 'new-delhi')!,
    [citySlug]
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const panchang = useMemo(
    () => calculatePanchang(todayStr, cityObj.latitude, cityObj.longitude, cityObj.timezoneOffsetMinutes, `${cityObj.city}, ${cityObj.state}`),
    [todayStr, cityObj]
  );

  const indianCities = useMemo(() => CITIES_DATASET.filter((c) => c.country === 'India').slice(0, 24), []);

  const title =
    mode === 'rahu'
      ? `Today Rahu Kaal in ${cityObj.city}, ${cityObj.state} (${todayStr})`
      : `Today Panchang in ${cityObj.city}, ${cityObj.state} (${todayStr})`;
  const description = `Exact astronomical ${mode === 'rahu' ? 'Rahu Kaal, Yamaganda & Gulika Kaal' : 'Panchang, Tithi, Nakshatra, Sunrise & Abhijit Muhurat'} for ${cityObj.city}, ${cityObj.state} (${cityObj.latitude.toFixed(2)}°N, ${cityObj.longitude.toFixed(2)}°E).`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title={title}
        description={description}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          datePublished: todayStr,
          about: `${cityObj.city} Vedic Panchang`,
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-[#9A6D12] dark:text-amber-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {cityObj.city}, {cityObj.state} · {cityObj.latitude.toFixed(4)}°N, {cityObj.longitude.toFixed(4)}°E
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-white mt-1">{title}</h1>
        </div>
        <BrowserPanchangReminder cityLabel={cityObj.city} rahuKaal={panchang.rahuKaal} abhijit={panchang.abhijitMuhurat} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4">
          <p className="text-slate-500">Rahu Kaal ({cityObj.city})</p>
          <p className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{panchang.rahuKaal}</p>
        </div>
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4">
          <p className="text-slate-500">Abhijit Muhurat</p>
          <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{panchang.abhijitMuhurat}</p>
        </div>
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4">
          <p className="text-slate-500">Tithi &amp; Nakshatra</p>
          <p className="text-sm font-bold mt-1">{panchang.tithi.paksha} {panchang.tithi.name}</p>
          <p className="text-slate-500">{panchang.nakshatra.name} P{panchang.nakshatra.pada}</p>
        </div>
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4">
          <p className="text-slate-500">Sunrise / Sunset</p>
          <p className="text-sm font-mono font-bold mt-1">{panchang.sunrise} / {panchang.sunset}</p>
          <p className="text-slate-500">Brahma: {panchang.brahmaMuhurat}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
        <h2 className="font-display text-xl font-bold">Other Indian Cities ({mode === 'rahu' ? 'Rahu Kaal' : 'Panchang'})</h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {indianCities.map((c) => (
            <Link
              key={c.id}
              to={`/${mode === 'rahu' ? 'rahu-kaal' : 'panchang'}/${c.id}`}
              className={`px-3 py-1.5 rounded-lg border ${
                c.id === cityObj.id ? 'border-[#C59326] bg-amber-500/10 font-semibold' : 'border-slate-200 dark:border-slate-800 hover:border-[#C59326]'
              }`}
            >
              {c.city}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Feature #47: Letter-Indexed SEO Baby Names Page (/baby-names/:letter)
export const BabyNamesSeoPage: React.FC = () => {
  const { letter } = useParams<{ letter: string }>();
  const target = (letter || 'a').slice(0, 1).toUpperCase();
  const names = useMemo(
    () => BABY_NAMES_DATASET.filter((n) => n.name.toUpperCase().startsWith(target)),
    [target]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title={`Vedic & Hindu Baby Names Starting With ${target}`}
        description={`Browse Sanskrit, Hindi and Vedic baby names starting with letter ${target} with Rashi, Nakshatra and numerology meanings.`}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl sm:text-4xl font-bold">Vedic Baby Names Starting With &ldquo;{target}&rdquo;</h1>
        <Link to="/baby-names" className="text-xs font-semibold text-[#9A6D12] dark:text-amber-400 hover:underline">
          Open Full Baby Name Search →
        </Link>
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs font-mono">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((ch) => (
          <Link
            key={ch}
            to={`/baby-names/${ch.toLowerCase()}`}
            className={`px-2.5 py-1 rounded border ${ch === target ? 'bg-[#C59326] text-white border-[#C59326]' : 'border-slate-200 dark:border-slate-800'}`}
          >
            {ch}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {names.length === 0 ? (
          <p className="text-sm text-slate-500">No curated names starting with {target} in local dataset yet. Try A, K, M, P, R, S, or V.</p>
        ) : (
          names.map((n) => (
            <div key={n.id} className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-1">
              <h2 className="font-display text-xl font-bold">{n.name} ({n.hindi})</h2>
              <p className="text-xs text-slate-500">{n.gender} · {n.origin} · Pronounced {n.pronunciation}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300">{n.meaning}</p>
              <p className="text-[11px] font-mono text-[#9A6D12] dark:text-amber-400">Rashi: {n.rashi} · Nakshatra: {n.nakshatra}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Feature #55: Embeddable Public Panchang / Sky Widget (/embed/:widgetType)
export const EmbedWidgetPage: React.FC = () => {
  const { widgetType } = useParams<{ widgetType: string }>();
  const [copied, setCopied] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const panchang = useMemo(() => calculatePanchang(todayStr, 28.6139, 77.209, 330, 'New Delhi'), [todayStr]);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gooastrology.example';
  const iframeSnippet = `<iframe src="${origin}/embed/${widgetType || 'panchang'}" width="100%" height="280" style="border:1px solid #C59326;border-radius:12px;" title="GOO ASTROLOGY Live Panchang"></iframe>`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Embeddable Daily Panchang & Rashi Widget"
        description="Free embeddable Daily Hindu Panchang, Tithi, Nakshatra & Rahu Kaal HTML iframe widget for blogs and spiritual websites."
      />
      <div className="rounded-xl border-2 border-[#C59326]/60 bg-white dark:bg-[#0C1226] p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#9A6D12] dark:text-amber-400">
          <span>GOO ASTROLOGY LIVE PANCHANG WIDGET</span>
          <span>{todayStr} · New Delhi</span>
        </div>
        <h1 className="font-display text-2xl font-bold">{panchang.tithi.paksha} {panchang.tithi.name} · {panchang.nakshatra.name}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div><span className="text-slate-500 block">Sunrise</span>{panchang.sunrise}</div>
          <div><span className="text-slate-500 block">Sunset</span>{panchang.sunset}</div>
          <div><span className="text-slate-500 block">Abhijit</span>{panchang.abhijitMuhurat}</div>
          <div><span className="text-slate-500 block">Rahu Kaal</span>{panchang.rahuKaal}</div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3 text-xs">
        <p className="font-semibold flex items-center gap-1.5"><Code2 className="w-4 h-4 text-[#C59326]" /> Copy HTML Embed Snippet (Free Zero-Key Widget)</p>
        <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-x-auto font-mono text-[11px]">{iframeSnippet}</pre>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(iframeSnippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C59326] text-white font-semibold cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Snippet' : 'Copy Iframe Code'}
        </button>
      </div>
    </div>
  );
};
