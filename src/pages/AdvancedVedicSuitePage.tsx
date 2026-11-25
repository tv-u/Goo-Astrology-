import React, { useMemo, useState } from 'react';
import { Compass, Layers, Sparkles, Target } from 'lucide-react';
import { BirthInputForm } from '../components/BirthInputForm';
import { MonetagDirectLinkCta } from '../components/AdSlot';
import { KundliShareCardAndQr, VoiceReadAloudButton, trackAnalyticsEvent } from '../components/MonetagAndSeoExtras';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { PLANET_SHORT, ZODIAC_SIGNS, type PlanetId } from '../engine/constants';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import {
  analyzeNadiLinks,
  analyzeSensitiveAndCriticalDegrees,
  calculateArudhaPadas,
  calculateAshtottariDasha,
  calculateBhriguBindu,
  calculateCharaDasha,
  calculateKalachakraDasha,
  calculateKakshyaTransitScores,
  calculateKpHorary249,
  calculateNarayanaDasha,
  calculatePanchadhaMaitri,
  calculatePanchapakshi,
  calculateYoginiDasha,
} from '../engine/advancedVedic60';

const DEFAULT_BIRTH: BirthInput = {
  name: 'Aarav Sharma',
  date: '1995-08-15',
  time: '14:30',
  latitude: 28.6139,
  longitude: 77.209,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  placeName: 'New Delhi, Delhi, India',
  ayanamsha: 'lahiri',
};

function SudarshanChakraSvg({ kundli }: { kundli: ReturnType<typeof calculateKundli> }) {
  const cx = 220;
  const cy = 220;
  const radii = [200, 152, 104, 52];

  const getPlacements = (refSign: number) => {
    const map: Record<number, string[]> = {};
    for (let h = 1; h <= 12; h++) map[h] = [];
    for (const p of kundli.planets) {
      const h = ((p.signIndex - refSign + 12) % 12) + 1;
      map[h].push(PLANET_SHORT[p.id as PlanetId]);
    }
    return map;
  };

  const lagnaMap = getPlacements(kundli.lagnaSignIndex);
  const moonMap = getPlacements(kundli.moonSignIndex);
  const sunMap = getPlacements(kundli.sunSignIndex);

  const ringPoint = (house: number, r: number) => {
    const angleDeg = -90 + (house - 1) * 30 + 15;
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <svg viewBox="0 0 440 440" className="w-full max-w-[440px] mx-auto select-none">
      {radii.map((r, i) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={r}
          fill={i === 3 ? 'rgba(197, 147, 38, 0.14)' : 'none'}
          stroke="#C59326"
          strokeWidth={i === 0 ? 2 : 1.2}
          strokeOpacity={0.85}
        />
      ))}
      {Array.from({ length: 12 }, (_, idx) => {
        const angleRad = ((-90 + idx * 30) * Math.PI) / 180;
        const x1 = cx + radii[3] * Math.cos(angleRad);
        const y1 = cy + radii[3] * Math.sin(angleRad);
        const x2 = cx + radii[0] * Math.cos(angleRad);
        const y2 = cy + radii[0] * Math.sin(angleRad);
        const h = idx + 1;
        const pOuter = ringPoint(h, 176);
        const pMid = ringPoint(h, 128);
        const pInner = ringPoint(h, 78);
        const signNum = ((kundli.lagnaSignIndex + h - 1) % 12) + 1;

        return (
          <g key={h}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C59326" strokeOpacity={0.55} strokeWidth={1} />
            <text x={pOuter.x} y={pOuter.y - 6} textAnchor="middle" className="fill-amber-600 dark:fill-amber-300 text-[9px] font-mono font-bold">
              H{h} (S{signNum})
            </text>
            <text x={pOuter.x} y={pOuter.y + 7} textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 text-[9px] font-semibold">
              {lagnaMap[h].join(' ') || '·'}
            </text>
            <text x={pMid.x} y={pMid.y + 3} textAnchor="middle" className="fill-sky-700 dark:fill-sky-300 text-[9px] font-semibold">
              {moonMap[h].join(' ') || '·'}
            </text>
            <text x={pInner.x} y={pInner.y + 3} textAnchor="middle" className="fill-rose-700 dark:fill-rose-300 text-[8.5px] font-semibold">
              {sunMap[h].join(' ') || '·'}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[#0D1B3E] dark:fill-amber-200 text-[10px] font-bold">
        SUDARSHAN
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-500 text-[8.5px]">
        Lagna·Moon·Sun
      </text>
    </svg>
  );
}

export const AdvancedVedicSuitePage: React.FC = () => {
  const { activeKundli, setActiveKundli, t } = useApp();
  const [tab, setTab] = useState<'dashas' | 'jaimini' | 'degrees' | 'sudarshan' | 'kp249'>('dashas');
  const [horaryNum, setHoraryNum] = useState(108);

  const kundli = useMemo(
    () => activeKundli || calculateKundli(DEFAULT_BIRTH),
    [activeKundli]
  );

  const charaDasha = useMemo(() => calculateCharaDasha(kundli), [kundli]);
  const arudhas = useMemo(() => calculateArudhaPadas(kundli), [kundli]);
  const yogini = useMemo(() => calculateYoginiDasha(kundli), [kundli]);
  const ashtottari = useMemo(() => calculateAshtottariDasha(kundli), [kundli]);
  const kalachakra = useMemo(() => calculateKalachakraDasha(kundli), [kundli]);
  const narayana = useMemo(() => calculateNarayanaDasha(kundli), [kundli]);
  const kakshya = useMemo(() => calculateKakshyaTransitScores(kundli), [kundli]);
  const nadiLinks = useMemo(() => analyzeNadiLinks(kundli), [kundli]);
  const bhrigu = useMemo(() => calculateBhriguBindu(kundli), [kundli]);
  const pakshi = useMemo(() => calculatePanchapakshi(kundli), [kundli]);
  const sensitive = useMemo(() => analyzeSensitiveAndCriticalDegrees(kundli), [kundli]);
  const maitri = useMemo(() => calculatePanchadhaMaitri(kundli), [kundli]);
  const kp249 = useMemo(() => calculateKpHorary249(horaryNum, kundli.input), [horaryNum, kundli.input]);

  const voiceSummary = `Jaimini and Vedic report for ${kundli.input.name}. Lagna is ${kundli.ascendant.signName}. Atmakaraka is ${sensitive.atmakaraka}, Ishta Devata is ${sensitive.ishtaDevata}. Bhrigu Bindu is in ${bhrigu.signName} House ${bhrigu.houseFromLagna}. Panchapakshi birth bird is ${pakshi.birthBird}.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Advanced Vedic Research: Jaimini Chara Dasha, Yogini, Arudha, Sudarshan & KP 249"
        description="Compute Jaimini Chara Dasha, Arudha Padas (AL/UL), Yogini, Ashtottari, Kalachakra, Narayana Dasha, Kakshya, Bhrigu Bindu, Panchapakshi, Sudarshan Chakra & KP 1-249 Horary."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A6D12] dark:text-amber-400">
            Advanced Research Suite · Features #1–#20
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-white mt-1">
            {t('Jaimini, Conditional Dashas, Sudarshan Chakra & KP 249', 'जैमिनी, योगिनी दशा, सुदर्शन चक्र एवं केपी 249 होरारी')}
          </h1>
        </div>
        <VoiceReadAloudButton text={voiceSummary} />
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
        <BirthInputForm
          initialValue={kundli.input}
          onSubmit={(inp) => {
            setActiveKundli(calculateKundli(inp));
            trackAnalyticsEvent('/vedic-suite', 'advanced_vedic_recalc', 'calculator_run');
          }}
          submitLabel={t('Recalculate Advanced Systems', 'उन्नत गणना चलाएं')}
        />
      </div>

      <KundliShareCardAndQr kundli={kundli} />

      <div className="flex flex-wrap gap-2 border-b border-[#E7DEC8] dark:border-slate-800 pb-3">
        {(
          [
            ['dashas', '1. Chara, Yogini, Ashtottari, Kalachakra & Narayana Dasha'],
            ['jaimini', '2. Arudha Padas, Nadi Links, Bhrigu Bindu & Panchapakshi'],
            ['degrees', '3. Pushkara, 64th D9, Mrityu, Badhaka, Kakshya & Maitri'],
            ['sudarshan', '4. Interactive Sudarshan Chakra (3-Ring)'],
            ['kp249', '5. KP 1–249 Number Horary & Ruling Planets'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
              tab === k
                ? 'bg-[#C59326] text-white'
                : 'border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] text-slate-700 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C59326]" /> Jaimini Chara Dasha (Sign-Based)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                    <th className="py-1.5 pr-2">Rashi</th><th className="py-1.5 pr-2">Lord</th><th className="py-1.5 pr-2">Years</th><th className="py-1.5">Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {charaDasha.map((d) => (
                    <tr key={d.signName + d.startDate}>
                      <td className="py-1.5 pr-2 font-semibold">{d.signName} ({d.hindiSign})</td>
                      <td className="py-1.5 pr-2">{d.lord}</td>
                      <td className="py-1.5 pr-2 font-mono">{d.durationYears}y</td>
                      <td className="py-1.5 font-mono text-slate-500">{d.startDate} → {d.endDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Yogini Dasha (36-Year Cycle)</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                  <th className="py-1.5 pr-2">Yogini</th><th className="py-1.5 pr-2">Planet</th><th className="py-1.5 pr-2">Yrs</th><th className="py-1.5">Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {yogini.map((y) => (
                  <tr key={y.name + y.startDate}>
                    <td className="py-1.5 pr-2 font-semibold">{y.name}</td>
                    <td className="py-1.5 pr-2">{y.lord}</td>
                    <td className="py-1.5 pr-2 font-mono">{y.years}y</td>
                    <td className="py-1.5 font-mono text-slate-500">{y.startDate} → {y.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Ashtottari Dasha (108-Year Conditional)</h2>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ashtottari.map((a) => (
                  <tr key={a.lord + a.startDate}>
                    <td className="py-1.5 pr-2 font-semibold">{a.lord}</td>
                    <td className="py-1.5 pr-2 font-mono">{a.years} yrs</td>
                    <td className="py-1.5 font-mono text-slate-500 text-right">{a.startDate} → {a.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">Kalachakra &amp; Narayana Dasha</h2>
            <p className="text-xs text-slate-500">
              <strong>Kalachakra:</strong> {kalachakra.direction} · Deha: {kalachakra.dehaRashi} · Jeeva: {kalachakra.jeevaRashi} · <strong>Narayana Start:</strong> {narayana.startSignName}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {kalachakra.sequence.slice(0, 6).map((k) => (
                <div key={k.signName + k.startDate} className="p-2 rounded border border-slate-200 dark:border-slate-800 font-mono">
                  KC {k.signName} ({k.years}y): {k.startDate}
                </div>
              ))}
              {narayana.rows.slice(0, 4).map((n) => (
                <div key={n.signName + n.startDate} className="p-2 rounded border border-amber-500/30 font-mono">
                  ND {n.signName} ({n.years}y): {n.startDate}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'jaimini' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
              <h2 className="font-display text-xl font-bold text-[#9A6D12] dark:text-amber-300">Bhrigu Bindu (Moon-Rahu Midpoint)</h2>
              <p className="text-sm font-semibold">{bhrigu.signName} · {bhrigu.dms} (House {bhrigu.houseFromLagna})</p>
              <p className="text-xs text-slate-500">Nakshatra: {bhrigu.nakshatra}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">{bhrigu.note}</p>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
              <h2 className="font-display text-xl font-bold text-[#9A6D12] dark:text-amber-300">Panchapakshi Shastra</h2>
              <p className="text-sm font-semibold">Birth Bird: {pakshi.birthBird} ({pakshi.paksha})</p>
              <div className="space-y-1 text-xs font-mono">
                {pakshi.yamaSlots.map((slot) => (
                  <div key={slot.yama} className="flex justify-between">
                    <span>{slot.yama} ({slot.window})</span>
                    <span className="text-amber-600 dark:text-amber-400">{slot.activity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
              <h2 className="font-display text-xl font-bold text-[#9A6D12] dark:text-amber-300">Nadi Axis Linkages</h2>
              <div className="space-y-2 text-xs">
                {nadiLinks.map((nl) => (
                  <div key={nl.groupName} className="border-b border-slate-100 dark:border-slate-800 pb-1">
                    <p className="font-semibold">{nl.groupName}</p>
                    <p className="text-slate-500">{nl.linkedPlanets.join(', ') || 'No planets in axis'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
            <h2 className="font-display text-xl font-bold mb-3">12 Jaimini Arudha Padas (AL, UL &amp; A2–A11)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {arudhas.map((a) => (
                <div key={a.code} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="font-mono font-bold text-[#9A6D12] dark:text-amber-400">{a.code}</p>
                  <p className="font-semibold text-sm mt-0.5">{a.arudhaSignName} ({a.arudhaHindiName})</p>
                  <p className="text-slate-500">H{a.houseNumber} Lord {a.lord} in {a.lordSign}{a.exceptionApplied ? ' · Exception Applied' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'degrees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-1">
              <p className="text-slate-500">64th Navamsha (Khara D9)</p>
              <p className="font-semibold text-base">{sensitive.khara64D9Sign} (Lord: {sensitive.khara64Lord})</p>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-1">
              <p className="text-slate-500">22nd Drekkana (Khara D3)</p>
              <p className="font-semibold text-base">{sensitive.khara22D3Sign} (Lord: {sensitive.khara22Lord})</p>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-1">
              <p className="text-slate-500">Badhaka Sthana &amp; Lord</p>
              <p className="font-semibold text-base">H{sensitive.badhakaHouse} · {sensitive.badhakaSign} ({sensitive.badhakaLord})</p>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-1">
              <p className="text-slate-500">Ishta Devata (AK: {sensitive.atmakaraka})</p>
              <p className="font-semibold text-xs leading-snug">{sensitive.ishtaDevata}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-3">Pushkara Navamsha, Mrityu Bhaga &amp; Gandanta</h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                    <th className="py-1.5">Planet</th><th>Deg</th><th>Pushkara D9</th><th>Mrityu Bhaga</th><th>Gandanta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sensitive.planetChecks.map((row) => (
                    <tr key={row.planet}>
                      <td className="py-1.5 font-semibold">{row.planet}</td>
                      <td className="py-1.5 font-mono">{row.degreeInSign}° {row.signName}</td>
                      <td className="py-1.5">{row.inPushkaraNavamsha ? 'Yes (Blessing)' : 'No'}</td>
                      <td className="py-1.5">{row.nearMrityuBhaga ? `Active (${row.mrityuDegreeTarget}°)` : `Clear (${row.mrityuDegreeTarget}°)`}</td>
                      <td className="py-1.5">{row.isGandanta ? 'Gandanta Junction' : 'Clear'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-3">Today's Kakshya Transit Scores (3.75° Sectors)</h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                    <th className="py-1.5">Planet</th><th>Sign &amp; Kakshya</th><th>Bindus</th><th>SAV</th><th>Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {kakshya.map((k) => (
                    <tr key={k.planet}>
                      <td className="py-1.5 font-semibold">{k.planet}</td>
                      <td className="py-1.5 font-mono">{k.transitSign} K{k.kakshyaNumber} ({k.kakshyaLord})</td>
                      <td className="py-1.5 font-mono">{k.bhinnaBindus}/8</td>
                      <td className="py-1.5 font-mono">{k.sarvaBindus}</td>
                      <td className="py-1.5">{k.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-3">Panchadha Maitri (5-Fold Planetary Friendship Matrix)</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                  <th className="py-1.5">Planet</th>
                  {maitri.map((m) => <th key={m.planet} className="py-1.5">{m.planet}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {maitri.map((row) => (
                  <tr key={row.planet}>
                    <td className="py-1.5 font-semibold">{row.planet}</td>
                    {maitri.map((col) => (
                      <td key={col.planet} className="py-1.5 font-mono text-[11px]">{row.relations[col.planet]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'sudarshan' && (
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6">
            <SudarshanChakraSvg kundli={kundli} />
          </div>
          <div className="lg:col-span-6 space-y-3 text-sm">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C59326]" />
              Interactive Sudarshan Chakra (3-Ring Composite)
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Classical Parashari technique superimposing three concentric houses simultaneously:
            </p>
            <ul className="space-y-2 text-xs">
              <li className="p-2.5 rounded-lg border border-amber-500/40">
                <strong>Outer Ring (Gold/Ink):</strong> Lagna Kundli ({kundli.ascendant.signName}) — Physical &amp; worldly structure.
              </li>
              <li className="p-2.5 rounded-lg border border-sky-500/40">
                <strong>Middle Ring (Sky Blue):</strong> Chandra Kundli ({ZODIAC_SIGNS[kundli.moonSignIndex].name}) — Mind, emotions &amp; Gochar receptivity.
              </li>
              <li className="p-2.5 rounded-lg border border-rose-500/40">
                <strong>Inner Ring (Rose):</strong> Surya Kundli ({ZODIAC_SIGNS[kundli.sunSignIndex].name}) — Soul vitality, dharma &amp; career authority.
              </li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'kp249' && (
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-[#C59326]" /> KP 1–249 Number Horary &amp; Live Ruling Planets
              </h2>
              <p className="text-xs text-slate-500">Pick any horary number between 1 and 249 to generate exact KP Sub-Lord Ascendant &amp; Ruling Planets.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold">Horary # (1–249):</label>
              <input
                type="number"
                min={1}
                max={249}
                value={horaryNum}
                onChange={(e) => setHoraryNum(Math.max(1, Math.min(249, Number(e.target.value) || 1)))}
                className="w-24 px-3 py-1.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Horary Lagna (#{kp249.horaryNumber})</p>
              <p className="font-semibold text-base mt-1">{kp249.horaryLagnaSign} ({kp249.horaryLagnaLon}°)</p>
              <p className="font-mono text-[#9A6D12] dark:text-amber-400 mt-1">
                Rashi: {kp249.horaryLagnaKp.rashiLord} · Star: {kp249.horaryLagnaKp.starLord} · Sub: {kp249.horaryLagnaKp.subLord}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500">Moon &amp; Vara (Day Lord)</p>
              <p className="font-semibold text-base mt-1">Day Lord: {kp249.dayLord}</p>
              <p className="font-mono text-slate-500 mt-1">
                Moon Star: {kp249.moonKp.starLord} · Sub: {kp249.moonKp.subLord}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5">
              <p className="text-slate-500 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-[#C59326]" /> KP Ruling Planets (RP)</p>
              <p className="font-semibold text-base mt-1 text-[#9A6D12] dark:text-amber-300">
                {kp249.rulingPlanets.join(' · ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <MonetagDirectLinkCta placement="vedic_suite" />
    </div>
  );
};
