import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { BirthInputForm } from '../components/BirthInputForm';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { compareParentChildKundli, generateLifeAnalysis } from '../engine/lifeAndMuhurat';
import { exportKundliReportPdf } from '../utils/reportExporter';

const DEFAULT_PRIMARY: BirthInput = {
  name: 'Ananya Verma',
  date: '1994-11-12',
  time: '07:25',
  placeName: 'Jaipur, India',
  latitude: 26.9124,
  longitude: 75.7873,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  ayanamsha: 'lahiri',
};

const DEFAULT_CHILD: BirthInput = {
  name: 'Rohan Verma',
  date: '2021-04-18',
  time: '11:15',
  placeName: 'Jaipur, India',
  latitude: 26.9124,
  longitude: 75.7873,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  ayanamsha: 'lahiri',
};

export function LifeAnalysisPage() {
  const { activeKundli, setActiveKundli } = useApp();
  const [kundli, setKundli] = useState(() => activeKundli || calculateKundli(DEFAULT_PRIMARY));
  const [childKundli, setChildKundli] = useState(() => calculateKundli(DEFAULT_CHILD));

  const report = useMemo(() => generateLifeAnalysis(kundli), [kundli]);
  const parentChild = useMemo(() => compareParentChildKundli(kundli, childKundli), [kundli, childKundli]);

  const handleComputePrimary = (inp: BirthInput) => {
    const res = calculateKundli(inp);
    setKundli(res);
    setActiveKundli(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Advanced Life & Personal Astrology Analysis — Career, Wealth, Education & Family"
        description="Comprehensive house-lord and divisional-chart life analysis: Education, Career, Wealth Yogas, Foreign Travel, Property, Spiritual Growth, Leadership, and Parent-Child comparison."
        keywords="vedic career yoga analyzer online, foreign travel yoga kundli calculator, property vehicle yoga astrology, parent child kundli comparison free"
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7DEC8] dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Category C · Features 31–45 · D-Chart &amp; SAV Synthesis
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            Advanced Life &amp; Personal Analysis
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Quantitative strength across 9 life domains derived directly from Bhava lords, Sarva Ashtakavarga bindus, Shadbala Rupas, and Divisional charts.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            exportKundliReportPdf({
              title: `Personal Life Analysis — ${kundli.input.name}`,
              subtitle: `${report.personalProfile.lagnaSign} · ${report.personalProfile.moonSign} · ${report.personalProfile.moonNakshatra} P${report.personalProfile.pada}`,
              metadataLines: [report.personalProfile.personalitySynthesis],
              sections: [
                {
                  heading: 'Life Area Strength Scores',
                  rows: report.lifeAreas.map((a) => `${a.area} (${a.score}/100): ${a.summary}`),
                },
                {
                  heading: 'Planetary Strength Ranking',
                  rows: report.planetaryRanking.map(
                    (p) => `#${p.rank} ${p.planet} — Score ${p.compositeScore} (${p.shadbalaRupas} Rupas, ${p.dignity}, H${p.house})`
                  ),
                },
              ],
              filename: `goo-life-analysis-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D1B3E] text-[#FCFBF7] border border-[#C59326]/50 text-xs font-semibold cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Life PDF</span>
        </button>
      </div>

      <BirthInputForm initialValue={kundli.input} onSubmit={handleComputePrimary} submitLabel="Analyze Personal Life Chart" />

      {/* C-31 & C-32: Personal Planetary Profile & Lagna+Moon Synthesis */}
      <div className="rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326] p-6 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-500">Ascendant (Lagna)</p>
            <p className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-300">{report.personalProfile.lagnaSign}</p>
          </div>
          <div>
            <p className="text-slate-500">Moon Sign (Rashi)</p>
            <p className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-300">{report.personalProfile.moonSign}</p>
          </div>
          <div>
            <p className="text-slate-500">Sun Sign</p>
            <p className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-300">{report.personalProfile.sunSign}</p>
          </div>
          <div>
            <p className="text-slate-500">Birth Star &amp; Syllable</p>
            <p className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-300">
              {report.personalProfile.moonNakshatra} P{report.personalProfile.pada} ({report.personalProfile.padaSyllable})
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-[#E7DEC8] dark:border-slate-800">
          {report.personalProfile.personalitySynthesis}
        </p>
      </div>

      {/* C-33: Life Area Strength Dashboard */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5">
        <h2 className="font-display text-xl font-bold mb-3">C-33 · Life Area Strength Dashboard</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.lifeAreas} layout="vertical" margin={{ left: 30, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="area" type="category" width={190} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="score" name="Chart Index (/100)" fill="#C59326" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* C-34..C-44 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {report.lifeAreas.map((item) => (
          <div
            key={item.area}
            className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-200">{item.area}</h3>
                <span className="font-mono text-sm font-bold text-[#9A6D12] dark:text-amber-300 tabular-nums">
                  {item.score}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.keyHouses}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{item.summary}</p>
            </div>
            <ul className="space-y-1 pt-2 border-t border-[#F3ECDC] dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              {item.supportingYogas.map((y, idx) => (
                <li key={idx}>• {y}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* C-45: Personal Planetary Strength Ranking */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
        <h2 className="font-display text-xl font-bold mb-3">C-45 · Personal Planetary Strength Ranking</h2>
        <table className="w-full text-xs text-left tabular-nums">
          <thead>
            <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
              <th className="py-2">Rank</th>
              <th className="py-2">Planet</th>
              <th className="py-2">Shadbala Rupas</th>
              <th className="py-2">Dignity</th>
              <th className="py-2">House</th>
              <th className="py-2">SAV Bindus</th>
              <th className="py-2">Composite Index</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
            {report.planetaryRanking.map((p) => (
              <tr key={p.planet}>
                <td className="py-2 font-bold text-[#9A6D12] dark:text-amber-300">#{p.rank}</td>
                <td className="py-2 font-semibold">{p.planet}</td>
                <td className="py-2 font-mono">{p.shadbalaRupas}</td>
                <td className="py-2">{p.dignity}</td>
                <td className="py-2">H{p.house}</td>
                <td className="py-2">{p.savInSign}</td>
                <td className="py-2 font-mono font-bold">{p.compositeScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* C-40: Parent-Child Kundli Comparison */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-6 space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-200">
            C-40 · Parent–Child Kundli Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compares primary chart above (Parent) against Child birth details for Moon Rashi, Lagna, Jupiter mentorship, and Nakshatra Tara resonance.
          </p>
        </div>

        <BirthInputForm
          initialValue={childKundli.input}
          onSubmit={(inp) => setChildKundli(calculateKundli(inp))}
          submitLabel="Compare Child Chart"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-[#F7F2E4] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
            <p className="text-slate-500">Parent → Child Lagna Axis</p>
            <p className="font-semibold text-sm mt-1">
              {parentChild.parentLagna} ↔ {parentChild.childLagna} (H{parentChild.lagnaRelationshipHouse})
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#F7F2E4] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
            <p className="text-slate-500">Moon Rashi Axis</p>
            <p className="font-semibold text-sm mt-1">
              {parentChild.parentMoon} ↔ {parentChild.childMoon} (H{parentChild.moonRelationshipHouse})
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-[#F7F2E4] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
            <p className="text-slate-500">Jupiter &amp; Tara Harmony</p>
            <p className="font-semibold text-sm mt-1">
              {parentChild.jupiterMoonBlessing ? 'Jupiter Blesses Moon' : 'Independent Style'} ·{' '}
              {parentChild.nakshatraTaraFavorable ? 'Auspicious Tara' : 'Growth Tara'}
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
          {parentChild.guidance.map((g, i) => (
            <li key={i} className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/70 border border-[#E7DEC8] dark:border-slate-800">
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
