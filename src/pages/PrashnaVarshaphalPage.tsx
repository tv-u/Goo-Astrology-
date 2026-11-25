import React, { useMemo, useState } from 'react';
import { Compass, RefreshCw, Sparkles, Sun } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { BirthInputForm } from '../components/BirthInputForm';
import { KundliChartSvg, type ChartStyle } from '../components/KundliChartSvg';
import { useApp } from '../context/AppContext';
import { INDIAN_CITIES } from '../data/cities';
import type { BirthInput } from '../engine/ephemeris';
import {
  PRASHNA_CATEGORIES,
  calculatePrashnaKundli,
  calculateVarshaphal,
  type PrashnaCategory,
} from '../engine/prashnaAndVarshaphal';

export const PrashnaVarshaphalPage: React.FC = () => {
  const { activeKundli, t } = useApp();
  const [tab, setTab] = useState<'prashna' | 'varshaphal'>('prashna');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');

  // Prashna Horary State
  const [questionCategory, setQuestionCategory] = useState<PrashnaCategory>('career');
  const [cityIdx, setCityIdx] = useState(0);
  const [customTime, setCustomTime] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('');
  const [prashnaTrigger, setPrashnaTrigger] = useState(0);

  // Varshaphal State
  const defaultBirthInput: BirthInput = activeKundli?.input || {
    name: 'Native',
    date: '1995-08-15',
    time: '14:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    placeName: 'New Delhi, India',
    ayanamsha: 'lahiri',
  };
  const [birthInput, setBirthInput] = useState<BirthInput>(defaultBirthInput);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());

  const selectedCity = INDIAN_CITIES[cityIdx] || INDIAN_CITIES[0];

  const prashna = useMemo(
    () =>
      calculatePrashnaKundli({
        questionCategory,
        date: customDate || undefined,
        time: customTime || undefined,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
        timezoneOffsetMinutes: selectedCity.timezoneOffsetMinutes,
        placeName: selectedCity.name,
        ayanamsha: 'lahiri',
      }),
    [questionCategory, customDate, customTime, selectedCity, prashnaTrigger]
  );

  const varshaphal = useMemo(
    () => calculateVarshaphal(birthInput, targetYear),
    [birthInput, targetYear]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Prashna Horary Kundli & Varshaphal (Tajika Annual Solar Return)"
        description="Cast an instant Vedic Prashna Kundli for any live question with Karyesha & Tajika Ithasala Yogas, or compute your exact Varshaphal Annual Solar Return chart, Muntha, Varshesha & Mudda Dasha."
        keywords="prashna kundli online free vedic horary, varshaphal solar return chart tajika muntha, mudda dasha calculator india"
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Tajika &amp; Horary Jyotish · 100% Real VSOP87 Astronomical Engine
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            {t('Prashna Horary & Varshaphal Solar Return', 'प्रश्न कुंडली एवं वर्षफल (ताजिक शास्त्र)')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {t(
              'Instant Horary (Prashna Lagna, Karyesha & Ithasala Yoga) plus exact annual Solar Return (Varsha Kundli, Muntha & Mudda Dasha).',
              'तात्कालिक प्रश्न लग्न, कार्येश, इत्थशाल योग तथा सटीक वार्षिक सूर्य-प्रवेश (वर्षफल, मुंथा एवं मुददा दशा) विश्लेषण।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded-lg border border-[#D8CBAF] dark:border-slate-700 overflow-hidden text-xs">
            {(['north', 'south', 'east'] as ChartStyle[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setChartStyle(st)}
                className={`px-3 py-1.5 capitalize font-semibold cursor-pointer ${
                  chartStyle === st
                    ? 'bg-[#C59326] text-white dark:text-slate-950'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('prashna')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'prashna'
              ? 'bg-[#0D1B3E] text-white dark:bg-amber-500 dark:text-slate-950'
              : 'bg-white dark:bg-[#0D1326] border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-300'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          1. Prashna Horary Kundli (Live Question)
        </button>
        <button
          type="button"
          onClick={() => setTab('varshaphal')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
            tab === 'varshaphal'
              ? 'bg-[#0D1B3E] text-white dark:bg-amber-500 dark:text-slate-950'
              : 'bg-white dark:bg-[#0D1326] border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-300'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          2. Varshaphal (Tajika Annual Solar Return)
        </button>
      </div>

      {tab === 'prashna' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Question Category (Karyesha House)
              </label>
              <select
                value={questionCategory}
                onChange={(e) => setQuestionCategory(e.target.value as PrashnaCategory)}
                className="w-full px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {PRASHNA_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} (H{c.houseNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Query Location
              </label>
              <select
                value={cityIdx}
                onChange={(e) => setCityIdx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {INDIAN_CITIES.slice(0, 40).map((c, idx) => (
                  <option key={c.name} value={idx}>
                    {c.name}, {c.state}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Override Date
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Override Time
                </label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomDate('');
                  setCustomTime('');
                  setPrashnaTrigger((n) => n + 1);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Cast Live Prashna Now
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 flex justify-center">
              <KundliChartSvg
                title={`Prashna D1 (${prashna.kundli.ascendant.signName})`}
                ascendantSignIndex={prashna.kundli.lagnaSignIndex}
                placements={prashna.kundli.divisionalCharts[0].placements}
                styleType={chartStyle}
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <p className="text-xs font-mono text-[#9A6D12] dark:text-amber-400">
                      {prashna.questionCategory.houseMeaning} · {prashna.kundli.input.date} {prashna.kundli.input.time} ({selectedCity.name})
                    </p>
                    <h2 className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-white mt-0.5">
                      Verdict: {prashna.verdictLabel} ({prashna.favorableScore}/100)
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#F7F2E4] dark:bg-slate-800 font-mono text-xs font-bold text-[#9A6D12] dark:text-amber-300">
                    {prashna.tajikaYoga}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Prashna Lagna</p>
                    <p className="font-semibold mt-0.5">{prashna.kundli.ascendant.signName} ({prashna.lagnaLord})</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Karyesha (Significator)</p>
                    <p className="font-semibold mt-0.5">{prashna.karyesha} in H{prashna.karyeshaHouse}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Prashna Hora Lord</p>
                    <p className="font-semibold mt-0.5">{prashna.horaLord}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Chandra (Moon)</p>
                    <p className="font-semibold mt-0.5">H{prashna.moonHouse} · {prashna.moonPaksha}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-[#0D1B3E] dark:text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Classical Tajika &amp; Prashna Marga Factors
                  </p>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {prashna.classicalFactors.map((f, idx) => (
                      <li key={idx} className="p-2 rounded bg-[#FCFBF7] dark:bg-slate-900/50 border border-[#E7DEC8]/70 dark:border-slate-800">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'varshaphal' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white">
                  Birth Details &amp; Varshaphal Target Year
                </h2>
                <p className="text-xs text-slate-500">
                  Computes the exact astronomical instant when Sidereal Sun returns to its exact Natal degree (&lt; 1 arcsec precision).
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Return Year:</label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-semibold"
                >
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 3 + i).map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            <BirthInputForm
              initialValue={birthInput}
              onSubmit={(inp) => setBirthInput(inp)}
              submitLabel={`Compute ${targetYear} Varshaphal Solar Return`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 flex justify-center">
              <KundliChartSvg
                title={`Varsha Kundli ${varshaphal.targetYear}`}
                ascendantSignIndex={varshaphal.varshaKundli.lagnaSignIndex}
                placements={varshaphal.varshaKundli.divisionalCharts[0].placements}
                styleType={chartStyle}
              />
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
                <h3 className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-white">
                  Varshaphal Year {varshaphal.targetYear} Summary (Age {varshaphal.ageAtReturn})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Exact Varsha Pravesh</p>
                    <p className="font-mono font-semibold mt-0.5">{varshaphal.solarReturnDate} {varshaphal.solarReturnTime}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Muntha Sign &amp; House</p>
                    <p className="font-semibold mt-0.5">{varshaphal.munthaSignName} (H{varshaphal.munthaHouse})</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Varshesha (Year Lord)</p>
                    <p className="font-semibold mt-0.5">{varshaphal.varshesha}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/60 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="text-slate-500">Sun Return Precision</p>
                    <p className="font-mono font-semibold mt-0.5">{varshaphal.natalSunLongitude}° (±{varshaphal.solarReturnErrorArcsec}&Prime;)</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9A6D12] dark:text-amber-400 mb-2">
                    Mudda Dasha (365.25-Day Annual Planetary Periods)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    {varshaphal.muddaDashas.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-slate-900/50">
                        <div className="flex justify-between font-semibold">
                          <span>{m.lord}</span>
                          <span className="font-mono text-[#9A6D12] dark:text-amber-300">{m.days}d</span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-500 mt-1">
                          {m.startDate} → {m.endDate}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
