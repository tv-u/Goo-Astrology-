import React, { useMemo, useState } from 'react';
import { Globe, Moon, Orbit, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from '../components/SeoHead';
import { calculateKundli } from '../engine/ephemeris';
import { INDIAN_CITIES } from '../data/cities';
import {
  analyzePlanetarySpeeds,
  calculateAspectStrengths,
  calculateCombustionDistances,
  compareNatalVsTransitDignity,
  detectPlanetaryStations,
  detectPlanetaryWar,
  findExactConjunctions,
  getMoonPhaseCalendar,
  getNakshatraPadaTransits,
  getPlanetaryIngresses,
  getRetrogradeShadowSummary,
  getUpcomingEclipses,
} from '../engine/planetaryIntelligence';

export function PlanetaryIntelligencePage() {
  const { activeKundli } = useApp();
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [cityIdx, setCityIdx] = useState(0);
  const [tab, setTab] = useState<'war-speed' | 'aspects-conj' | 'nak-dignity' | 'eclipses-phases'>('war-speed');

  const city = INDIAN_CITIES[cityIdx] || INDIAN_CITIES[0];

  const skyKundli = useMemo(
    () =>
      calculateKundli({
        name: 'Gochar Transit Sky',
        date: targetDate,
        time: '06:00',
        latitude: city.latitude,
        longitude: city.longitude,
        timezoneOffsetMinutes: city.timezoneOffsetMinutes,
        ayanamsha: 'lahiri',
      }),
    [targetDate, city]
  );

  const wars = useMemo(() => detectPlanetaryWar(skyKundli.planets), [skyKundli]);
  const speeds = useMemo(() => analyzePlanetarySpeeds(skyKundli.planets), [skyKundli]);
  const stations = useMemo(() => detectPlanetaryStations(targetDate, 120), [targetDate]);
  const shadows = useMemo(() => getRetrogradeShadowSummary(skyKundli.planets, targetDate), [skyKundli, targetDate]);
  const conjunctions = useMemo(() => findExactConjunctions(skyKundli.planets, 10), [skyKundli]);
  const aspects = useMemo(() => calculateAspectStrengths(skyKundli.planets), [skyKundli]);
  const combustions = useMemo(() => calculateCombustionDistances(skyKundli.planets), [skyKundli]);
  const nakTransits = useMemo(() => getNakshatraPadaTransits(targetDate, city.latitude, city.longitude), [targetDate, city]);
  const moonPhases = useMemo(() => getMoonPhaseCalendar(targetDate), [targetDate]);
  const eclipses = useMemo(() => getUpcomingEclipses(targetDate, city.latitude, city.longitude), [targetDate, city]);
  const ingresses = useMemo(() => getPlanetaryIngresses(targetDate, 150), [targetDate]);
  const dignityMatrix = useMemo(
    () => (activeKundli ? compareNatalVsTransitDignity(activeKundli, skyKundli) : compareNatalVsTransitDignity(skyKundli, skyKundli)),
    [activeKundli, skyKundli]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Planetary Intelligence — Graha Yuddha, Lunar/Solar Eclipses, Retrogrades & Ingresses"
        description="Live astronomical Vedic Planetary Intelligence: Graha Yuddha war detection, stationary dates, combustion angles, Nakshatra/Pada transits, Moon phases, Lunar & Solar Eclipse visibility."
        keywords="graha yuddha calculator online, solar lunar eclipse india visibility calculator, retrograde station shadow dates, planetary transit rashi ingress calendar"
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Category B · Features 16–30 · Ephemeris Sky Engine
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            Advanced Planetary Intelligence
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Real-time planetary wars, retrograde stations, combustion orbs, Moon quarters, Lunar/Solar eclipses, and Rashi ingresses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
          />
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
          >
            {INDIAN_CITIES.slice(0, 25).map((c, idx) => (
              <option key={c.name} value={idx}>{c.name}, {c.state}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'war-speed', label: '16–18, 28 · Graha Yuddha, Speeds & Stations' },
          { id: 'aspects-conj', label: '19–20, 29 · Conjunctions, Aspects & Combustion' },
          { id: 'nak-dignity', label: '21–22, 30 · Nakshatra/Pada Transits & Dignity Matrix' },
          { id: 'eclipses-phases', label: '23–27 · Moon Phases, Eclipses & Ingresses' },
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

      {tab === 'war-speed' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5">
            <h2 className="font-display text-xl font-bold mb-2">B-16 · Planetary War Detection (Graha Yuddha &lt; 1.0°)</h2>
            {wars.length === 0 ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                No Tara Graha planetary war within 1.0° ecliptic longitude on {targetDate}. Advance date to an upcoming conjunction window to inspect war resolution.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {wars.map((w, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#F7F2E4] dark:bg-slate-900 border border-[#C59326]/40 text-xs">
                    <p className="font-bold">{w.planetA} vs {w.planetB} (Orb: {w.separationDeg}°)</p>
                    <p className="mt-1">Winner: <strong className="text-[#9A6D12] dark:text-amber-300">{w.winner}</strong> · {w.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
              <h2 className="font-display text-xl font-bold mb-3">B-17 · Planetary Speed Analyzer</h2>
              <table className="w-full text-xs text-left tabular-nums">
                <thead>
                  <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                    <th className="py-2">Planet</th>
                    <th className="py-2">Current °/Day</th>
                    <th className="py-2">Mean °/Day</th>
                    <th className="py-2">Motion State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                  {speeds.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 font-semibold">{s.id}</td>
                      <td className="py-2 font-mono">{s.speedDegPerDay}</td>
                      <td className="py-2 font-mono">{s.meanSpeedDegPerDay}</td>
                      <td className="py-2">{s.motionState} ({s.relativeSpeedRatio}×)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
              <h2 className="font-display text-xl font-bold">B-18 &amp; B-28 · Stations (Next 120d) &amp; Retrograde Shadows</h2>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {stations.length === 0 ? (
                  <p className="text-xs text-slate-500">No major planetary stations in the next 120 days.</p>
                ) : (
                  stations.map((st, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-xs flex justify-between">
                      <span><strong>{st.planet}</strong> · {st.type}</span>
                      <span className="font-mono">{st.date} ({st.siderealSign} {st.degreeInSign}°)</span>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-[#E7DEC8] dark:border-slate-800 space-y-1.5 text-xs">
                {shadows.map((sh) => (
                  <div key={sh.planet} className="flex justify-between gap-2">
                    <span className="font-semibold">{sh.planet}:</span>
                    <span className="text-slate-600 dark:text-slate-400 text-right">{sh.statusNote}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'aspects-conj' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5">
            <h2 className="font-display text-xl font-bold mb-3">B-19 · Exact Conjunctions (&lt;10°)</h2>
            <div className="space-y-2 text-xs">
              {conjunctions.length === 0 ? (
                <p className="text-slate-500">No conjunctions under 10° orb on {targetDate}.</p>
              ) : (
                conjunctions.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800">
                    <p className="font-semibold">{c.planetA} + {c.planetB} ({c.orbDeg}°)</p>
                    <p className="text-slate-500">{c.signName} · {c.intensity}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5">
            <h2 className="font-display text-xl font-bold mb-3">B-20 · Planetary Aspect Virupas</h2>
            <div className="space-y-2 text-xs max-h-80 overflow-y-auto">
              {aspects.map((a, i) => (
                <div key={i} className="p-2 rounded border border-[#E7DEC8] dark:border-slate-800 flex justify-between">
                  <span><strong>{a.from}</strong> → {a.to} ({a.aspectType})</span>
                  <span className="font-mono font-bold text-[#9A6D12] dark:text-amber-300">{a.virupaStrength}v</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5">
            <h2 className="font-display text-xl font-bold mb-3">B-29 · Combustion Distance Orb</h2>
            <div className="space-y-2 text-xs tabular-nums">
              {combustions.map((c) => (
                <div key={c.planet} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{c.planet}</p>
                    <p className="text-[11px] text-slate-500">Sun Sep: {c.angularDistanceSunDeg}° (Limit {c.combustionThresholdDeg}°)</p>
                  </div>
                  <span className={`font-semibold ${c.isCombust ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {c.isCombust ? `Combust ${c.intensityPct}%` : 'Clear'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'nak-dignity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-3">B-21 &amp; B-22 · Live Nakshatra &amp; Pada Transit Tracker</h2>
            <table className="w-full text-xs text-left tabular-nums">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                  <th className="py-2">Planet</th>
                  <th className="py-2">Nakshatra / Pada</th>
                  <th className="py-2">Nak %</th>
                  <th className="py-2">Pada %</th>
                  <th className="py-2">Next Nak (Est)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                {nakTransits.map((n) => (
                  <tr key={n.planet}>
                    <td className="py-2 font-semibold">{n.planet}{n.isRetrograde ? ' (R)' : ''}</td>
                    <td className="py-2">{n.nakshatra} P{n.pada}</td>
                    <td className="py-2">{n.nakProgressPct}%</td>
                    <td className="py-2">{n.padaProgressPct}%</td>
                    <td className="py-2 font-mono">{n.estDaysToNextNak ? `${n.estDaysToNextNak}d` : 'Stationary'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 overflow-x-auto">
            <h2 className="font-display text-xl font-bold mb-1">B-30 · Natal vs Gochar Dignity Matrix</h2>
            <p className="text-xs text-slate-500 mb-3">
              {activeKundli ? `Comparing ${activeKundli.input.name} against sky on ${targetDate}` : 'Generate a chart in Free Kundli to compare your natal chart against live transits.'}
            </p>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E7DEC8] dark:border-slate-800 text-slate-500">
                  <th className="py-2">Planet</th>
                  <th className="py-2">Natal</th>
                  <th className="py-2">Transit Sign</th>
                  <th className="py-2">Gochar from Moon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECDC] dark:divide-slate-800/70">
                {dignityMatrix.map((d) => (
                  <tr key={d.planet}>
                    <td className="py-2 font-semibold">{d.planet}</td>
                    <td className="py-2">{d.natalSign} ({d.natalDignity})</td>
                    <td className="py-2">{d.transitSign} ({d.transitDignity})</td>
                    <td className="py-2 font-mono">House {d.transitHouseFromMoon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'eclipses-phases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#C59326]" />
                <h2 className="font-display text-xl font-bold">B-23 · Moon Phase Calendar (60 Days)</h2>
              </div>
              <div className="space-y-2 text-xs">
                {moonPhases.map((mp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{mp.phaseName}</p>
                      <p className="text-slate-500">{mp.moonSign} · {mp.nakshatra}</p>
                    </div>
                    <span className="font-mono font-bold text-[#9A6D12] dark:text-amber-300">{mp.date} ({mp.illuminationPct}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Orbit className="w-4 h-4 text-[#C59326]" />
                <h2 className="font-display text-xl font-bold">B-27 · Planetary Rashi Ingress Calendar (150d)</h2>
              </div>
              <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
                {ingresses.map((ing, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 flex justify-between">
                    <span><strong>{ing.planet}</strong>: {ing.fromSign} → <strong className="text-[#9A6D12] dark:text-amber-300">{ing.toSign}</strong></span>
                    <span className="font-mono">{ing.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#C59326]" />
              <Globe className="w-4 h-4 text-[#0D1B3E] dark:text-amber-300" />
              <h2 className="font-display text-xl font-bold">B-24, B-25 &amp; B-26 · Lunar &amp; Solar Eclipses + Visibility ({city.name})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                <h3 className="font-semibold uppercase tracking-wider text-slate-500">Upcoming Lunar Eclipses (Chandra Grahan)</h3>
                {eclipses.lunar.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{e.typeLabel} Lunar Eclipse</span>
                      <span className="font-mono">{e.peakIst}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">UTC: {e.peakUtc} · Obscuration: {e.obscurationOrMagnitude}</p>
                    <p className={e.indiaVisibleEstimate ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                      {e.visibilitySummary}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                <h3 className="font-semibold uppercase tracking-wider text-slate-500">Upcoming Solar Eclipses (Surya Grahan)</h3>
                {eclipses.solar.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#FCFBF7] dark:bg-slate-900 border border-[#E7DEC8] dark:border-slate-800 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>{e.typeLabel} Solar Eclipse</span>
                      <span className="font-mono">{e.peakIst}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">UTC: {e.peakUtc} · Mag/Obs: {e.obscurationOrMagnitude}</p>
                    <p className={e.indiaVisibleEstimate ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500'}>
                      {e.visibilitySummary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
