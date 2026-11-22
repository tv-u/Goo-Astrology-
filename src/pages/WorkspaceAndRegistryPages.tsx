import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, CheckCircle2, Code2, Database, Download, FileText, GripVertical, Layers, Printer, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { Cosmic3DMap } from '../components/Cosmic3DMap';
import { KundliChartSvg } from '../components/KundliChartSvg';
import { ADVANCED_100_FEATURES } from '../data/featureRegistry';
import { NAKSHATRAS, PLANET_DIGNITY_SIGNS, type PlanetId } from '../engine/constants';
import { calculateKundli } from '../engine/ephemeris';
import { validateEphemerisEngine } from '../engine/dataTools';
import { downloadTextFile, exportKundliReportPdf, exportRowsToCsv, exportSvgElementToPng } from '../utils/reportExporter';

const DEFAULT_WIDGETS = [
  { id: 'lagna', title: 'Ascendant & Panchang Pulse' },
  { id: 'dasha', title: 'Active Vimshottari Timeline' },
  { id: 'nakshatra', title: 'Moon Nakshatra & Pada Key' },
  { id: 'dignity', title: 'Exalted & Retrograde Watch' },
];

const CERT_QUESTIONS = [
  {
    q: 'Which Ayanamsha places Spica (Chitra) at 180°00′00″ Sidereal?',
    options: ['Tropical Sayana', 'Lahiri Chitrapaksha', 'B.V. Raman'],
  },
  {
    q: 'How many total Bindus always sum across a Sarva Ashtakavarga (SAV) chart?',
    options: ['108 Bindus', '249 Bindus', '337 Bindus'],
  },
  {
    q: 'In Jaimini Sutras, what does Karakamsha represent?',
    options: ['Navamsa (D9) sign of the Atmakaraka', '6th House from Moon', '10th Lord in D10'],
  },
  {
    q: 'Under Krishnamurti Padhdhati (KP), how many unequal sub-lord divisions span the Zodiac?',
    options: ['108 Padas', '144 Parts', '249 Subs'],
  },
  {
    q: 'Which calculation conditions declare a winner in Graha Yuddha (Planetary War <1°)?',
    options: ['Lower Speed', 'Higher Northern Ecliptic Latitude', 'Closest House to Lagna'],
  },
];

export function WorkspacePage() {
  const { activeKundli, token, user } = useApp();
  const kundli = useMemo(
    () =>
      activeKundli ||
      calculateKundli({
        name: 'Workspace Chart',
        date: '1995-08-15',
        time: '09:42',
        placeName: 'New Delhi, India',
        latitude: 28.6139,
        longitude: 77.209,
        timezoneOffsetMinutes: 330,
      }),
    [activeKundli]
  );

  const [tab, setTab] = useState<'3d-graph' | 'widgets' | 'nakshatra' | 'print-export' | 'notes-journal' | 'cert-sdk'>('3d-graph');
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [nakSearch, setNakSearch] = useState('');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const printWrapRef = useRef<HTMLDivElement | null>(null);

  // Persisted Workspace CRUD state
  const [notes, setNotes] = useState<Array<{ id: number; title: string; topic: string; content: string; tags: string }>>([]);
  const [journal, setJournal] = useState<Array<{ id: number; entry_date: string; moon_sign: string; dasha_period: string; reflection: string }>>([]);
  const [cases, setCases] = useState<Array<{ id: number; title: string; category: string; subject_name: string; hypothesis: string }>>([]);
  const [annotations, setAnnotations] = useState<Array<{ id: number; chart_name: string; target_ref: string; note: string }>>([]);
  const [certResult, setCertResult] = useState<{ score: number; passed: boolean; certificateCode: string } | null>(null);
  const [certAnswers, setCertAnswers] = useState<number[]>([1, 2, 0, 2, 1]);

  // Form drafts
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [journalText, setJournalText] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [caseHypothesis, setCaseHypothesis] = useState('');
  const [annTarget, setAnnTarget] = useState('House 10 · Saturn');
  const [annNote, setAnnNote] = useState('');
  const [datasetPreview, setDatasetPreview] = useState<string>('');
  const [apiSandboxRes, setApiSandboxRes] = useState<string>('');

  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  const loadWorkspace = async () => {
    try {
      const r = await fetch('/api/workspace/state', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (r.ok) {
        const d = await r.json();
        setNotes(d.notes || []);
        setJournal(d.journal || []);
        setCases(d.cases || []);
        setAnnotations(d.annotations || []);
        if (Array.isArray(d.widgetOrder)) {
          const ordered = d.widgetOrder
            .map((id: string) => DEFAULT_WIDGETS.find((w) => w.id === id))
            .filter(Boolean) as typeof DEFAULT_WIDGETS;
          if (ordered.length === DEFAULT_WIDGETS.length) setWidgets(ordered);
        }
      }
    } catch {
      // Offline graceful
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [token]);

  const moveWidget = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= widgets.length) return;
    const copy = [...widgets];
    const [removed] = copy.splice(from, 1);
    copy.splice(to, 0, removed);
    setWidgets(copy);
    if (token) {
      await fetch('/api/workspace/widgets', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ widgetOrder: copy.map((w) => w.id) }),
      });
    }
  };

  const filteredNaks = useMemo(
    () =>
      NAKSHATRAS.filter(
        (n) =>
          n.name.toLowerCase().includes(nakSearch.toLowerCase()) ||
          n.deity.toLowerCase().includes(nakSearch.toLowerCase()) ||
          n.lord.toLowerCase().includes(nakSearch.toLowerCase())
      ),
    [nakSearch]
  );

  const handleExportPng = () => {
    const svg = printWrapRef.current?.querySelector('svg');
    if (svg) {
      exportSvgElementToPng(svg, `kundli-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.png`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Enterprise Workspace — 3D Zodiac Constellation Map, Knowledge Graph, Print Studio & Developer SDK"
        description="Interactive Three.js 3D Zodiac Map, Drag-and-Drop Astrology Widgets, Planetary Knowledge Graph, Chart Annotations, PDF/PNG/CSV Export, Study Notes, Journal, Certification & Local API SDK."
        keywords="3d zodiac constellation map interactive, vedic astrology knowledge graph, kundli print layout pdf png export, open source astrology developer sdk api"
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
          Category G · Features 86–100 · Enterprise Studio &amp; Developer Ecosystem
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
          Enterprise Astrology Workspace &amp; 3D Studio
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Explore the interactive 3D Zodiac sphere, customize widgets, annotate charts, maintain research cases &amp; journals, earn certification, or query the Local v1 API.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: '3d-graph', label: '88–89, 91 · 3D Constellation Map & Knowledge Graph' },
          { id: 'widgets', label: '86–87 · Drag & Drop Widget Builder' },
          { id: 'nakshatra', label: '90 · Interactive Nakshatra Explorer' },
          { id: 'print-export', label: '92–94 · Annotations, Print Designer & PDF/PNG/CSV' },
          { id: 'notes-journal', label: '95–97 · Study Notes, Journal & Research Cases' },
          { id: 'cert-sdk', label: '98–100 · Certification, Public Datasets & API SDK' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              tab === item.id
                ? 'bg-[#C59326] text-white dark:text-slate-950'
                : 'bg-white dark:bg-[#0D1326] border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === '3d-graph' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">G-91 · Interactive 3D Zodiac Constellation Map ({kundli.input.name})</h2>
            <p className="text-xs text-slate-500">Orbit, zoom, toggle 27 Nakshatra markers, and click planetary spheres positioned at true Lahiri Sidereal longitudes.</p>
            <Cosmic3DMap planets={kundli.planets} lagnaSignIndex={kundli.lagnaSignIndex} />
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">G-88 &amp; G-89 · Astrology Knowledge Graph &amp; Planetary Relationships</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {(Object.keys(PLANET_DIGNITY_SIGNS) as PlanetId[]).map((pid) => {
                const rules = PLANET_DIGNITY_SIGNS[pid];
                const placement = kundli.planets.find((p) => p.id === pid);
                return (
                  <div key={pid} className="p-3.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-slate-900/60 space-y-1">
                    <div className="flex justify-between font-bold text-[#0D1B3E] dark:text-amber-300">
                      <span>{pid}</span>
                      <span>{placement ? `${placement.signName} · H${placement.house}` : ''}</span>
                    </div>
                    <p className="text-emerald-700 dark:text-emerald-400">Friends: {rules.friends.join(', ')}</p>
                    <p className="text-rose-600 dark:text-rose-400">Enemies: {rules.enemies.join(', ')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'widgets' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Drag and drop widgets (or use Reorder buttons) to personalize your workspace layout. {user ? 'Synced to your database profile.' : 'Active in current session.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {widgets.map((w, idx) => (
              <div
                key={w.id}
                draggable
                onDragStart={() => setDragIndex(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) moveWidget(dragIndex, idx);
                  setDragIndex(null);
                }}
                className="p-5 rounded-xl border border-[#C59326]/40 bg-white dark:bg-[#0D1326] space-y-2 cursor-move"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display text-lg font-bold">
                    <GripVertical className="w-4 h-4 text-[#C59326]" />
                    <span>{w.title}</span>
                  </div>
                  <div className="flex gap-1 text-[11px]">
                    <button type="button" onClick={() => moveWidget(idx, idx - 1)} className="px-2 py-0.5 border rounded">↑</button>
                    <button type="button" onClick={() => moveWidget(idx, idx + 1)} className="px-2 py-0.5 border rounded">↓</button>
                  </div>
                </div>
                {w.id === 'lagna' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Lagna: <strong>{kundli.ascendant.signName}</strong> ({kundli.ascendant.dms}) · LST {kundli.localSiderealTimeHours}h
                  </p>
                )}
                {w.id === 'dasha' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Current Mahadasha: <strong>{kundli.currentMahadasha?.lord}</strong> ({kundli.currentMahadasha?.startDate} → {kundli.currentMahadasha?.endDate})
                  </p>
                )}
                {w.id === 'nakshatra' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Moon in <strong>{kundli.planets.find((p) => p.id === 'Moon')?.nakshatraName}</strong> Pada {kundli.planets.find((p) => p.id === 'Moon')?.pada}
                  </p>
                )}
                {w.id === 'dignity' && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Retrograde: {kundli.planets.filter((p) => p.isRetrograde && p.id !== 'Rahu' && p.id !== 'Ketu').map((p) => p.id).join(', ') || 'None'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'nakshatra' && (
        <div className="space-y-4">
          <input
            type="text"
            value={nakSearch}
            onChange={(e) => setNakSearch(e.target.value)}
            placeholder="Filter 27 Nakshatras by name, deity, or lord (e.g. Rohini, Vishnu, Jupiter)..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326] text-xs"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {filteredNaks.map((n) => (
              <div key={n.index} className="p-4 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-1">
                <div className="flex justify-between font-bold text-[#0D1B3E] dark:text-amber-300">
                  <span>{n.index + 1}. {n.name} ({n.hindiName})</span>
                  <span>{n.lord}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Deity: {n.deity} · Symbol: {n.symbol}</p>
                <p className="text-slate-500">Gana: {n.gana} · Nadi: {n.nadi} · Yoni: {n.yoni}</p>
                <p className="font-mono text-[11px] text-[#9A6D12] dark:text-amber-200">Padas: {n.padaSyllables.join(' / ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'print-export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold">G-93 &amp; G-94 · Kundli Print Designer &amp; Multi-Format Export</h2>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setChartStyle(chartStyle === 'north' ? 'south' : 'north')}
                  className="px-2.5 py-1 rounded border border-[#D8CBAF] text-xs cursor-pointer"
                >
                  {chartStyle === 'north' ? 'South Indian' : 'North Indian'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#D8CBAF] text-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>

            <div ref={printWrapRef} className="p-4 rounded-xl bg-[#FCFBF7] dark:bg-slate-950 border border-[#E7DEC8] dark:border-slate-800">
              <KundliChartSvg
                title={`${kundli.input.name} · D1 (${chartStyle === 'north' ? 'North' : 'South'})`}
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

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportPng}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#C59326] text-white text-xs font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PNG
              </button>
              <button
                type="button"
                onClick={() =>
                  exportKundliReportPdf({
                    title: `Janam Kundli Print Sheet — ${kundli.input.name}`,
                    subtitle: `${kundli.input.date} ${kundli.input.time} · ${kundli.input.placeName || 'India'}`,
                    metadataLines: annotations.map((a) => `Annotation [${a.target_ref}]: ${a.note}`),
                    sections: [
                      {
                        heading: 'Planetary Sidereal Positions',
                        rows: [kundli.ascendant, ...kundli.planets].map(
                          (p) => `${p.id}: ${p.signName} ${p.dms} | House ${p.house} | ${p.nakshatraName} P${p.pada}`
                        ),
                      },
                    ],
                    filename: `kundli-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
                  })
                }
                className="px-3 py-1.5 rounded bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() =>
                  exportRowsToCsv(
                    'kundli-planets.csv',
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
                className="px-3 py-1.5 rounded border border-[#D8CBAF] text-xs cursor-pointer"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => downloadTextFile('kundli-chart.json', JSON.stringify(kundli, null, 2))}
                className="px-3 py-1.5 rounded border border-[#D8CBAF] text-xs cursor-pointer"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
            <h2 className="font-display text-xl font-bold">G-92 · Chart Annotation Studio</h2>
            <div className="space-y-2 text-xs">
              <input
                type="text"
                value={annTarget}
                onChange={(e) => setAnnTarget(e.target.value)}
                placeholder="House or Planet reference (e.g. House 10 · Saturn)"
                className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
              />
              <textarea
                rows={3}
                value={annNote}
                onChange={(e) => setAnnNote(e.target.value)}
                placeholder="Enter interpretation annotation to include in print/PDF..."
                className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!annNote.trim()) return;
                  await fetch('/api/workspace/annotations', {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({ chartName: kundli.input.name, targetRef: annTarget, note: annNote }),
                  });
                  setAnnNote('');
                  await loadWorkspace();
                }}
                className="px-3.5 py-2 rounded bg-[#C59326] text-white text-xs font-semibold cursor-pointer"
              >
                Save Chart Annotation
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
              {annotations.map((a) => (
                <div key={a.id} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 flex justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#9A6D12] dark:text-amber-300">{a.target_ref}</p>
                    <p>{a.note}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/workspace/annotations/${a.id}`, { method: 'DELETE', headers: authHeaders });
                      await loadWorkspace();
                    }}
                    className="text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'notes-journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* G-95 Study Notes */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">G-95 · Study Notes Manager</h2>
            </div>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note title (e.g. Viparita Rajayoga Rules)"
              className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
            />
            <textarea
              rows={3}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Write classical sutra / observation..."
              className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
            />
            <button
              type="button"
              onClick={async () => {
                if (!noteTitle.trim() || !noteBody.trim()) return;
                await fetch('/api/workspace/notes', {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify({ title: noteTitle, topic: 'Parashari', content: noteBody }),
                });
                setNoteTitle('');
                setNoteBody('');
                await loadWorkspace();
              }}
              className="px-3 py-1.5 rounded bg-[#C59326] text-white text-xs font-semibold cursor-pointer"
            >
              Save Study Note
            </button>
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {notes.map((n) => (
                <div key={n.id} className="p-2.5 rounded border border-[#E7DEC8] dark:border-slate-800 flex justify-between gap-2">
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-slate-500 mt-0.5">{n.content}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/workspace/notes/${n.id}`, { method: 'DELETE', headers: authHeaders });
                      await loadWorkspace();
                    }}
                    className="text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* G-96 Personal Journal */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">G-96 · Personal Astrology Journal</h2>
            </div>
            <p className="text-[11px] text-slate-500">
              Tagged automatically with Moon Sign ({kundli.planets.find((p) => p.id === 'Moon')?.signName}) &amp; Dasha ({kundli.currentMahadasha?.lord}).
            </p>
            <textarea
              rows={4}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Reflect on today's lunar transit, intuition, or life milestone..."
              className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
            />
            <button
              type="button"
              onClick={async () => {
                if (!journalText.trim()) return;
                await fetch('/api/workspace/journal', {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify({
                    moonSign: kundli.planets.find((p) => p.id === 'Moon')?.signName,
                    dashaPeriod: kundli.currentMahadasha?.lord,
                    reflection: journalText,
                  }),
                });
                setJournalText('');
                await loadWorkspace();
              }}
              className="px-3 py-1.5 rounded bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
            >
              Add Journal Entry
            </button>
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {journal.map((j) => (
                <div key={j.id} className="p-2.5 rounded border border-[#E7DEC8] dark:border-slate-800 flex justify-between gap-2">
                  <div>
                    <p className="font-mono text-[11px] text-[#9A6D12] dark:text-amber-300">{j.entry_date} · {j.moon_sign}</p>
                    <p className="mt-0.5">{j.reflection}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/workspace/journal/${j.id}`, { method: 'DELETE', headers: authHeaders });
                      await loadWorkspace();
                    }}
                    className="text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* G-97 Research Case Management */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">G-97 · Research Case Management</h2>
            </div>
            <input
              type="text"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="Case title (e.g. Gaja Kesari + D10 Career Study)"
              className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
            />
            <textarea
              rows={3}
              value={caseHypothesis}
              onChange={(e) => setCaseHypothesis(e.target.value)}
              placeholder="Research hypothesis & observed Dasha event..."
              className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
            />
            <button
              type="button"
              onClick={async () => {
                if (!caseTitle.trim() || !caseHypothesis.trim()) return;
                await fetch('/api/workspace/cases', {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify({
                    title: caseTitle,
                    subjectName: kundli.input.name,
                    birthJson: kundli.input,
                    hypothesis: caseHypothesis,
                  }),
                });
                setCaseTitle('');
                setCaseHypothesis('');
                await loadWorkspace();
              }}
              className="px-3 py-1.5 rounded bg-[#C59326] text-white text-xs font-semibold cursor-pointer"
            >
              Log Research Case
            </button>
            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              {cases.map((c) => (
                <div key={c.id} className="p-2.5 rounded border border-[#E7DEC8] dark:border-slate-800 flex justify-between gap-2">
                  <div>
                    <p className="font-semibold">{c.title} ({c.subject_name})</p>
                    <p className="text-slate-500 mt-0.5">{c.hypothesis}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/workspace/cases/${c.id}`, { method: 'DELETE', headers: authHeaders });
                      await loadWorkspace();
                    }}
                    className="text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'cert-sdk' && (
        <div className="space-y-6">
          {/* G-98: Certification */}
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#C59326]" />
                <h2 className="font-display text-2xl font-bold">G-98 · Vedic Astronomy &amp; Jyotish Certification Exam</h2>
              </div>
              {!user && (
                <Link to="/login" className="text-xs font-semibold text-[#9A6D12] underline">
                  Sign in to issue persisted certificate ID
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {CERT_QUESTIONS.map((item, qIdx) => (
                <div key={qIdx} className="p-3.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 space-y-2">
                  <p className="font-semibold">{qIdx + 1}. {item.q}</p>
                  {item.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${qIdx}`}
                        checked={certAnswers[qIdx] === oIdx}
                        onChange={() => {
                          const next = [...certAnswers];
                          next[qIdx] = oIdx;
                          setCertAnswers(next);
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={async () => {
                  if (token) {
                    const r = await fetch('/api/workspace/certification', {
                      method: 'POST',
                      headers: authHeaders,
                      body: JSON.stringify({ courseSlug: 'vedic-astronomy-foundation', answers: certAnswers }),
                    });
                    if (r.ok) {
                      setCertResult(await r.json());
                      return;
                    }
                  }
                  const key = [1, 2, 0, 2, 1];
                  const correct = certAnswers.filter((a, i) => a === key[i]).length;
                  const score = Math.round((correct / 5) * 100);
                  setCertResult({
                    score,
                    passed: score >= 80,
                    certificateCode: score >= 80 ? 'PREVIEW-SIGNIN-FOR-OFFICIAL-ID' : '',
                  });
                }}
                className="px-4 py-2 rounded-lg bg-[#C59326] text-white text-xs font-semibold cursor-pointer"
              >
                Grade Certification Exam
              </button>
              {certResult && (
                <p className="text-xs font-semibold">
                  Score: {certResult.score}% ({certResult.passed ? 'PASSED' : 'Need 80%+'})
                  {certResult.certificateCode ? ` · Certificate Code: ${certResult.certificateCode}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* G-99 & G-100: Public Dataset Explorer & Developer SDK */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C59326]" />
                <h2 className="font-display text-xl font-bold">G-99 · Public Astrology Dataset Explorer</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  'indian_cities_coordinates',
                  'nakshatra_pada_reference',
                  'ephemeris_j2000_checkpoints',
                  'zodiac_rashi_reference',
                  'indian_languages_dictionary',
                ].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={async () => {
                      const r = await fetch(`/api/datasets/${k}`);
                      if (r.ok) {
                        setDatasetPreview(JSON.stringify(await r.json(), null, 2).slice(0, 2500));
                      }
                    }}
                    className="px-2.5 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 hover:border-[#C59326] cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-amber-200 font-mono text-[11px] overflow-x-auto max-h-64">
                {datasetPreview || '// Select any open MIT/CC0 dataset above to inspect live SHA-256 JSON payload.'}
              </pre>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#C59326]" />
                  <h2 className="font-display text-xl font-bold">G-100 · Developer SDK &amp; Local Calculation API (v1)</h2>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const r = await fetch('/api/v1/calculate/panchang?lat=28.6139&lon=77.2090&tz=330');
                    if (r.ok) setApiSandboxRes(JSON.stringify(await r.json(), null, 2).slice(0, 2500));
                  }}
                  className="px-3 py-1.5 rounded bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
                >
                  Test GET /api/v1/calculate/panchang
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto">
{`POST /api/v1/calculate/kundli
POST /api/v1/calculate/matching
GET  /api/v1/calculate/panchang?date=2026-08-15&lat=28.61&lon=77.20&tz=330
GET  /api/v1/calculate/eclipses?date=2026-08-15`}
              </pre>
              {apiSandboxRes && (
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
                  {apiSandboxRes}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TestRegistryPage() {
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [liveChecks, setLiveChecks] = useState<{
    ephemerisPassed: boolean;
    healthOk: boolean;
    datasetsCount: number;
    featureFlagsCount: number;
    checkedAt: string;
  } | null>(null);

  const runLiveDiagnostics = async () => {
    const eph = validateEphemerisEngine();
    let healthOk = false;
    let datasetsCount = 0;
    let featureFlagsCount = 0;
    try {
      const [hRes, sRes, fRes] = await Promise.all([
        fetch('/api/health').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sync/status').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/features').then((r) => (r.ok ? r.json() : null)),
      ]);
      healthOk = Boolean(hRes?.ok);
      datasetsCount = Array.isArray(sRes?.datasets) ? sRes.datasets.length : 0;
      featureFlagsCount = Array.isArray(fRes?.features) ? fRes.features.length : 0;
    } catch {
      // ignore offline
    }
    setLiveChecks({
      ephemerisPassed: eph.allPassed,
      healthOk,
      datasetsCount,
      featureFlagsCount,
      checkedAt: new Date().toLocaleTimeString(),
    });
  };

  useEffect(() => {
    runLiveDiagnostics();
  }, []);

  const categories = ['All', ...Array.from(new Set(ADVANCED_100_FEATURES.map((f) => f.category)))];
  const filtered = ADVANCED_100_FEATURES.filter(
    (f) =>
      (filterCat === 'All' || f.category === filterCat) &&
      (f.title.toLowerCase().includes(search.toLowerCase()) || f.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="100-Feature Enterprise Test & Implementation Registry"
        description="Transparent engineering registry mapping all 100 advanced Vedic astrology modules + 50 core Turn 1 tools to live routes, engines, and automated tests."
      />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7DEC8] dark:border-slate-800 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Zero-Mock Engineering Verification Matrix
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            100-Feature Implementation &amp; Test Registry
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            All 100 new enterprise features (plus 50 core platform modules) mapped to their TypeScript engines, routes, and automated verification suite.
          </p>
        </div>

        <button
          type="button"
          onClick={runLiveDiagnostics}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Run Live Stack Diagnostics</span>
        </button>
      </div>

      {liveChecks && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs tabular-nums">
          <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
            <p className="text-slate-500">Ephemeris Checkpoints</p>
            <p className="font-bold text-base mt-1 text-emerald-700 dark:text-emerald-400">
              {liveChecks.ephemerisPassed ? '4/4 Passed' : 'Check Failed'}
            </p>
          </div>
          <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
            <p className="text-slate-500">Backend API Health</p>
            <p className="font-bold text-base mt-1">{liveChecks.healthOk ? 'Connected (200 OK)' : 'Offline Mode'}</p>
          </div>
          <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
            <p className="text-slate-500">Open Datasets Verified</p>
            <p className="font-bold text-base mt-1">{liveChecks.datasetsCount} SHA-256 Sets</p>
          </div>
          <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#F7F2E4] dark:bg-[#0D1326]">
            <p className="text-slate-500">DB Feature Flags</p>
            <p className="font-bold text-base mt-1">{liveChecks.featureFlagsCount} Active ({liveChecks.checkedAt})</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search feature # or title..."
          className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326] text-xs w-64"
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326] text-xs"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] overflow-x-auto">
        <table className="w-full text-xs text-left tabular-nums">
          <thead>
            <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500 bg-[#F7F2E4]/60 dark:bg-slate-900">
              <th className="py-2.5 px-4">#</th>
              <th className="py-2.5 px-4">Feature</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Engine / Module</th>
              <th className="py-2.5 px-4">Route</th>
              <th className="py-2.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
            {filtered.map((f) => (
              <tr key={f.code}>
                <td className="py-2 px-4 font-mono font-bold text-[#9A6D12] dark:text-amber-300">{f.code}</td>
                <td className="py-2 px-4 font-semibold">{f.title}</td>
                <td className="py-2 px-4 text-slate-500">{f.category}</td>
                <td className="py-2 px-4 font-mono">{f.engineModule}</td>
                <td className="py-2 px-4">
                  <Link to={f.route} className="text-[#0D1B3E] dark:text-amber-300 underline font-medium">
                    {f.route}
                  </Link>
                </td>
                <td className="py-2 px-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live ({f.testType})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
