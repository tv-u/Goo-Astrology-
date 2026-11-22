import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { BirthInputForm } from '../components/BirthInputForm';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { ZODIAC_SIGNS } from '../engine/constants';
import {
  analyzeDegreePrecision,
  analyzeNakshatraLordRelationships,
  analyzeNakshatraPadaMatrix,
  calculateAshtakavarga,
  calculateBhavaChalitAndSripati,
  calculateJaiminiAnalysis,
  calculateKpAnalysis,
  calculateShadbalaAndAvasthas,
  type AshtakavargaPlanet,
} from '../engine/vedicResearch';
import { downloadTextFile, exportKundliReportPdf } from '../utils/reportExporter';

const DEFAULT_BIRTH: BirthInput = {
  name: 'Aarav Sharma',
  date: '1995-08-15',
  time: '09:42',
  placeName: 'New Delhi, India',
  latitude: 28.6139,
  longitude: 77.209,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  ayanamsha: 'lahiri',
};

export function ResearchEnginePage() {
  const { activeKundli, setActiveKundli, language } = useApp();
  const [kundli, setKundli] = useState(() => activeKundli || calculateKundli(DEFAULT_BIRTH));
  const [tab, setTab] = useState<'precision' | 'bhava' | 'jaimini' | 'ashtakavarga' | 'shadbala'>('precision');
  const [selectedBavPlanet, setSelectedBavPlanet] = useState<AshtakavargaPlanet>('Sun');

  const handleCompute = (input: BirthInput) => {
    const res = calculateKundli(input);
    setKundli(res);
    setActiveKundli(res);
  };

  const precision = useMemo(() => analyzeDegreePrecision(kundli), [kundli]);
  const padaMatrix = useMemo(() => analyzeNakshatraPadaMatrix(kundli), [kundli]);
  const lordRelations = useMemo(() => analyzeNakshatraLordRelationships(kundli), [kundli]);
  const bhavaData = useMemo(() => calculateBhavaChalitAndSripati(kundli), [kundli]);
  const kpData = useMemo(() => calculateKpAnalysis(kundli), [kundli]);
  const jaimini = useMemo(() => calculateJaiminiAnalysis(kundli), [kundli]);
  const ashtakavarga = useMemo(() => calculateAshtakavarga(kundli), [kundli]);
  const shadbala = useMemo(() => calculateShadbalaAndAvasthas(kundli), [kundli]);

  const savChartData = useMemo(
    () =>
      ZODIAC_SIGNS.map((z, idx) => ({
        sign: z.name.slice(0, 3),
        fullName: z.name,
        SAV: ashtakavarga.sarva[idx],
        Bhinna: ashtakavarga.bhinna[selectedBavPlanet][idx],
      })),
    [ashtakavarga, selectedBavPlanet]
  );

  const handleExportPdf = () => {
    exportKundliReportPdf({
      title: `Vedic Research Report — ${kundli.input.name}`,
      subtitle: `${kundli.input.date} ${kundli.input.time} · ${kundli.input.placeName || 'India'} · Ayanamsha ${kundli.ayanamshaDms}`,
      metadataLines: [
        `Ascendant: ${kundli.ascendant.signName} ${kundli.ascendant.dms} | Jaimini AK: ${jaimini.atmakaraka.planet} | Karakamsha: ${jaimini.karakamshaSignName}`,
        `Total Sarva Ashtakavarga Bindus: ${ashtakavarga.totalBindus} | Strong Signs: ${ashtakavarga.strongSigns.join(', ') || 'Balanced'}`,
      ],
      sections: [
        {
          heading: 'Shadbala & Planetary Avasthas',
          rows: shadbala.map(
            (s) =>
              `${s.planet}: ${s.totalRupas} Rupas (req ${s.requiredRupas}) · Ishta ${s.ishtaPhala} / Kashta ${s.kashtaPhala} · ${s.baladiAvastha} · ${s.deeptadiAvastha}`
          ),
        },
        {
          heading: 'KP Planetary Sub-Lord Chain',
          rows: kpData.planets.map((p) => `${p.id}: Sign ${p.signLord} / Star ${p.starLord} / Sub ${p.subLord}`),
        },
        {
          heading: 'Jaimini Insights',
          rows: jaimini.insights,
        },
      ],
      filename: `goo-research-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Advanced Vedic Research Engine — KP Sub-Lord, Jaimini, Ashtakavarga & Shadbala"
        description="Free Indian Vedic Research calculators: Bhava Chalit, Sripati Bhava, KP 249 Sub-Lord Cusps, Jaimini Karakamsha & Swamsha, Prasthara & Sarva Ashtakavarga, Shadbala & Avasthas."
        keywords="free kp sub lord cusp calculator, jaimini karakamsha swamsha online, sarva ashtakavarga bindu chart, shadbala rupas virupas calculator"
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7DEC8] dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Category A · Features 1–15 · Language: {language.toUpperCase()}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            Advanced Vedic Research Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl">
            Sripati &amp; Bhava Chalit cusps, KP Sub-Lords &amp; significators, Jaimini Karakamsha/Swamsha, 337-bindu Prasthara/Sarva Ashtakavarga, 6-fold Shadbala, Ishta/Kashta Phala, and Planetary Avasthas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D1B3E] text-[#FCFBF7] border border-[#C59326]/50 text-xs font-semibold hover:bg-[#162958] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Research PDF</span>
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                'vedic-research.json',
                JSON.stringify({ kundli, kpData, jaimini, ashtakavarga, shadbala }, null, 2)
              )
            }
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium cursor-pointer"
          >
            Export JSON
          </button>
        </div>
      </div>

      <BirthInputForm initialValue={kundli.input} onSubmit={handleCompute} submitLabel="Run 15 Research Calculators" />

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E7DEC8] dark:border-slate-800 pb-3">
        {[
          { id: 'precision', label: '1–3 · Degree, Pada & Star Lords' },
          { id: 'bhava', label: '4–7 · Bhava Chalit, Sripati & KP Cusps' },
          { id: 'jaimini', label: '8–9 · Jaimini Karakamsha & Swamsha' },
          { id: 'ashtakavarga', label: '10–12 · Ashtakavarga (BAV/Prasthara/SAV)' },
          { id: 'shadbala', label: '13–15 · Shadbala, Ishta/Kashta & Avastha' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              tab === item.id
                ? 'bg-[#C59326] text-white dark:text-slate-950'
                : 'bg-white dark:bg-[#0D1326] border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'precision' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-3">A-01 · Planetary Degree Precision &amp; Sandhi Analyzer</h2>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-3">Body</th>
                  <th className="py-2 pr-3">Rashi</th>
                  <th className="py-2 pr-3">Exact DMS</th>
                  <th className="py-2 pr-3">Sidereal°</th>
                  <th className="py-2 pr-3">Sandhi Dist</th>
                  <th className="py-2 pr-3">Nakshatra &amp; Pada</th>
                  <th className="py-2">Pada %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70 tabular-nums">
                {precision.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-3 font-semibold">{r.id}</td>
                    <td className="py-2 pr-3">{r.signName}</td>
                    <td className="py-2 pr-3 font-mono">{r.dms}</td>
                    <td className="py-2 pr-3 font-mono">{r.longitude}°</td>
                    <td className="py-2 pr-3">
                      {r.distToSignSandhiDeg}° {r.isSandhi ? '(Sandhi)' : ''}
                    </td>
                    <td className="py-2 pr-3">{r.nakshatraName} P{r.pada}</td>
                    <td className="py-2">{r.padaProgressPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-3">A-02 · Nakshatra Pada Compatibility Matrix</h2>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                    <th className="py-2">Planet</th>
                    <th className="py-2">Pada</th>
                    <th className="py-2">Purushartha</th>
                    <th className="py-2">Tara from Moon</th>
                    <th className="py-2">Harmony</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                  {padaMatrix.map((row) => (
                    <tr key={row.planet}>
                      <td className="py-2 font-semibold">{row.planet}</td>
                      <td className="py-2">P{row.pada}</td>
                      <td className="py-2">{row.purushartha}</td>
                      <td className="py-2">{row.taraFromMoon}</td>
                      <td className="py-2 font-medium">{row.harmony}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-3">A-03 · Nakshatra Lord Relationship Analyzer</h2>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                    <th className="py-2">Planet</th>
                    <th className="py-2">Star Lord</th>
                    <th className="py-2">vs Lagna Lord ({lordRelations[0]?.lagnaLord})</th>
                    <th className="py-2">vs Moon Star Lord ({lordRelations[0]?.moonLord})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                  {lordRelations.map((r) => (
                    <tr key={r.planet}>
                      <td className="py-2 font-semibold">{r.planet}</td>
                      <td className="py-2">{r.starLord}</td>
                      <td className="py-2">{r.naturalRelationWithLagnaLord}</td>
                      <td className="py-2">{r.naturalRelationWithMoonLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'bhava' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-1">A-04 &amp; A-05 · Sripati Bhava Cusps (MC {bhavaData.mcLongitude}°)</h2>
              <p className="text-xs text-slate-500 mb-3">Unequal quadrant-trisected cusps comparing Bhava house shifts against D1 Whole Sign.</p>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                    <th className="py-2">House</th>
                    <th className="py-2">Cusp</th>
                    <th className="py-2">Sign</th>
                    <th className="py-2">Occupants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70 tabular-nums">
                  {bhavaData.sripati.map((c) => (
                    <tr key={c.house}>
                      <td className="py-2 font-semibold">H{c.house}</td>
                      <td className="py-2 font-mono">{c.cuspDms}</td>
                      <td className="py-2">{c.signName}</td>
                      <td className="py-2">{c.planetsInBhava.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-1">A-06 · KP Sign / Star / Sub / Sub-Sub Chain</h2>
              <p className="text-xs text-slate-500 mb-3">249-sub Krishnamurti Padhdhati planetary hierarchy.</p>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                    <th className="py-2">Body</th>
                    <th className="py-2">Sign Lord</th>
                    <th className="py-2">Star Lord</th>
                    <th className="py-2">Sub Lord</th>
                    <th className="py-2">Sub-Sub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                  {kpData.planets.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 font-semibold">{p.id}</td>
                      <td className="py-2">{p.signLord}</td>
                      <td className="py-2">{p.starLord}</td>
                      <td className="py-2 font-semibold text-[#9A6D12] dark:text-amber-300">{p.subLord}</td>
                      <td className="py-2">{p.subSubLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-3">A-07 · KP Cusp Sub-Lords &amp; 4-Level Significators</h2>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                  <th className="py-2">Cusp</th>
                  <th className="py-2">Rashi</th>
                  <th className="py-2">Sign / Star / Sub</th>
                  <th className="py-2">House Significators (Levels A–D)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                {kpData.cusps.map((c) => (
                  <tr key={c.cusp}>
                    <td className="py-2 font-semibold">Cusp {c.cusp}</td>
                    <td className="py-2">{c.signName}</td>
                    <td className="py-2 font-mono">{c.signLord} / {c.starLord} / {c.subLord}</td>
                    <td className="py-2">{c.significators.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'jaimini' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326] p-4">
              <p className="text-xs text-slate-500 uppercase">Atmakaraka (AK)</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300 mt-1">
                {jaimini.atmakaraka.planet} ({jaimini.atmakaraka.degreeInSign}°)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Rashi: {jaimini.atmakaraka.d1Sign}</p>
            </div>
            <div className="rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326] p-4">
              <p className="text-xs text-slate-500 uppercase">A-08 · Karakamsha Lagna (D9 of AK)</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300 mt-1">
                {jaimini.karakamshaSignName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Ishta Devata (12th): {jaimini.ishtaDevataSign}</p>
            </div>
            <div className="rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326] p-4">
              <p className="text-xs text-slate-500 uppercase">A-09 · Swamsha Lagna (D9 Lagna)</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300 mt-1">
                {jaimini.swamshaSignName}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Navamsa Soul &amp; Dharma Axis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-3">7 Chara Karakas (BPHS / Jaimini Sutras)</h2>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                    <th className="py-2">Code</th>
                    <th className="py-2">Signification</th>
                    <th className="py-2">Planet</th>
                    <th className="py-2">Deg in Sign</th>
                    <th className="py-2">D9 Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70 tabular-nums">
                  {jaimini.karakas.map((k) => (
                    <tr key={k.shortCode}>
                      <td className="py-2 font-bold text-[#9A6D12] dark:text-amber-300">{k.shortCode}</td>
                      <td className="py-2">{k.role}</td>
                      <td className="py-2 font-semibold">{k.planet}</td>
                      <td className="py-2 font-mono">{k.degreeInSign}°</td>
                      <td className="py-2">{k.d9Sign}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
              <h2 className="font-display text-xl font-bold">Karakamsha Chart Houses &amp; Insights</h2>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {jaimini.insights.map((line, i) => (
                  <li key={i} className="p-2.5 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/70 border border-[#E7DEC8] dark:border-slate-800">
                    {line}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {jaimini.karakamshaPlacements.map((pl) => (
                  <div key={pl.planet} className="p-2 rounded border border-[#E7DEC8] dark:border-slate-800">
                    <span className="font-semibold">{pl.planet}</span>: H{pl.houseFromKarakamsha} ({pl.d9Sign})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'ashtakavarga' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold">
                  A-10 &amp; A-12 · Sarva Ashtakavarga ({ashtakavarga.totalBindus} Total Bindus) &amp; Bhinna Comparison
                </h2>
                <p className="text-xs text-slate-500">
                  Strong Signs (&ge;30): {ashtakavarga.strongSigns.join(', ') || 'None'} · Moderate/Low (&le;24): {ashtakavarga.weakSigns.join(', ') || 'None'}
                </p>
              </div>
              <select
                value={selectedBavPlanet}
                onChange={(e) => setSelectedBavPlanet(e.target.value as AshtakavargaPlanet)}
                className="px-3 py-1.5 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              >
                {(['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as AshtakavargaPlanet[]).map((p) => (
                  <option key={p} value={p}>{p} BAV &amp; Prasthara</option>
                ))}
              </select>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="sign" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="SAV" name="Sarva Ashtakavarga (SAV)" fill="#C59326" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Bhinna" name={`${selectedBavPlanet} Bhinna (BAV)`} fill="#0D1B3E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-3">A-11 · Prasthara Ashtakavarga Table — {selectedBavPlanet} (8 Contributors × 12 Signs)</h2>
            <table className="w-full text-xs text-center border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                  <th className="py-2 text-left">Contributor</th>
                  {ZODIAC_SIGNS.map((z) => (
                    <th key={z.index} className="py-2 px-1">{z.name.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                {Object.entries(ashtakavarga.prasthara[selectedBavPlanet]).map(([contrib, row]) => (
                  <tr key={contrib}>
                    <td className="py-1.5 text-left font-semibold">{contrib}</td>
                    {row.map((val, idx) => (
                      <td key={idx} className={`py-1.5 ${val === 1 ? 'text-[#9A6D12] dark:text-amber-300 font-bold' : 'text-slate-400'}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-[#F7F2E4] dark:bg-slate-900 font-bold">
                  <td className="py-2 text-left">BAV Total</td>
                  {ashtakavarga.bhinna[selectedBavPlanet].map((t, i) => (
                    <td key={i} className="py-2">{t}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'shadbala' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5">
            <h2 className="font-display text-xl font-bold mb-3">A-13 · Shadbala Total Rupas vs Required Minimum</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shadbala}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="planet" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRupas" name="Computed Rupas" fill="#C59326" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="requiredRupas" name="Minimum Required Rupas" fill="#0D1B3E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-3">A-13, A-14 &amp; A-15 · Complete Shadbala Components, Ishta/Kashta Phala &amp; Avasthas</h2>
            <table className="w-full text-xs text-left tabular-nums">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                  <th className="py-2 pr-2">Planet</th>
                  <th className="py-2 pr-2">Sthana</th>
                  <th className="py-2 pr-2">Dig</th>
                  <th className="py-2 pr-2">Kala</th>
                  <th className="py-2 pr-2">Chesta</th>
                  <th className="py-2 pr-2">Drik</th>
                  <th className="py-2 pr-2">Total Rupas</th>
                  <th className="py-2 pr-2">Ishta / Kashta</th>
                  <th className="py-2 pr-2">Baladi</th>
                  <th className="py-2">Deeptadi / Jagradadi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                {shadbala.map((s) => (
                  <tr key={s.planet}>
                    <td className="py-2 pr-2 font-semibold">{s.planet}</td>
                    <td className="py-2 pr-2">{s.sthanaBala}</td>
                    <td className="py-2 pr-2">{s.digBala}</td>
                    <td className="py-2 pr-2">{s.kalaBala}</td>
                    <td className="py-2 pr-2">{s.chestaBala}</td>
                    <td className="py-2 pr-2">{s.drikBala}</td>
                    <td className="py-2 pr-2 font-bold">
                      {s.totalRupas} ({s.isStrong ? 'Strong' : 'Below Req'})
                    </td>
                    <td className="py-2 pr-2">{s.ishtaPhala} / {s.kashtaPhala}</td>
                    <td className="py-2 pr-2">{s.baladiAvastha}</td>
                    <td className="py-2">{s.deeptadiAvastha} · {s.jagradadiAvastha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
