import React, { useEffect, useMemo, useState } from 'react';
import { Download, Printer, Share2, Trash2, UserPlus, Users } from 'lucide-react';
import { BirthInputForm } from '../components/BirthInputForm';
import { KundliChartSvg, type ChartStyle } from '../components/KundliChartSvg';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli, type BirthInput, type KundliResult } from '../engine/ephemeris';
import {
  analyzeDetailedCompatibilityExtras,
  calculateAshtakoot,
  type AshtakootReport,
} from '../engine/ashtakoot';
import { analyzeChildBirthNakshatra } from '../engine/lifeAndMuhurat';
import { calculateNumerology } from '../engine/numerology';
import {
  deleteFamilyMemberOffline,
  listFamilyMembersOffline,
  saveFamilyMemberOffline,
} from '../utils/offlineDb';
import { exportKundliReportPdf } from '../utils/reportExporter';

const DEFAULT_BRIDE: BirthInput = {
  name: 'Ananya Verma',
  date: '1997-04-18',
  time: '09:40',
  latitude: 28.6139,
  longitude: 77.209,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  placeName: 'New Delhi, Delhi, India',
  ayanamsha: 'lahiri',
};

const DEFAULT_GROOM: BirthInput = {
  name: 'Rohan Kulkarni',
  date: '1995-11-22',
  time: '19:15',
  latitude: 19.076,
  longitude: 72.8777,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  placeName: 'Mumbai, Maharashtra, India',
  ayanamsha: 'lahiri',
};

const DEFAULT_CHILD: BirthInput = {
  name: 'Aarav Kulkarni',
  date: '2024-06-12',
  time: '07:25',
  latitude: 19.076,
  longitude: 72.8777,
  timezoneOffsetMinutes: 330,
  timezoneName: 'Asia/Kolkata',
  placeName: 'Mumbai, Maharashtra, India',
  ayanamsha: 'lahiri',
};

interface FamilyMemberRecord {
  id: string;
  relation: string;
  name: string;
  birthDate: string;
  birthTime: string;
  placeName: string;
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  createdAt: string;
}

export const MatchingPage: React.FC = () => {
  const { token, t } = useApp();
  const [brideInput, setBrideInput] = useState<BirthInput>(DEFAULT_BRIDE);
  const [groomInput, setGroomInput] = useState<BirthInput>(DEFAULT_GROOM);
  const [brideKundli, setBrideKundli] = useState<KundliResult>(() => calculateKundli(DEFAULT_BRIDE));
  const [groomKundli, setGroomKundli] = useState<KundliResult>(() => calculateKundli(DEFAULT_GROOM));
  const [report, setReport] = useState<AshtakootReport>(() =>
    calculateAshtakoot(calculateKundli(DEFAULT_BRIDE), calculateKundli(DEFAULT_GROOM))
  );
  const [activeTab, setActiveTab] = useState<'ashtakoot' | 'overlay' | 'family' | 'child-num'>('ashtakoot');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');
  const [copiedMsg, setCopiedMsg] = useState('');

  // Family Chart Collection (IndexedDB E-67)
  const [familyList, setFamilyList] = useState<FamilyMemberRecord[]>([]);
  const [newRelation, setNewRelation] = useState('Mother');
  const [familyInput, setFamilyInput] = useState<BirthInput>({
    name: 'Meera Verma',
    date: '1970-09-14',
    time: '06:15',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    timezoneName: 'Asia/Kolkata',
    placeName: 'New Delhi, Delhi, India',
    ayanamsha: 'lahiri',
  });

  // Child Birth Nakshatra Analysis (E-68) & Family Name Numerology (E-69)
  const [childInput, setChildInput] = useState<BirthInput>(DEFAULT_CHILD);
  const [childKundli, setChildKundli] = useState<KundliResult>(() => calculateKundli(DEFAULT_CHILD));
  const [familySurname, setFamilySurname] = useState('Kulkarni');

  const liveTransitSky = useMemo(() => {
    const now = new Date();
    return calculateKundli({
      name: 'Live Transit Sky',
      date: now.toISOString().slice(0, 10),
      time: now.toISOString().slice(11, 16),
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 0,
      ayanamsha: 'lahiri',
    });
  }, []);

  const extras = useMemo(
    () => analyzeDetailedCompatibilityExtras(brideKundli, groomKundli, liveTransitSky),
    [brideKundli, groomKundli, liveTransitSky]
  );

  const childNak = useMemo(() => analyzeChildBirthNakshatra(childKundli), [childKundli]);
  const brideNum = useMemo(() => calculateNumerology(brideInput.name, brideInput.date), [brideInput.name, brideInput.date]);
  const groomNum = useMemo(() => calculateNumerology(groomInput.name, groomInput.date), [groomInput.name, groomInput.date]);
  const familyNum = useMemo(
    () => calculateNumerology(`${childInput.name} ${familySurname}`.trim(), childInput.date),
    [childInput.name, childInput.date, familySurname]
  );

  const refreshFamily = async () => {
    try {
      const items = await listFamilyMembersOffline();
      setFamilyList(items);
    } catch {
      // IndexedDB unavailable
    }
  };

  useEffect(() => {
    refreshFamily();
  }, []);

  const runMatch = (nextBride: BirthInput, nextGroom: BirthInput) => {
    const bK = calculateKundli(nextBride);
    const gK = calculateKundli(nextGroom);
    setBrideKundli(bK);
    setGroomKundli(gK);
    setReport(calculateAshtakoot(bK, gK));
    if (token) {
      fetch('/api/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bride: nextBride, groom: nextGroom }),
      }).catch(() => {});
    }
  };

  const handleAddFamilyMember = async (inp: BirthInput) => {
    const k = calculateKundli(inp);
    const moon = k.planets.find((p) => p.id === 'Moon')!;
    await saveFamilyMemberOffline({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      relation: newRelation,
      name: inp.name,
      birthDate: inp.date,
      birthTime: inp.time,
      placeName: inp.placeName || 'India',
      latitude: inp.latitude,
      longitude: inp.longitude,
      timezoneOffsetMinutes: inp.timezoneOffsetMinutes,
      lagna: k.ascendant.signName,
      moonSign: moon.signName,
      nakshatra: `${moon.nakshatraName} P${moon.pada}`,
      createdAt: new Date().toISOString(),
    });
    setFamilyInput(inp);
    await refreshFamily();
    setCopiedMsg(`Saved ${inp.name} (${newRelation}) to offline Family Chart Collection.`);
  };

  const handleShare = async () => {
    const summary = `GOO ASTROLOGY Ashtakoot Match: ${brideInput.name} & ${groomInput.name} — ${report.totalScore}/36 (${report.verdict})`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedMsg(t('Report summary copied to clipboard.', 'रिपोर्ट सारांश क्लिपबोर्ड पर कॉपी हो गया।'));
    } catch {
      setCopiedMsg(summary);
    }
  };

  const handleExportPdf = () => {
    exportKundliReportPdf({
      title: `Relationship & Ashtakoot Report: ${brideInput.name} & ${groomInput.name}`,
      subtitle: `Total Score: ${report.totalScore} / 36 — ${report.verdict}`,
      metadataLines: [
        `Bride: ${brideInput.name} (${brideInput.date} ${brideInput.time}, ${brideInput.placeName || 'India'}) | Lagna: ${brideKundli.ascendant.signName} | Moon: ${brideKundli.planets[1].signName} (${brideKundli.planets[1].nakshatraName})`,
        `Groom: ${groomInput.name} (${groomInput.date} ${groomInput.time}, ${groomInput.placeName || 'India'}) | Lagna: ${groomKundli.ascendant.signName} | Moon: ${groomKundli.planets[1].signName} (${groomKundli.planets[1].nakshatraName})`,
        `Summary: ${report.recommendation}`,
      ],
      sections: [
        {
          heading: '1. Ashtakoot 36-Point Gun Milan Breakdown',
          rows: report.kootas.map(
            (k) => `${k.name} (${k.hindiName}): ${k.obtainedScore}/${k.maxScore} — Bride: ${k.brideValue} | Groom: ${k.groomValue}`
          ),
        },
        {
          heading: '2. Nadi, Bhakoot & Manglik Exception Analysis',
          rows: [
            `Nadi: ${report.nadiDosha.note}`,
            ...extras.nadiExceptions.map((e) => `  - ${e.rule}: ${e.applies ? 'APPLIES' : 'No'}`),
            `Bhakoot: ${report.bhakootDosha.note}`,
            ...extras.bhakootExceptions.map((e) => `  - ${e.rule}: ${e.applies ? 'APPLIES' : 'No'}`),
            `Manglik: ${report.manglikCheck.note}`,
            ...extras.manglikCancellations.map((e) => `  - ${e.rule}: ${e.applies ? 'CANCELLATION ACTIVE' : 'Not triggered'}`),
          ],
        },
        {
          heading: '3. Couple Live Transit Alignment (Moon House Distance)',
          rows: extras.coupleTransits.map(
            (ct) => `${ct.planet} in ${ct.transitSign}: House ${ct.brideMoonHouse} from Bride Moon | House ${ct.groomMoonHouse} from Groom Moon`
          ),
        },
        {
          heading: '4. Family Name & Partner Numerology',
          rows: [
            `Bride (${brideInput.name}): Life Path ${brideNum.lifePathNumber}, Destiny ${brideNum.destinyNumber}, Chaldean ${brideNum.chaldeanNameNumber}`,
            `Groom (${groomInput.name}): Life Path ${groomNum.lifePathNumber}, Destiny ${groomNum.destinyNumber}, Chaldean ${groomNum.chaldeanNameNumber}`,
          ],
        },
      ],
      filename: `goo-relationship-report-${brideInput.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Kundli Matching, Family Charts & Relationship Suite (E-61 to E-70)"
        description="Complete Vedic Ashtakoot 36-point marriage compatibility with Nadi/Bhakoot/Manglik exception analyzers, chart overlays, couple transits, offline family charts, child Nakshatra analysis, and PDF export."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wider uppercase text-[#9A6D12] dark:text-amber-400">
            Category E · Features E-61 to E-70
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-white mt-1">
            {t('Kundli Matching & Family Relationship Suite', 'कुंडली मिलान एवं परिवार ज्योतिष सूट')}
          </h1>
          <p className="text-sm text-[#4A5568] dark:text-slate-400 mt-1">
            {t(
              '36-point Gun Milan, Nadi/Bhakoot/Manglik exception rules, D1/D9 overlay, live couple transits, and offline family collection.',
              '36-गुण अष्टकूट मिलान, नाड़ी/भकूट/मांगलिक परिहार नियम, चार्ट ओवरले, युगल गोचर और पारिवारिक कुंडली संग्रह।'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] hover:border-[#C59326] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            {t('Share Summary', 'सारांश साझा करें')}
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {t('Export Relationship PDF', 'रिपोर्ट PDF डाउनलोड')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] hover:border-[#C59326] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            {t('Print', 'प्रिंट')}
          </button>
        </div>
      </div>

      {copiedMsg && (
        <p className="text-xs font-medium px-3.5 py-2 rounded-lg bg-[#F7F2E4] dark:bg-amber-500/10 border border-[#E7DEC8] dark:border-amber-500/30 text-[#9A6D12] dark:text-amber-300">
          {copiedMsg}
        </p>
      )}

      {/* Bride & Groom Birth Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
          <h2 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white mb-4">
            {t('Bride Birth Details (कन्या)', 'कन्या (वधू) जन्म विवरण')}
          </h2>
          <BirthInputForm
            compact
            initialValue={brideInput}
            submitLabel={t('Update Bride & Match', 'वधू विवरण से मिलान करें')}
            onSubmit={(val) => {
              setBrideInput(val);
              runMatch(val, groomInput);
            }}
          />
        </div>

        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
          <h2 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white mb-4">
            {t('Groom Birth Details (वर)', 'वर जन्म विवरण')}
          </h2>
          <BirthInputForm
            compact
            initialValue={groomInput}
            submitLabel={t('Update Groom & Match', 'वर विवरण से मिलान करें')}
            onSubmit={(val) => {
              setGroomInput(val);
              runMatch(brideInput, val);
            }}
          />
        </div>
      </div>

      {/* Results Banner */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-[#F7F2E4]/70 dark:bg-[#0C1226] p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div>
          <p className="text-xs text-[#6B5B3E] dark:text-slate-400">Ashtakoot Score (E-61)</p>
          <p className="text-3xl font-mono font-bold tabular-nums text-[#9A6D12] dark:text-amber-400 mt-1">
            {report.totalScore} / 36
          </p>
          <p className="text-sm font-semibold text-[#0D1B3E] dark:text-white mt-1">{report.verdict}</p>
        </div>
        <div className="md:col-span-3 space-y-3 text-sm text-[#1E293B] dark:text-slate-300">
          <p>{report.recommendation}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326]">
              <p className="font-semibold text-[#0D1B3E] dark:text-white">Manglik Check (E-64)</p>
              <p className="text-[#4A5568] dark:text-slate-400 mt-0.5">{report.manglikCheck.note}</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326]">
              <p className="font-semibold text-[#0D1B3E] dark:text-white">Nadi Check (E-62)</p>
              <p className="text-[#4A5568] dark:text-slate-400 mt-0.5">{report.nadiDosha.note}</p>
            </div>
            <div className="p-3 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326]">
              <p className="font-semibold text-[#0D1B3E] dark:text-white">Bhakoot Check (E-63)</p>
              <p className="text-[#4A5568] dark:text-slate-400 mt-0.5">{report.bhakootDosha.note}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category E Interactive Module Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E7DEC8] dark:border-slate-800 pb-3">
        {[
          { id: 'ashtakoot', label: 'E-61..64: Ashtakoot & Exception Rules' },
          { id: 'overlay', label: 'E-65..66: Chart Overlay & Couple Transits' },
          { id: 'family', label: `E-67: Family Chart Collection (${familyList.length})` },
          { id: 'child-num', label: 'E-68..69: Child Nakshatra & Family Numerology' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id as typeof activeTab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === item.id
                ? 'bg-[#C59326] text-white'
                : 'border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] text-[#0D1B3E] dark:text-slate-200 hover:border-[#C59326]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {activeTab === 'ashtakoot' && (
        <div className="space-y-6">
          {/* 8-Koota Table */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
            <h3 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white mb-4">
              8-Koota Point-by-Point Breakdown (E-61)
            </h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-left text-[#6B5B3E] dark:text-slate-400">
                  <th className="py-2.5 pr-4">Koota</th>
                  <th className="py-2.5 pr-4">Bride</th>
                  <th className="py-2.5 pr-4">Groom</th>
                  <th className="py-2.5 pr-4 text-right">Obtained / Max</th>
                  <th className="py-2.5">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8D6] dark:divide-slate-800/70">
                {report.kootas.map((k) => (
                  <tr key={k.name}>
                    <td className="py-3 pr-4 font-semibold text-[#0D1B3E] dark:text-white">
                      {k.name} ({k.hindiName})
                    </td>
                    <td className="py-3 pr-4">{k.brideValue}</td>
                    <td className="py-3 pr-4">{k.groomValue}</td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums font-semibold">
                      {k.obtainedScore} / {k.maxScore}
                    </td>
                    <td className="py-3 text-[#4A5568] dark:text-slate-400">{k.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Classical Exception & Cancellation Analyzers (E-62, E-63, E-64) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-white">
                E-62: Nadi Dosha Exceptions
              </h3>
              <ul className="space-y-2 text-xs">
                {extras.nadiExceptions.map((ex) => (
                  <li key={ex.rule} className="flex items-start justify-between gap-2 py-1 border-b border-[#F0E8D6] dark:border-slate-800/60">
                    <span>{ex.rule}</span>
                    <span className={`font-mono font-semibold shrink-0 ${ex.applies ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {ex.applies ? 'ACTIVE' : 'No'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-white">
                E-63: Bhakoot Dosha Exceptions
              </h3>
              <ul className="space-y-2 text-xs">
                {extras.bhakootExceptions.map((ex) => (
                  <li key={ex.rule} className="flex items-start justify-between gap-2 py-1 border-b border-[#F0E8D6] dark:border-slate-800/60">
                    <span>{ex.rule}</span>
                    <span className={`font-mono font-semibold shrink-0 ${ex.applies ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {ex.applies ? 'ACTIVE' : 'No'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
              <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-white">
                E-64: Manglik Cancellations
              </h3>
              <ul className="space-y-2 text-xs">
                {extras.manglikCancellations.map((ex) => (
                  <li key={ex.rule} className="flex items-start justify-between gap-2 py-1 border-b border-[#F0E8D6] dark:border-slate-800/60">
                    <span>{ex.rule}</span>
                    <span className={`font-mono font-semibold shrink-0 ${ex.applies ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {ex.applies ? 'MITIGATED' : 'No'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overlay' && (
        <div className="space-y-6">
          {/* E-65: Side-by-Side Marriage Compatibility Chart Overlay */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white">
                  E-65: Marriage Compatibility D1 &amp; D9 Chart Comparison
                </h3>
                <p className="text-xs text-[#4A5568] dark:text-slate-400">
                  Compare rising signs, 7th-house placements, and Navamsa (D9) alignment side-by-side.
                </p>
              </div>
              <div className="flex gap-1.5">
                {(['north', 'south', 'east'] as ChartStyle[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setChartStyle(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize cursor-pointer ${
                      chartStyle === st
                        ? 'bg-[#C59326] text-white'
                        : 'border border-[#E7DEC8] dark:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <KundliChartSvg
                title={`${brideInput.name} (D1 Lagna)`}
                ascendantSignIndex={brideKundli.lagnaSignIndex}
                placements={brideKundli.divisionalCharts[0].placements}
                styleType={chartStyle}
              />
              <KundliChartSvg
                title={`${groomInput.name} (D1 Lagna)`}
                ascendantSignIndex={groomKundli.lagnaSignIndex}
                placements={groomKundli.divisionalCharts[0].placements}
                styleType={chartStyle}
              />
            </div>
          </div>

          {/* E-66: Couple Planetary Transit Dashboard */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
            <h3 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white mb-2">
              E-66: Couple Live Planetary Transit Dashboard (Gochar from Chandra)
            </h3>
            <p className="text-xs text-[#4A5568] dark:text-slate-400 mb-4">
              Live sidereal transit house numbers computed from {brideInput.name}&apos;s Moon ({brideKundli.planets[1].signName}) and {groomInput.name}&apos;s Moon ({groomKundli.planets[1].signName}).
            </p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-left text-[#6B5B3E] dark:text-slate-400">
                  <th className="py-2 pr-4">Transit Planet</th>
                  <th className="py-2 pr-4">Current Sidereal Sign</th>
                  <th className="py-2 pr-4">House from Bride Moon</th>
                  <th className="py-2">House from Groom Moon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E8D6] dark:divide-slate-800/70">
                {extras.coupleTransits.map((ct) => (
                  <tr key={ct.planet}>
                    <td className="py-2.5 pr-4 font-semibold">{ct.planet}</td>
                    <td className="py-2.5 pr-4 font-mono">{ct.transitSign}</td>
                    <td className="py-2.5 pr-4 font-mono tabular-nums">House {ct.brideMoonHouse}</td>
                    <td className="py-2.5 font-mono tabular-nums">House {ct.groomMoonHouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'family' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#C59326]" />
                  E-67: Family Birth Chart Collection (Offline IndexedDB Vault)
                </h3>
                <p className="text-xs text-[#4A5568] dark:text-slate-400 mt-0.5">
                  Save parents, siblings, spouse, and children locally in your browser without requiring login or cloud keys.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <label className="text-[#6B5B3E] dark:text-slate-400">Relation:</label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0D1326]"
                >
                  <option>Mother</option>
                  <option>Father</option>
                  <option>Spouse</option>
                  <option>Child</option>
                  <option>Sibling</option>
                </select>
              </div>
            </div>
            <BirthInputForm
              compact
              initialValue={familyInput}
              submitLabel="Save Member to Family Vault"
              onSubmit={handleAddFamilyMember}
            />
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
            <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#C59326]" />
              Saved Family Charts ({familyList.length})
            </h3>
            {familyList.length === 0 ? (
              <p className="text-xs text-[#4A5568] dark:text-slate-400">
                No family member charts saved yet. Use the form above to add a family member offline.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {familyList.map((m) => (
                  <div key={m.id} className="rounded-lg border border-[#E7DEC8] dark:border-slate-800 p-4 space-y-1.5 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono uppercase text-[10px] text-[#9A6D12] dark:text-amber-400">{m.relation}</p>
                        <p className="font-semibold text-sm text-[#0D1B3E] dark:text-white">{m.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteFamilyMemberOffline(m.id);
                          await refreshFamily();
                        }}
                        aria-label={`Remove ${m.name}`}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-mono text-slate-500">
                      {m.birthDate} · {m.birthTime} · {m.placeName}
                    </p>
                    <p className="text-[#1E293B] dark:text-slate-300">
                      Lagna: <strong>{m.lagna}</strong> · Moon: <strong>{m.moonSign}</strong> ({m.nakshatra})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'child-num' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* E-68: Child Birth Nakshatra Analysis */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white">
              E-68: Child Birth Nakshatra &amp; Naming Syllable Analysis
            </h3>
            <BirthInputForm
              compact
              initialValue={childInput}
              submitLabel="Analyze Child Nakshatra"
              onSubmit={(inp) => {
                setChildInput(inp);
                setChildKundli(calculateKundli(inp));
              }}
            />
            <div className="rounded-lg bg-[#F7F2E4]/70 dark:bg-[#0D1326] border border-[#E7DEC8] dark:border-slate-800 p-4 space-y-2 text-xs">
              <p className="font-display text-lg font-bold text-[#0D1B3E] dark:text-white">
                {childNak.nakshatra} ({childNak.hindiName}) — Pada {childNak.pada}
              </p>
              <p>
                Primary Naming Syllable: <strong className="text-[#9A6D12] dark:text-amber-400 text-sm">{childNak.namingSyllable}</strong> · All 4 Pada Syllables: {childNak.allFourSyllables.join(', ')}
              </p>
              <p>
                Deity: {childNak.deity} · Lord: {childNak.nakshatraLord} · Gana: {childNak.gana} · Yoni: {childNak.yoni} · Nadi: {childNak.nadi}
              </p>
              <p className={childNak.isGandmool ? 'text-amber-700 dark:text-amber-300 font-medium' : 'text-emerald-700 dark:text-emerald-300'}>
                {childNak.gandmoolNote}
              </p>
            </div>
          </div>

          {/* E-69: Family Name Numerology Explorer */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <h3 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white">
              E-69: Family Name Numerology Explorer (Pythagorean &amp; Chaldean)
            </h3>
            <div>
              <label className="block text-xs text-[#6B5B3E] dark:text-slate-400 mb-1">
                Shared Family Surname / House Name
              </label>
              <input
                type="text"
                value={familySurname}
                onChange={(e) => setFamilySurname(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0D1326]"
                placeholder="Enter family surname"
              />
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: `Bride (${brideNum.fullName})`, data: brideNum },
                { label: `Groom (${groomNum.fullName})`, data: groomNum },
                { label: `Child + Family Name (${familyNum.fullName})`, data: familyNum },
              ].map((row) => (
                <div key={row.label} className="p-3.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0D1B3E] dark:text-white">{row.label}</span>
                    <span className="font-mono text-[#9A6D12] dark:text-amber-400">{row.data.rulingPlanet}</span>
                  </div>
                  <p className="font-mono text-[#4A5568] dark:text-slate-400">
                    Life Path #{row.data.lifePathNumber} · Destiny #{row.data.destinyNumber} · Soul Urge #{row.data.soulUrgeNumber} · Chaldean #{row.data.chaldeanNameNumber}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

