import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Download,
  FileText,
  Globe2,
  MapPin,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { KundliChartSvg } from '../components/KundliChartSvg';
import { CITIES_DATASET, type CityRecord } from '../data/cities';
import {
  INDIA_STATES_AND_UTS,
  findNearestVerifiedCity,
  getIndiaLocationCoverageSummary,
  resolveIndiaLocation,
} from '../data/indiaLocations';
import { calculateKundli } from '../engine/ephemeris';
import { calculateAshtakavarga, calculateShadbalaAndAvasthas } from '../engine/vedicResearch';
import { analyzeDoshasAndYogas } from '../engine/doshaYoga';
import {
  ACADEMY_CURRICULUM,
  gradeAcademyQuiz,
  runReferenceVerificationSuite,
} from '../engine/academyAndVerification';
import {
  auditMultilingualCompleteness,
  searchVedicGlossary,
} from '../engine/i18nKnowledge';
import {
  buildUnicodePrintableHtml,
  containsNonLatinScript,
  downloadTextFile,
  exportKundliReportPdf,
  exportRowsToCsv,
  exportSvgElementToPng,
} from '../utils/reportExporter';

export function IndiaLocationIntelligencePage() {
  const { setActiveKundli, locale } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'All' | 'State' | 'Union Territory'>('All');
  const [traditionFilter, setTraditionFilter] = useState<string>('All');
  const [probeLat, setProbeLat] = useState(25.3176);
  const [probeLon, setProbeLon] = useState(82.9739);

  const coverage = useMemo(() => getIndiaLocationCoverageSummary(), []);
  const resolution = useMemo(() => resolveIndiaLocation(query), [query]);
  const nearest = useMemo(() => findNearestVerifiedCity(probeLat, probeLon), [probeLat, probeLon]);

  const filteredStates = useMemo(
    () =>
      INDIA_STATES_AND_UTS.filter(
        (s) =>
          (regionFilter === 'All' || s.type === regionFilter) &&
          (traditionFilter === 'All' || s.panchangTradition === traditionFilter)
      ),
    [regionFilter, traditionFilter]
  );

  const launchKundliForCity = (c: CityRecord) => {
    const k = calculateKundli({
      name: `${c.city} Birth Chart`,
      date: '1995-08-15',
      time: '12:00',
      latitude: c.latitude,
      longitude: c.longitude,
      timezoneOffsetMinutes: c.timezoneOffsetMinutes,
      timezoneName: c.timezoneName,
      placeName: `${c.city}, ${c.state}, ${c.country}`,
      ayanamsha: 'lahiri',
    });
    setActiveKundli(k);
    navigate('/free-kundli');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title={`${locale.indiaLocations} — 28 States, 8 Union Territories & Vedic Gazetteer`}
        description="Complete India Astrology Location Intelligence covering all 28 States, 8 Union Territories, historical city aliases, ambiguity disambiguation, and IST coordinates."
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Domain H · India Location Intelligence (H-101 – H-120)
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            All-India Location Intelligence &amp; Coordinate Gazetteer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Verified coordinates across all 28 States &amp; 8 Union Territories, historical city name aliases, and Haversine nearest-station resolver.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              exportRowsToCsv(
                'india-states-uts.csv',
                INDIA_STATES_AND_UTS.map((s) => ({ ...s, primaryLanguages: s.primaryLanguages.join('|') }))
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export States CSV
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile('india-cities-gazetteer.json', JSON.stringify(CITIES_DATASET, null, 2))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export Cities JSON
          </button>
        </div>
      </div>

      {/* Coverage Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs tabular-nums">
        <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
          <p className="text-slate-500">States &amp; Union Territories</p>
          <p className="font-bold text-lg mt-1 text-[#0D1B3E] dark:text-amber-300">
            {coverage.totalStates} States + {coverage.totalUnionTerritories} UTs
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
          <p className="text-slate-500">Verified Indian Cities</p>
          <p className="font-bold text-lg mt-1 text-[#0D1B3E] dark:text-amber-300">
            {coverage.verifiedCitiesCount} Locations
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
          <p className="text-slate-500">Historical / Alt Aliases</p>
          <p className="font-bold text-lg mt-1 text-[#0D1B3E] dark:text-amber-300">
            {coverage.aliasesSupportedCount} Aliases Mapped
          </p>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/40 bg-white dark:bg-[#0D1326]">
          <p className="text-slate-500">640k Rural Village Census</p>
          <p className="font-semibold text-xs mt-1 text-amber-700 dark:text-amber-300">
            BLOCKED (External Shapefile Not Bundled)
          </p>
        </div>
      </div>

      {/* Search & Ambiguity Resolver + Nearest Station Probe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-[#C59326]" />
            City, District &amp; Historical Alias Resolver
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try Bombay, Kashi, Allahabad, Aurangabad, Madras, Leh..."
              className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
            />
          </div>
          <p className={`text-xs font-medium ${resolution.ambiguous ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'}`}>
            {resolution.notes}
          </p>
          <div className="max-h-64 overflow-y-auto divide-y divide-[#F3ECDC] dark:divide-slate-800">
            {resolution.matches.map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-[#0D1B3E] dark:text-slate-100">
                    {c.city} <span className="text-slate-500">({c.district}, {c.state})</span>
                  </p>
                  <p className="font-mono text-[11px] text-slate-500">
                    {c.latitude.toFixed(4)}° N, {c.longitude.toFixed(4)}° E · {c.timezoneName}
                    {c.aliases?.length ? ` · Aliases: ${c.aliases.join(', ')}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => launchKundliForCity(c)}
                  className="px-2.5 py-1 rounded bg-[#C59326] text-white font-semibold shrink-0 cursor-pointer"
                >
                  Open Kundli
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C59326]" />
            Haversine Nearest Observatory Station Resolver
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enter custom birth coordinates to validate India bounding box coverage and locate the nearest verified reference observatory.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="font-medium">Latitude (°N)</span>
              <input
                type="number"
                step="0.01"
                value={probeLat}
                onChange={(e) => setProbeLat(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent font-mono"
              />
            </label>
            <label className="space-y-1">
              <span className="font-medium">Longitude (°E)</span>
              <input
                type="number"
                step="0.01"
                value={probeLon}
                onChange={(e) => setProbeLon(Number(e.target.value))}
                className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent font-mono"
              />
            </label>
          </div>
          <div className="p-4 rounded-lg border border-[#C59326]/30 bg-[#FCFBF7] dark:bg-slate-900/60 text-xs space-y-1.5">
            <p className="font-bold text-[#0D1B3E] dark:text-amber-300">
              Nearest Station: {nearest.city.city}, {nearest.city.state}
            </p>
            <p className="font-mono text-slate-600 dark:text-slate-300">
              Haversine Distance: {nearest.distanceKm} km · India Bounds:{' '}
              {nearest.withinIndiaBoundingBox ? 'Inside Indian Observatory Region' : 'Outside India Bounds'}
            </p>
          </div>
        </div>
      </div>

      {/* 28 States + 8 UTs Complete Directory */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">
            Complete 28 States &amp; 8 Union Territories Regional Panchang Directory
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value as typeof regionFilter)}
              className="px-3 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              <option value="All">All 36 Regions</option>
              <option value="State">28 States</option>
              <option value="Union Territory">8 Union Territories</option>
            </select>
            <select
              value={traditionFilter}
              onChange={(e) => setTraditionFilter(e.target.value)}
              className="px-3 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              <option value="All">All Calendar Traditions</option>
              <option value="Purnimanta (Lunar)">Purnimanta (Lunar)</option>
              <option value="Amanta (Lunar)">Amanta (Lunar)</option>
              <option value="Solar (Sankranti)">Solar (Sankranti)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {filteredStates.map((st) => (
            <div
              key={st.code}
              className="p-3.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-slate-900/50 space-y-1"
            >
              <div className="flex items-center justify-between font-bold text-[#0D1B3E] dark:text-amber-300">
                <span>{st.name}</span>
                <span className="font-mono text-[11px] text-slate-500">{st.code} · {st.type === 'State' ? 'State' : 'UT'}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">Capital: {st.capital}</p>
              <p className="text-slate-500">Tradition: {st.panchangTradition}</p>
              <p className="font-mono text-[11px] text-[#9A6D12] dark:text-amber-400">
                {st.latitude.toFixed(2)}°N, {st.longitude.toFixed(2)}°E · Langs: {st.primaryLanguages.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VedicAcademyAndGlossaryPage() {
  const { language, formatNumber, formatDate } = useApp();
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('goo_academy_completed');
      return saved ? JSON.parse(saved) : ['L-01'];
    } catch {
      return ['L-01'];
    }
  });
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryCat, setGlossaryCat] = useState('All');

  const toggleLessonComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('goo_academy_completed', JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      return next;
    });
  };

  const quizScore = useMemo(() => gradeAcademyQuiz(quizAnswers), [quizAnswers]);
  const glossaryResults = useMemo(() => searchVedicGlossary(glossaryQuery, glossaryCat), [glossaryQuery, glossaryCat]);
  const i18nAudit = useMemo(() => auditMultilingualCompleteness(), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Vedic Astrology Learning Academy & 12-Language Jyotish Glossary"
        description="Structured 12-module Vedic Jyotish curriculum with formulas, interactive quizzes, and 12-script Indian Astrology Glossary."
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Domains J &amp; L · Vedic Academy &amp; Multilingual Knowledge Base (J-141 – L-200)
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            Vedic Learning Academy &amp; 12-Language Knowledge Base
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Master Sidereal Jyotish mathematically from Rashis to KP Sub-Lords, and explore verified terminology across 12 Indian languages.
          </p>
        </div>
        <div className="p-3 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326] text-xs tabular-nums">
          <span className="text-slate-500">Progress: </span>
          <strong className="text-[#0D1B3E] dark:text-amber-300">
            {completedIds.length} / {ACADEMY_CURRICULUM.length} Lessons
          </strong>
          <span className="mx-2">·</span>
          <span className="text-slate-500">Quiz: </span>
          <strong className="text-emerald-700 dark:text-emerald-400">
            {quizScore.correct}/{quizScore.total} ({quizScore.scorePct}%) — {quizScore.levelBadge}
          </strong>
        </div>
      </div>

      {/* 12 Structured Academy Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ACADEMY_CURRICULUM.map((lesson) => {
          const isDone = completedIds.includes(lesson.id);
          const picked = quizAnswers[lesson.id];
          const answered = typeof picked === 'number';
          const isRight = answered && picked === lesson.correctOptionIndex;

          return (
            <div
              key={lesson.id}
              className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#9A6D12] dark:text-amber-300">
                    {lesson.id} · {lesson.level} · {lesson.estimatedMinutes} min
                  </span>
                  <h2 className="font-display text-xl font-bold text-[#0D1B3E] dark:text-white mt-0.5">
                    {lesson.number}. {lesson.title}
                  </h2>
                  <p className="text-xs text-slate-500">{lesson.sanskritTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleLessonComplete(lesson.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'border border-[#D8CBAF] dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isDone ? 'Completed' : 'Mark Done'}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-[#FCFBF7] dark:bg-slate-900/70 border border-[#E7DEC8] dark:border-slate-800 font-mono text-[11px] text-[#0D1B3E] dark:text-amber-200">
                {lesson.keyFormulaOrRule}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{lesson.summary}</p>
              <p className="text-[11px] text-[#9A6D12] dark:text-amber-400">Practice: {lesson.practicePrompt}</p>

              {/* Self-check Quiz */}
              <div className="pt-2 border-t border-[#E7DEC8]/60 dark:border-slate-800 space-y-1.5 text-xs">
                <p className="font-semibold">{lesson.quizQuestion}</p>
                <div className="space-y-1">
                  {lesson.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`acad-${lesson.id}`}
                        checked={picked === idx}
                        onChange={() => setQuizAnswers((prev) => ({ ...prev, [lesson.id]: idx }))}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {answered && (
                  <p className={`text-[11px] font-semibold ${isRight ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {isRight ? 'Correct! Verified against Vedic formula.' : `Review formula above — correct choice is #${lesson.correctOptionIndex + 1}.`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Multilingual Glossary + Locale Formatting */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#C59326]" />
              12-Language Vedic Terminology Glossary &amp; Locale Formatter
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Locale Sample ({language}): Date {formatDate('2026-08-15')} · Lakh/Number {formatNumber(1254321)}
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <input
              type="text"
              value={glossaryQuery}
              onChange={(e) => setGlossaryQuery(e.target.value)}
              placeholder="Search Sanskrit, English or script..."
              className="px-3 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
            />
            <select
              value={glossaryCat}
              onChange={(e) => setGlossaryCat(e.target.value)}
              className="px-3 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            >
              {['All', 'Core', 'Panchang', 'Dasha', 'Divisional', 'Research'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {glossaryResults.map((term) => (
            <div key={term.id} className="p-4 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-slate-900/50 space-y-2">
              <div className="flex justify-between font-bold text-[#0D1B3E] dark:text-amber-300">
                <span>{term.english} ({term.sanskrit})</span>
                <span className="text-[11px] font-mono text-slate-500">{term.category}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{term.definition}</p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                {Object.entries(term.translations).map(([code, word]) => (
                  <span key={code} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-[#E7DEC8] dark:border-slate-700">
                    <strong>{code}:</strong> {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Programmatic 12-Language Completeness Audit */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto space-y-3">
        <h2 className="font-display text-xl font-bold">12-Language Localization Coverage Audit</h2>
        <table className="w-full text-xs text-left tabular-nums">
          <thead>
            <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
              <th className="py-2 pr-3">Code</th>
              <th className="py-2 pr-3">Language</th>
              <th className="py-2 pr-3">Script</th>
              <th className="py-2 pr-3">UI Dictionary</th>
              <th className="py-2">Glossary Terms</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
            {i18nAudit.map((row) => (
              <tr key={row.code}>
                <td className="py-2 pr-3 font-mono font-bold">{row.code}</td>
                <td className="py-2 pr-3">{row.nativeName} ({row.name})</td>
                <td className="py-2 pr-3">{row.script}</td>
                <td className="py-2 pr-3 font-semibold text-emerald-700 dark:text-emerald-400">
                  {row.uiKeysTranslated}/{row.uiKeysTotal} ({row.uiCoveragePct}%)
                </td>
                <td className="py-2">{row.glossaryTermsTranslated}/{row.glossaryTermsTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportStudioPage() {
  const { activeKundli } = useApp();
  const [chartStyle, setChartStyle] = useState<'north' | 'south' | 'east'>('north');
  const [includeDasha, setIncludeDasha] = useState(true);
  const [includeResearch, setIncludeResearch] = useState(true);
  const [includeDosha, setIncludeDosha] = useState(true);
  const [htmlPreview, setHtmlPreview] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const chartWrapRef = useRef<HTMLDivElement | null>(null);

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
        timezoneName: 'Asia/Kolkata',
        placeName: 'New Delhi, Delhi, India',
        ayanamsha: 'lahiri',
      }),
    [activeKundli]
  );

  const ashtakavarga = useMemo(() => calculateAshtakavarga(kundli), [kundli]);
  const shadbala = useMemo(() => calculateShadbalaAndAvasthas(kundli), [kundli]);
  const analysis = useMemo(() => analyzeDoshasAndYogas(kundli), [kundli]);

  const buildSpec = () => {
    const sections = [
      {
        heading: 'Sidereal Planetary Longitudes (D1)',
        rows: [kundli.ascendant, ...kundli.planets].map(
          (p) => `${p.id}: ${p.signName} (${p.hindiSign}) ${p.dms} | House ${p.house} | ${p.nakshatraName} P${p.pada} | ${p.dignity}`
        ),
      },
    ];
    if (includeDasha) {
      sections.push({
        heading: 'Vimshottari Mahadasha Sequence',
        rows: kundli.dashas.map((d) => `${d.lord} Mahadasha: ${d.startDate} to ${d.endDate} (${d.durationYears} yrs)`),
      });
    }
    if (includeDosha) {
      sections.push({
        heading: 'Dosha & Yoga Assessment',
        rows: [
          ...analysis.doshas.map((d) => `Dosha - ${d.name}: ${d.severity} (${d.summary})`),
          ...analysis.yogas.filter((y) => y.present).map((y) => `Yoga - ${y.name}: ${y.summary}`),
        ],
      });
    }
    if (includeResearch) {
      sections.push({
        heading: 'Sarva Ashtakavarga (Total 337) & Shadbala',
        rows: [
          `SAV 12-Sign Bindus: ${ashtakavarga.sarva.join(' | ')} (Sum = ${ashtakavarga.totalBindus})`,
          ...shadbala.map((s) => `${s.planet}: ${s.totalVirupas} Virupas (${s.totalRupas} Rupas)`),
        ],
      });
    }
    return {
      title: `Comprehensive Vedic Astrology Dossier — ${kundli.input.name}`,
      subtitle: `${kundli.input.date} ${kundli.input.time} · ${kundli.input.placeName || 'India'} · ${kundli.ayanamshaMode.toUpperCase()}`,
      metadataLines: [
        `Lagna: ${kundli.ascendant.signName} ${kundli.ascendant.dms} | Ayanamsha: ${kundli.ayanamshaDms}`,
        `Ephemeris: ${kundli.assumptions.ephemerisSource}`,
      ],
      sections,
      filename: `goo-astrology-dossier-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    };
  };

  const spec = buildSpec();
  const hasIndicChars = containsNonLatinScript(JSON.stringify(spec));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Report Studio — Kundli PDF, Unicode HTML, PNG Chart, CSV & JSON Exporter"
        description="Build multi-section Vedic Astrology dossiers with Lagna, D1-D60, Vimshottari Dasha, Ashtakavarga, Shadbala, PNG SVG capture, CSV, JSON, and Unicode HTML print."
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
          Domain K · Report Studio &amp; Document Engine (K-161 – K-180)
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
          Vedic Report Studio &amp; Multi-Format Export Center
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Compile print-ready Vedic dossiers for <strong>{kundli.input.name}</strong> in PDF, Unicode HTML, PNG, CSV, or JSON.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C59326]" /> Configure Report Sections
          </h2>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeDasha} onChange={(e) => setIncludeDasha(e.target.checked)} />
              <span>Include Vimshottari Mahadasha Timeline</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeDosha} onChange={(e) => setIncludeDosha(e.target.checked)} />
              <span>Include Classical Dosha &amp; Yoga Audit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeResearch} onChange={(e) => setIncludeResearch(e.target.checked)} />
              <span>Include SAV (337 Bindus) &amp; Shadbala</span>
            </label>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E7DEC8] dark:border-slate-800">
            <p className="text-xs font-semibold">Chart Style</p>
            <div className="flex gap-2 text-xs">
              {(['north', 'south', 'east'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setChartStyle(st)}
                  className={`px-3 py-1.5 rounded border capitalize cursor-pointer ${
                    chartStyle === st ? 'bg-[#C59326] text-white border-[#C59326]' : 'border-[#D8CBAF] dark:border-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                exportKundliReportPdf(spec);
                setStatusNote('Downloaded A4 PDF report (Latin/ASCII sanitized).');
              }}
              className="px-3.5 py-2 rounded-lg bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => {
                const html = buildUnicodePrintableHtml(spec);
                setHtmlPreview(html);
                setStatusNote('Generated Unicode HTML preview below (preserves Devanagari & all 12 scripts cleanly).');
              }}
              className="px-3.5 py-2 rounded-lg bg-[#C59326] text-white text-xs font-semibold cursor-pointer"
            >
              Unicode Print Preview
            </button>
            <button
              type="button"
              onClick={() => {
                const html = buildUnicodePrintableHtml(spec);
                downloadTextFile(`dossier-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.html`, html, 'text/html');
                setStatusNote('Downloaded Unicode HTML dossier.');
              }}
              className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs cursor-pointer"
            >
              HTML File
            </button>
            <button
              type="button"
              onClick={() => {
                const svg = chartWrapRef.current?.querySelector('svg');
                if (svg) exportSvgElementToPng(svg, `chart-${chartStyle}.png`);
              }}
              className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs cursor-pointer"
            >
              PNG Chart
            </button>
            <button
              type="button"
              onClick={() =>
                exportRowsToCsv(
                  'kundli-dossier-planets.csv',
                  [kundli.ascendant, ...kundli.planets].map((p) => ({
                    Body: p.id,
                    Sign: p.signName,
                    DMS: p.dms,
                    House: p.house,
                    Nakshatra: p.nakshatraName,
                    Pada: p.pada,
                    Dignity: p.dignity,
                  }))
                )
              }
              className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs cursor-pointer"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile('kundli-dossier.json', JSON.stringify(spec, null, 2))}
              className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs cursor-pointer"
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Browser Print
            </button>
          </div>

          {hasIndicChars && (
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Note: Report contains Devanagari/Indic characters. Use <strong>Unicode Print Preview / Browser Print</strong> to preserve native Indic glyphs without font loss; direct jsPDF download uses Latin sanitization.
            </p>
          )}
          {statusNote && <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{statusNote}</p>}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-5">
          <div ref={chartWrapRef} className="max-w-md mx-auto">
            <KundliChartSvg
              title={`${kundli.input.name} · D1 (${chartStyle})`}
              styleType={chartStyle}
              ascendantSignIndex={kundli.lagnaSignIndex}
              placements={[kundli.ascendant, ...kundli.planets].map((p) => ({
                id: p.id,
                signIndex: p.signIndex,
                signName: p.signName,
                house: p.house,
              }))}
            />
          </div>

          <div className="space-y-4 text-xs">
            {spec.sections.map((s) => (
              <div key={s.heading} className="p-4 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-slate-900/50">
                <h3 className="font-display text-lg font-bold text-[#0D1B3E] dark:text-amber-300 mb-2">{s.heading}</h3>
                <ul className="space-y-1 list-disc pl-4 text-slate-700 dark:text-slate-300">
                  {s.rows.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {htmlPreview && (
            <div className="space-y-2">
              <p className="text-xs font-semibold">Live Unicode Printable HTML Document Preview:</p>
              <iframe
                title="Unicode Dossier Preview"
                srcDoc={htmlPreview}
                className="w-full h-96 rounded-lg border border-[#C59326]/40 bg-[#FCFBF7]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VerificationCenterPage() {
  const [suite, setSuite] = useState(() => runReferenceVerificationSuite());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Astronomical Verification Center & Public Audit Hub"
        description="Live mathematical verification of Lahiri Chitrapaksha J2000.0, Vernal Equinox 2026, Sarva Ashtakavarga 337 Bindus, Vimshottari cycle, and Security Governance."
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Domains I, N &amp; Q · Reference Verification &amp; Public Data Center
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            Astronomical Verification &amp; Security Audit Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Re-run live mathematical invariants on the MIT Astronomy Engine, Lahiri precession formulas, and classical Vedic invariances.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSuite(runReferenceVerificationSuite())}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Re-Run 12-Point Benchmark
          </button>
          <Link
            to="/test-registry"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C59326] text-white text-xs font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            View 350-Module QA Registry
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs tabular-nums">
        <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
          <p className="text-slate-500">Verification Checks Passed</p>
          <p className="font-bold text-2xl mt-1 text-emerald-700 dark:text-emerald-400">
            {suite.passed} / {suite.total}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
          <p className="text-slate-500">Core Architecture</p>
          <p className="font-bold text-base mt-1 text-[#0D1B3E] dark:text-amber-300">
            100% Free-First Local Engine
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
          <p className="text-slate-500">Security &amp; RBAC Posture</p>
          <p className="font-bold text-base mt-1 text-[#0D1B3E] dark:text-amber-300">
            scrypt + HMAC-SHA256 + Zod + SQLite Prepared Stmts
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] overflow-x-auto">
        <table className="w-full text-xs text-left tabular-nums">
          <thead>
            <tr className="border-b border-[#E7DEC8] dark:border-slate-800 bg-[#F7F2E4]/70 dark:bg-slate-900 text-slate-500">
              <th className="py-2.5 px-4">ID</th>
              <th className="py-2.5 px-4">Invariant / Reference Check</th>
              <th className="py-2.5 px-4">Domain</th>
              <th className="py-2.5 px-4">Expected</th>
              <th className="py-2.5 px-4">Observed</th>
              <th className="py-2.5 px-4">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
            {suite.checks.map((c) => (
              <tr key={c.id}>
                <td className="py-2.5 px-4 font-mono font-bold text-[#9A6D12] dark:text-amber-300">{c.id}</td>
                <td className="py-2.5 px-4 font-semibold">{c.name}</td>
                <td className="py-2.5 px-4 text-slate-500">{c.domain}</td>
                <td className="py-2.5 px-4 font-mono">{c.expected}</td>
                <td className="py-2.5 px-4 font-mono">{c.observed}</td>
                <td className="py-2.5 px-4">
                  {c.passed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> FAILED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
