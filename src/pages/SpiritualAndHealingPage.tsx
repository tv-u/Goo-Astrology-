import React, { useMemo, useState } from 'react';
import { BookOpen, Compass, Download, FileText, HeartHandshake, Sparkles, Volume2 } from 'lucide-react';
import { BirthInputForm } from '../components/BirthInputForm';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { analyzeDoshasAndYogas } from '../engine/doshaYoga';
import { generateLifeAnalysis } from '../engine/lifeAndMuhurat';
import { recommendGemstonesAndRudraksha } from '../engine/lifestyleAndRemedies60';
import {
  RAMSHALAKA_GRID,
  SACRED_TEXTS,
  analyzeAyurvedaAndHealing,
  calculateFengShuiKua,
  calculateSwarodayaCycle,
  calculateTamilPorutham,
  consultDevotionalOracle,
  consultHanumanPrashna,
  consultRamshalaka,
} from '../engine/spiritualAndHealing';
import {
  buildBrihatKundliReportSpec,
  buildUnicodePrintableHtml,
  downloadTextFile,
  exportKundliReportPdf,
} from '../utils/reportExporter';

export const SpiritualAndHealingPage: React.FC<{
  mode: 'spiritual' | 'healing' | 'porutham' | 'brihat';
}> = ({ mode }) => {
  const { activeKundli, setActiveKundli, t } = useApp();
  const baseInput: BirthInput = activeKundli?.input || {
    name: 'Native',
    date: '1995-08-15',
    time: '14:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    placeName: 'New Delhi, India',
  };

  // --- Mode: Spiritual Prashnavali & Mantra Audio ---
  const [ramResult, setRamResult] = useState(() => consultRamshalaka(0, 0));
  const [hanumanResult, setHanumanResult] = useState(() => consultHanumanPrashna(1));
  const [oracleTradition, setOracleTradition] = useState<'ganesha' | 'saibaba'>('ganesha');
  const [oracleQuestion, setOracleQuestion] = useState('');
  const [oracleResult, setOracleResult] = useState<ReturnType<typeof consultDevotionalOracle> | null>(null);
  const [activeTextId, setActiveTextId] = useState(SACRED_TEXTS[0].id);

  // --- Mode: Healing, Feng Shui Kua & Swarodaya ---
  const [kuaYear, setKuaYear] = useState(1995);
  const [kuaGender, setKuaGender] = useState<'male' | 'female'>('female');
  const kuaReport = useMemo(() => calculateFengShuiKua(kuaYear, kuaGender), [kuaYear, kuaGender]);

  const [swaraDate, setSwaraDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hoursAfterSunrise, setHoursAfterSunrise] = useState(1.5);
  const swaraReport = useMemo(() => calculateSwarodayaCycle(swaraDate, hoursAfterSunrise), [swaraDate, hoursAfterSunrise]);

  const [healingKundli, setHealingKundli] = useState(() => calculateKundli(baseInput));
  const ayurveda = useMemo(() => analyzeAyurvedaAndHealing(healingKundli), [healingKundli]);

  // --- Mode: Tamil 10-Porutham ---
  const [brideInput, setBrideInput] = useState<BirthInput>({
    ...baseInput,
    name: 'Bride',
    date: '1997-04-06',
    time: '09:15',
    placeName: 'Chennai, Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
  });
  const [groomInput, setGroomInput] = useState<BirthInput>({
    ...baseInput,
    name: 'Groom',
    date: '1995-08-15',
    time: '14:30',
    placeName: 'Madurai, Tamil Nadu',
    latitude: 9.9252,
    longitude: 78.1198,
  });
  const porutham = useMemo(() => calculateTamilPorutham(brideInput, groomInput), [brideInput, groomInput]);

  // --- Mode: Brihat Kundli PDF ---
  const [brihatYear, setBrihatYear] = useState(2026);
  const brihatKundli = useMemo(() => calculateKundli(baseInput), [baseInput]);
  const brihatAnalysis = useMemo(() => {
    const dy = analyzeDoshasAndYogas(brihatKundli);
    const life = generateLifeAnalysis(brihatKundli);
    const gems = recommendGemstonesAndRudraksha(brihatKundli);
    const manglik = dy.doshas.find((d) => d.id === 'manglik');
    const sade = dy.doshas.find((d) => d.id === 'sadesati');
    return buildBrihatKundliReportSpec(brihatKundli, {
      targetYear: brihatYear,
      manglikSummary: manglik ? `${manglik.name}: ${manglik.severity} — ${manglik.summary}` : undefined,
      sadeSatiSummary: sade ? `${sade.name}: ${sade.severity} — ${sade.summary}` : undefined,
      yogasSummary: dy.yogas.filter((y) => y.present).map((y) => `${y.name}: ${y.summary}`),
      lifeSummary: life.lifeAreas.map((a) => `${a.area} (${a.score}/100): ${a.summary}`),
      remediesSummary: gems.map((g) => `${g.planet} (${g.gem} / ${g.rudraksha}): ${g.role} — Mantra: ${g.mantra}`),
    });
  }, [brihatKundli, brihatYear]);

  const playHarmonicOmBell = () => {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(432, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.2);
  };

  if (mode === 'porutham') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <SeoHead
          title="Tamil 10-Porutham Marriage Compatibility (10-Point Star Matching)"
          description="Free Tamil Jathagam Marriage Porutham calculator checking Dinam, Ganam, Mahendram, Stree Deergham, Yoni, Rasi, Rasiyathipathi, Vasya, Rajju & Vedhai."
        />
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
            South Indian Thirumana Porutham Engine
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
            {t('Tamil 10-Porutham Marriage Compatibility', 'तमिल 10-पोरुत्तम विवाह मिलान')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Astronomical Moon Nakshatra calculation for all 10 classical Poruthams including Rajju &amp; Vedhai safety checks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">Bride Birth Details (Manamagal)</h2>
            <BirthInputForm initialValue={brideInput} onSubmit={setBrideInput} submitLabel="Update Bride Star" />
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-semibold text-base text-slate-900 dark:text-white">Groom Birth Details (Manamagan)</h2>
            <BirthInputForm initialValue={groomInput} onSubmit={setGroomInput} submitLabel="Update Groom Star" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/40 bg-white dark:bg-[#0C1226] p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <p className="text-xs font-mono text-slate-500">
                Bride: {porutham.brideNakshatra} ({porutham.brideRashi}) · Groom: {porutham.groomNakshatra} ({porutham.groomRashi})
              </p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                <HeartHandshake className="inline w-6 h-6 text-amber-500 mr-2" />
                {porutham.totalPassed} / {porutham.maxCount} Poruthams Matched — {porutham.verdict}
              </h2>
            </div>
            <div className="text-xs font-mono">
              Rajju Zone: <span className={porutham.rajjuSafe ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 font-semibold'}>
                {porutham.rajjuCategory} ({porutham.rajjuSafe ? 'Safe / Distinct' : 'Same Rajju Caution'})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Porutham</th>
                  <th className="py-2 pr-4">Tamil</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Astronomical Note</th>
                </tr>
              </thead>
              <tbody>
                {porutham.items.map((item) => (
                  <tr key={item.name} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2.5 pr-4 font-semibold">{item.name}</td>
                    <td className="py-2.5 pr-4 text-xs text-slate-500">{item.tamilName}</td>
                    <td className={`py-2.5 pr-4 font-mono text-xs font-semibold ${item.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {item.status}
                    </td>
                    <td className="py-2.5 text-xs text-slate-600 dark:text-slate-300">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'brihat') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <SeoHead
          title="Free Brihat Kundli Comprehensive PDF & Annual Report Studio"
          description="Generate and download a complete 100% free Brihat Janam Kundli PDF with Graha Sthiti, 120-yr Vimshottari Dasha, Manglik/Sade Sati, Vedic Yogas, Life Forecast & Remedies."
        />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
              100% Free Printable Vedic Birth Dossier
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
              {t('Brihat Kundli PDF & Year Forecast Studio', 'निःशुल्क बृहत् कुंडली PDF स्टूडियो')}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Complete Sidereal Planetary Positions, 120-Year Dasha, Dosha Check, Life Analysis &amp; Remedies — Zero Paywalls.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportKundliReportPdf(brihatAnalysis)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Brihat Kundli PDF
            </button>
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  `brihat-kundli-${(brihatKundli.input.name || 'native').toLowerCase()}.html`,
                  buildUnicodePrintableHtml(brihatAnalysis),
                  'text/html'
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Print-Ready Devanagari HTML
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-semibold text-base">Configure Birth Details &amp; Forecast Year</h2>
            <select
              value={brihatYear}
              onChange={(e) => setBrihatYear(Number(e.target.value))}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              <option value={2026}>Annual Forecast: 2026</option>
              <option value={2027}>Annual Forecast: 2027</option>
            </select>
          </div>
          <BirthInputForm
            initialValue={baseInput}
            onSubmit={(inp) => setActiveKundli(calculateKundli(inp))}
            submitLabel="Recalculate Brihat Kundli"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {brihatAnalysis.sections.map((sec) => (
            <div key={sec.heading} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
              <h3 className="font-display text-lg font-bold text-amber-700 dark:text-amber-300">{sec.heading}</h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                {sec.rows.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'healing') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <SeoHead
          title="Alternative Healing, Ayurveda Prakriti, Feng Shui Kua & Swarodaya"
          description="Calculate your Feng Shui Kua Number & Bagua directions, Shiva Swarodaya nostril breath cycle, Ayurvedic Vata-Pitta-Kapha Prakriti, Chakra, Crystal & Color Therapy."
        />
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Vedic Medical Astrology &amp; Spatial Energy
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
            {t('Ayurveda, Swarodaya & Feng Shui Healing Hub', 'आयुर्वेद, स्वरोदय विज्ञान एवं फेंग शुई केंद्र')}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feng Shui Kua */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <h2 className="font-display text-2xl font-bold">Feng Shui Kua Number &amp; Bagua Directions</h2>
            <div className="flex flex-wrap gap-3">
              <input
                type="number"
                min={1920}
                max={2040}
                value={kuaYear}
                onChange={(e) => setKuaYear(Number(e.target.value) || 1995)}
                className="w-28 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              />
              <select
                value={kuaGender}
                onChange={(e) => setKuaGender(e.target.value as 'male' | 'female')}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <p className="text-sm font-mono text-amber-600 dark:text-amber-400">
              Kua Number {kuaReport.kuaNumber} · {kuaReport.group} · Element: {kuaReport.element}
            </p>
            <div className="space-y-2 text-xs">
              {kuaReport.favorableDirections.map((d) => (
                <div key={d.name} className="flex justify-between border-b border-slate-100 dark:border-slate-800 py-1.5">
                  <span className="font-semibold">{d.name}: {d.direction}</span>
                  <span className="text-slate-500">{d.purpose}</span>
                </div>
              ))}
              <p className="text-slate-500 pt-1">Avoid sleeping/facing: {kuaReport.cautionDirections.join(', ')}</p>
            </div>
          </div>

          {/* Swarodaya Vigyan */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <h2 className="font-display text-2xl font-bold">Swarodaya Vigyan (Nostril Breath Cycle)</h2>
            <div className="flex flex-wrap gap-3">
              <input
                type="date"
                value={swaraDate}
                onChange={(e) => setSwaraDate(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              />
              <label className="text-xs flex items-center gap-2">
                Hours after sunrise:
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={hoursAfterSunrise}
                  onChange={(e) => setHoursAfterSunrise(Number(e.target.value) || 0)}
                  className="w-20 px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
                />
              </label>
            </div>
            <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
              {swaraReport.paksha} Paksha Tithi #{swaraReport.tithiNumber} · {swaraReport.weekday} · Sunrise Swara: {swaraReport.sunriseSwara}
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Active Flow: {swaraReport.currentHourSwara}
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
              {swaraReport.recommendedActivities.map((act) => (
                <li key={act}>{act}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ayurvedic Prakriti & Medical Astrology */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-5">
          <h2 className="font-display text-2xl font-bold">Ayurvedic Dosha, Chakra, Color, Crystal &amp; Aromatherapy</h2>
          <BirthInputForm initialValue={baseInput} onSubmit={(inp) => setHealingKundli(calculateKundli(inp))} submitLabel="Analyze My Prakriti" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-mono uppercase text-amber-600 dark:text-amber-400">Dominant Dosha</p>
              <p className="text-2xl font-bold">{ayurveda.dominantDosha} Prakriti</p>
              <p className="text-xs font-mono text-slate-500">
                Vata {ayurveda.scores.Vata} · Pitta {ayurveda.scores.Pitta} · Kapha {ayurveda.scores.Kapha}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <p className="font-semibold text-amber-600 dark:text-amber-400">Chakra, Color &amp; Crystal</p>
              <p><strong>Chakra:</strong> {ayurveda.chakraFocus}</p>
              <p><strong>Color Therapy:</strong> {ayurveda.colorTherapy}</p>
              <p><strong>Crystal:</strong> {ayurveda.crystalGuide}</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <p className="font-semibold text-amber-600 dark:text-amber-400">Acupressure &amp; Aromatherapy</p>
              <p><strong>Acupressure:</strong> {ayurveda.acupressurePoint}</p>
              <p><strong>Aroma Oils:</strong> {ayurveda.aromatherapyOil}</p>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <p className="font-semibold">Anatomical Zones &amp; Daily Regimen:</p>
            {ayurveda.bodyFocusZones.concat(ayurveda.lifestyleNotes).map((n) => (
              <p key={n}>• {n}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: mode === 'spiritual'
  const activeText = SACRED_TEXTS.find((x) => x.id === activeTextId) || SACRED_TEXTS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Ramshalaka Prashnavali, Hanuman Yantra, Mantra & Chalisa Tools"
        description="Interactive 15x15 Tulsi Ramshalaka Prashnavali, 49-cell Hanuman Prashna Yantra, Ganesha & Sai devotional contemplation oracle, and sacred Chalisa/Mantra library."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Interactive Vedic Prashnavali &amp; Devotional Library
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-1">
            {t('Spiritual Prashnavali, Ramshalaka & Sacred Mantras', 'रामशलाका प्रश्नावली, हनुमान यंत्र व मंत्र')}
          </h1>
        </div>
        <button
          type="button"
          onClick={playHarmonicOmBell}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0D1B3E] dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          Sound 432Hz Meditation Bell
        </button>
      </div>

      {/* 15x15 Ramshalaka Prashnavali Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Shri Ramshalaka Prashnavali (15×15 Ramcharitmanas Grid)
          </h2>
          <p className="text-xs text-slate-500">
            Hold your question calmly in mind and tap any Devanagari akshara square below to receive the corresponding Chaupai verdict.
          </p>
          <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 max-w-md">
            {RAMSHALAKA_GRID.map((rowArr, r) =>
              rowArr.map((char, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => setRamResult(consultRamshalaka(r, c))}
                  className={`aspect-square text-[11px] font-medium rounded border cursor-pointer flex items-center justify-center ${
                    ramResult.row === r + 1 && ramResult.col === c + 1
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {char}
                </button>
              ))
            )}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
            <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
              Cell ({ramResult.row}, {ramResult.col}) · Akshara: {ramResult.akshara} · {ramResult.verdict}
            </p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">{ramResult.verse}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{ramResult.meaning}</p>
          </div>
        </div>

        {/* 49-Cell Hanuman Prashna + Devotional Oracle */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Hanuman Prashna Yantra (1–49 Grid)</h2>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setHanumanResult(consultHanumanPrashna(num))}
                  className={`py-1.5 text-xs font-mono rounded border cursor-pointer ${
                    hanumanResult.cellNumber === num
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Cell #{hanumanResult.cellNumber}: {hanumanResult.verdict}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">{hanumanResult.guidance}</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Ganesha &amp; Sai Contemplation Answers</h2>
            <div className="flex gap-2">
              {(['ganesha', 'saibaba'] as const).map((tr) => (
                <button
                  key={tr}
                  type="button"
                  onClick={() => setOracleTradition(tr)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize cursor-pointer ${
                    oracleTradition === tr
                      ? 'bg-[#0D1B3E] dark:bg-amber-500 text-white dark:text-slate-950'
                      : 'border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {tr === 'ganesha' ? 'Ask Ganesha' : 'Sai Baba Answers'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={oracleQuestion}
                onChange={(e) => setOracleQuestion(e.target.value)}
                placeholder="Write a sincere question for quiet guidance..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              />
              <button
                type="button"
                onClick={() => setOracleResult(consultDevotionalOracle(oracleTradition, oracleQuestion))}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#C59326] text-white cursor-pointer"
              >
                Reflect
              </button>
            </div>
            {oracleResult && (
              <p className="text-xs text-slate-700 dark:text-slate-200 pt-1">
                {oracleResult.message} <span className="text-slate-400">({oracleResult.timestamp})</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chalisa, Mantra & Aarti Reader */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Chalisa, Gayatri Mantra &amp; Navagraha Reader
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {SACRED_TEXTS.map((txt) => (
              <button
                key={txt.id}
                type="button"
                onClick={() => setActiveTextId(txt.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                  activeTextId === txt.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-300 dark:border-slate-700'
                }`}
              >
                {txt.hindiTitle}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
            {activeText.title} · {activeText.deity}
          </p>
          <div className="space-y-1.5 text-base leading-relaxed text-slate-900 dark:text-slate-100">
            {activeText.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="text-xs text-slate-500 pt-2">{activeText.meaningSummary}</p>
        </div>
      </div>
    </div>
  );
};
