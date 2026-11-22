import React, { useEffect, useState } from 'react';
import { CheckCircle2, Database, Gauge, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli } from '../engine/ephemeris';
import {
  compareAyanamshaEngines,
  processBulkKundliCsv,
  resolveHistoricalTimezone,
  resolveLocationCoordinates,
  runBirthDataAudit,
  runCalculationBenchmark,
  validateEphemerisEngine,
  type BulkProfileRow,
} from '../engine/dataTools';
import {
  cacheDatasetOffline,
  clearAllOfflineStores,
  deleteOfflineKundli,
  getOfflineStorageSummary,
  listOfflineKundlis,
  saveKundliOffline,
} from '../utils/offlineDb';
import { downloadTextFile, exportRowsToCsv } from '../utils/reportExporter';

const SAMPLE_CSV = `name,date,time,place,latitude,longitude,timezoneOffsetMinutes
Aarav Sharma,1995-08-15,09:42,New Delhi,28.6139,77.2090,330
Priya Nair,1997-02-20,14:15,Kochi,9.9312,76.2673,330
Rohan Kulkarni,1992-11-04,06:10,Pune,18.5204,73.8567,330`;

export function DataToolsPage() {
  const { activeKundli } = useApp();
  const [ephemerisAudit, setEphemerisAudit] = useState(() => validateEphemerisEngine());
  const [cityQuery, setCityQuery] = useState('Varanasi');
  const [tzDate, setTzDate] = useState('1943-06-15');
  const [tzTime, setTzTime] = useState('14:00');
  const [tzZone, setTzZone] = useState('Asia/Kolkata');
  const [benchmark, setBenchmark] = useState<ReturnType<typeof runCalculationBenchmark> | null>(null);
  const [csvInput, setCsvInput] = useState(SAMPLE_CSV);
  const [bulkRows, setBulkRows] = useState<BulkProfileRow[]>(() => processBulkKundliCsv(SAMPLE_CSV));
  const [offlineSummary, setOfflineSummary] = useState({ kundlis: 0, panchang: 0, datasets: 0, familyCharts: 0 });
  const [offlineList, setOfflineList] = useState<Array<{ id: string; name: string; date: string; place: string }>>([]);
  const [syncOverview, setSyncOverview] = useState<{
    sources: Array<{ slug: string; name: string; license: string; refresh_interval_hours: number }>;
    datasets: Array<{ dataset_key: string; title: string; version: string; checksum_sha256: string; record_count: number; integrity_status: string; updated_at: string }>;
    history: Array<{ id: number; dataset_key: string; action: string; status: string; version: string; message: string; created_at: string }>;
  } | null>(null);

  const sampleKundli =
    activeKundli ||
    calculateKundli({
      name: 'Audit Reference',
      date: '1995-08-15',
      time: '09:42',
      placeName: 'New Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 330,
    });

  const engineComparison = compareAyanamshaEngines(sampleKundli.input);
  const tzResolved = resolveHistoricalTimezone(tzDate, tzTime, tzZone);
  const cityMatches = resolveLocationCoordinates(cityQuery);
  const birthAudit = runBirthDataAudit(sampleKundli.input, sampleKundli);

  const refreshOfflineAndSync = async () => {
    const [sum, list] = await Promise.all([getOfflineStorageSummary(), listOfflineKundlis()]);
    setOfflineSummary(sum);
    setOfflineList(list.map((l) => ({ id: l.id, name: l.name, date: l.date, place: l.place })));
    try {
      const r = await fetch('/api/sync/status');
      if (r.ok) {
        setSyncOverview(await r.json());
      }
    } catch {
      // Offline fallback cleanly handled
    }
  };

  useEffect(() => {
    refreshOfflineAndSync();
  }, []);

  const handleSaveCurrentOffline = async () => {
    await saveKundliOffline({
      id: `${sampleKundli.input.name}-${sampleKundli.input.date}-${sampleKundli.input.time}`,
      name: sampleKundli.input.name,
      date: sampleKundli.input.date,
      place: sampleKundli.input.placeName || 'India',
      result: sampleKundli,
    });
    if (syncOverview?.datasets) {
      for (const ds of syncOverview.datasets) {
        const res = await fetch(`/api/datasets/${ds.dataset_key}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
        if (res) {
          await cacheDatasetOffline({
            datasetKey: ds.dataset_key,
            version: ds.version,
            checksumSha256: ds.checksum_sha256,
            payload: res.payload,
            syncedAt: new Date().toISOString(),
          });
        }
      }
    }
    await refreshOfflineAndSync();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Data, Automation, Open-Data Sync & Bulk Kundli Engine"
        description="Ephemeris validation checkpoints, Multi-Ayanamsha comparison, Historical Timezone & DST engine via Luxon, Offline IndexedDB manager, SHA-256 Open Data Sync, Benchmark, and Bulk CSV Kundli exporter."
        keywords="lahiri kp raman ayanamsha comparison calculator, historical timezone dst astrology india, bulk csv kundli generator offline"
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
          Category F · Features 71–85 · Zero-Key Validation &amp; Offline Automation
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
          Data, Automation &amp; Smart Astrology Tools
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Ephemeris J2000 verification, Luxon historical DST resolution, SHA-256 dataset sync monitoring, performance benchmarks, and CSV batch processing.
        </p>
      </div>

      {/* F-71 & F-72 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">F-71 · Automatic Ephemeris Validator</h2>
            </div>
            <button
              type="button"
              onClick={() => setEphemerisAudit(validateEphemerisEngine())}
              className="px-2.5 py-1 rounded border border-[#D8CBAF] dark:border-slate-700 text-xs font-medium cursor-pointer"
            >
              Re-Validate
            </button>
          </div>
          <div className="space-y-2 text-xs tabular-nums">
            {ephemerisAudit.checks.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.checkpoint}</p>
                  <p className="text-slate-500">Expected {c.expected} · Computed {c.computed}</p>
                </div>
                <span className={`inline-flex items-center gap-1 font-bold ${c.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {c.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto space-y-3">
          <h2 className="font-display text-xl font-bold">F-72 · Multi-Engine Ayanamsha Comparison</h2>
          <table className="w-full text-xs text-left tabular-nums">
            <thead>
              <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                <th className="py-2">System</th>
                <th className="py-2">Ayanamsha</th>
                <th className="py-2">Ascendant</th>
                <th className="py-2">Moon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
              {engineComparison.map((e) => (
                <tr key={e.mode}>
                  <td className="py-2 font-semibold uppercase">{e.mode}</td>
                  <td className="py-2 font-mono">{e.ayanamshaDms}</td>
                  <td className="py-2">{e.ascendant}</td>
                  <td className="py-2">{e.moon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* F-73, F-74, F-75, F-76, F-77 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <h2 className="font-display text-xl font-bold">F-73, F-74 &amp; F-75 · Coordinate, Historical TZ &amp; DST Engine (Luxon)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <input
              type="date"
              value={tzDate}
              onChange={(e) => setTzDate(e.target.value)}
              className="px-2.5 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
            />
            <input
              type="time"
              value={tzTime}
              onChange={(e) => setTzTime(e.target.value)}
              className="px-2.5 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
            />
            <select
              value={tzZone}
              onChange={(e) => setTzZone(e.target.value)}
              className="px-2.5 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
            </select>
          </div>
          <div className="p-3 rounded-lg bg-[#F7F2E4] dark:bg-slate-900 text-xs space-y-1">
            <p><strong>Resolved Offset:</strong> UTC{tzResolved.offsetLabel} ({tzResolved.offsetMinutes} min) · DST Active: <strong>{tzResolved.isInDST ? 'Yes' : 'No'}</strong></p>
            <p className="text-slate-600 dark:text-slate-400">{tzResolved.historicalNote}</p>
          </div>
          <div className="space-y-2 text-xs">
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Resolve Indian city coordinates..."
              className="w-full px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cityMatches.slice(0, 4).map((c) => (
                <div key={c.name} className="p-2 rounded border border-[#E7DEC8] dark:border-slate-800 tabular-nums">
                  <p className="font-semibold">{c.name}, {c.state}</p>
                  <p className="font-mono text-[11px] text-slate-500">{c.latitude}°, {c.longitude}° · {c.distFromUjjainKm} km from Ujjain</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">F-76, F-77 &amp; F-83 · Audit &amp; Speed Benchmark</h2>
            <button
              type="button"
              onClick={() => setBenchmark(runCalculationBenchmark(25))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C59326] text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Run 25-Chart Benchmark</span>
            </button>
          </div>
          <div className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800 text-xs space-y-1 tabular-nums">
            <p><strong>Schema Valid:</strong> {birthAudit.schemaValid ? 'Yes (Zod Verified)' : 'No'}</p>
            <p><strong>Julian Day:</strong> {birthAudit.auditTrail.julianDay} · <strong>LST:</strong> {birthAudit.auditTrail.localSiderealTimeHours}h</p>
            <p><strong>Ayanamsha:</strong> {birthAudit.auditTrail.ayanamsha}</p>
            {birthAudit.warnings.map((w, i) => (
              <p key={i} className="text-amber-700 dark:text-amber-300">Notice: {w}</p>
            ))}
          </div>
          {benchmark && (
            <div className="p-3 rounded-lg bg-[#F7F2E4] dark:bg-slate-900 border border-[#C59326]/40 text-xs tabular-nums">
              <p className="font-bold text-[#0D1B3E] dark:text-amber-300">
                Benchmark Result: {benchmark.iterations} Full Kundlis + 16 D-Charts + 120y Dashas in {benchmark.totalMs} ms
              </p>
              <p className="mt-1">
                Throughput: <strong>{benchmark.chartsPerSecond} charts/sec</strong> ({benchmark.avgMsPerKundli} ms/chart)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* F-78..82: Offline IndexedDB & Open Data Sync Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">F-78 · Offline IndexedDB Storage Manager</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveCurrentOffline}
                className="px-3 py-1.5 rounded bg-[#0D1B3E] text-white text-xs font-semibold cursor-pointer"
              >
                Cache Active Chart &amp; Datasets
              </button>
              <button
                type="button"
                onClick={async () => {
                  await clearAllOfflineStores();
                  await refreshOfflineAndSync();
                }}
                className="px-2.5 py-1.5 rounded border border-rose-300 text-rose-700 dark:text-rose-400 text-xs cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs tabular-nums">
            <div className="p-2.5 rounded bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
              <p className="font-bold text-lg">{offlineSummary.kundlis}</p>
              <p className="text-slate-500">Kundlis</p>
            </div>
            <div className="p-2.5 rounded bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
              <p className="font-bold text-lg">{offlineSummary.datasets}</p>
              <p className="text-slate-500">Datasets</p>
            </div>
            <div className="p-2.5 rounded bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
              <p className="font-bold text-lg">{offlineSummary.familyCharts}</p>
              <p className="text-slate-500">Family</p>
            </div>
            <div className="p-2.5 rounded bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
              <p className="font-bold text-lg">{offlineSummary.panchang}</p>
              <p className="text-slate-500">Panchang</p>
            </div>
          </div>
          <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto">
            {offlineList.map((item) => (
              <div key={item.id} className="p-2 rounded border border-[#E7DEC8] dark:border-slate-800 flex justify-between items-center">
                <span><strong>{item.name}</strong> · {item.date} · {item.place}</span>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteOfflineKundli(item.id);
                    await refreshOfflineAndSync();
                  }}
                  className="text-rose-600 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">F-79..82 · Open Data Integrity &amp; Version Monitor</h2>
            </div>
            <button
              type="button"
              onClick={refreshOfflineAndSync}
              className="px-2.5 py-1 rounded border border-[#D8CBAF] dark:border-slate-700 text-xs cursor-pointer"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-2 text-xs max-h-60 overflow-y-auto tabular-nums">
            {syncOverview?.datasets.map((d) => (
              <div key={d.dataset_key} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800">
                <div className="flex justify-between font-semibold">
                  <span>{d.title}</span>
                  <span className="font-mono text-[#9A6D12] dark:text-amber-300">v{d.version} · {d.integrity_status}</span>
                </div>
                <p className="font-mono text-[10px] text-slate-500 mt-0.5 truncate">
                  SHA-256: {d.checksum_sha256} ({d.record_count} records)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* F-84 & F-85: Multi-Profile Bulk Kundli Generator & Batch Exporter */}
      <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">F-84 &amp; F-85 · Multi-Profile Bulk CSV Kundli Generator &amp; Batch Exporter</h2>
            <p className="text-xs text-slate-500">Paste CSV rows (name,date,time,place,latitude,longitude,timezoneOffsetMinutes) to compute and batch export charts.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBulkRows(processBulkKundliCsv(csvInput))}
              className="px-3.5 py-2 rounded-lg bg-[#C59326] text-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
            >
              Process CSV Batch
            </button>
            <button
              type="button"
              onClick={() => exportRowsToCsv('bulk-kundli-batch.csv', bulkRows as unknown as Record<string, unknown>[])}
              className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs font-medium cursor-pointer"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => downloadTextFile('bulk-kundli-batch.json', JSON.stringify(bulkRows, null, 2))}
              className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-xs font-medium cursor-pointer"
            >
              Export JSON
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          className="w-full p-3 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-[#FCFBF7] dark:bg-slate-900 font-mono text-xs"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left tabular-nums">
            <thead>
              <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                <th className="py-2">Name</th>
                <th className="py-2">Birth Date/Time</th>
                <th className="py-2">Lagna</th>
                <th className="py-2">Moon Sign</th>
                <th className="py-2">Sun Sign</th>
                <th className="py-2">Nakshatra</th>
                <th className="py-2">Mahadasha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
              {bulkRows.map((r, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-semibold">{r.name}</td>
                  <td className="py-2 font-mono">{r.date} {r.time}</td>
                  <td className="py-2">{r.lagna}</td>
                  <td className="py-2">{r.moonSign}</td>
                  <td className="py-2">{r.sunSign}</td>
                  <td className="py-2">{r.nakshatra}</td>
                  <td className="py-2">{r.currentMahaDasha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
