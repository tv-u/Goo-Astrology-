import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Sparkles } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { INDIAN_CITIES } from '../data/cities';
import { NAKSHATRAS, ZODIAC_SIGNS } from '../engine/constants';
import {
  calculateDailyHoras,
  calculateSpecialMuhuratChecks,
  generateAstronomicalCalendarYear,
} from '../engine/lifeAndMuhurat';

export function MuhuratCalendarPage() {
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [year, setYear] = useState(new Date().getFullYear());
  const [cityIdx, setCityIdx] = useState(0);
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [birthNakIdx, setBirthNakIdx] = useState(0);
  const [birthSignIdx, setBirthSignIdx] = useState(0);
  const [tab, setTab] = useState<'festivals' | 'hora' | 'checks' | 'muhurats'>('festivals');

  const city = INDIAN_CITIES[cityIdx] || INDIAN_CITIES[0];

  const yearData = useMemo(() => generateAstronomicalCalendarYear(year), [year]);
  const horas = useMemo(
    () => calculateDailyHoras(dateStr, city.latitude, city.longitude, city.timezoneOffsetMinutes),
    [dateStr, city]
  );
  const checks = useMemo(
    () => calculateSpecialMuhuratChecks(dateStr, birthNakIdx, birthSignIdx),
    [dateStr, birthNakIdx, birthSignIdx]
  );

  const filteredEvents = useMemo(
    () =>
      yearData.events.filter(
        (ev) =>
          (regionFilter === 'All' || ev.region === regionFilter) &&
          (categoryFilter === 'All' || ev.category === categoryFilter)
      ),
    [yearData, regionFilter, categoryFilter]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Advanced Hindu Festival Calendar, Planetary Hora & Muhurat System"
        description="Astronomically calculated Hindu Festivals, Regional Calendars, Ekadashi, Sankranti, Purnima, Amavasya, 24-Hour Planetary Hora, Tara Bala, Chandra Bala, Panchak, Bhadra, Gandmool, Vivah & Naamkaran Muhurat."
        keywords="daily planetary hora table calculator india, tara bala chandra bala checker online, panchak bhadra gandmool calculator, vivah naamkaran muhurat finder 2026"
      />

      <div className="border-b border-[#E7DEC8] dark:border-slate-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            Category D · Features 46–60 · Sunrise Astronomical Almanac
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-amber-200 mt-1">
            Calendar, Planetary Hora &amp; Muhurat Suite
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Regional festivals, Ekadashi, Sankranti, 24-hour Sunrise Hora, Tara/Chandra Bala, Panchak, Bhadra, Gandmool, and Vivah/Naamkaran Muhurats.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>Calendar {y}</option>
            ))}
          </select>
          <select
            value={cityIdx}
            onChange={(e) => setCityIdx(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          >
            {INDIAN_CITIES.slice(0, 25).map((c, idx) => (
              <option key={c.name} value={idx}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'festivals', label: '46–51 · Festivals, Ekadashi, Sankranti & Purnima' },
          { id: 'hora', label: '52–53 · Daily 24-Hour Planetary Hora' },
          { id: 'checks', label: '54–58 · Tara, Chandra, Panchak, Bhadra & Gandmool' },
          { id: 'muhurats', label: '59–60 · Vivah & Naamkaran Muhurat Finder' },
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

      {tab === 'festivals' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-[#0D1326] p-4 rounded-xl border border-[#E7DEC8] dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-[#C59326]" />
              <span className="font-semibold">{filteredEvents.length} astronomical dates computed for {year}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
              >
                <option value="All">All Categories</option>
                <option value="Festival">Major Festivals</option>
                <option value="Ekadashi">Ekadashi Reminders</option>
                <option value="Sankranti">Sankranti Calendar</option>
                <option value="Purnima">Purnima (Full Moon)</option>
                <option value="Amavasya">Amavasya (New Moon)</option>
              </select>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent text-xs"
              >
                <option value="All">All Regions</option>
                <option value="Pan-India">Pan-India</option>
                <option value="North India">North India</option>
                <option value="Maharashtra / West">Maharashtra / West</option>
                <option value="East India">East / South India</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEvents.map((ev, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-xs font-bold text-[#9A6D12] dark:text-amber-300">{ev.date}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">{ev.category} · {ev.region}</span>
                </div>
                <p className="font-display text-lg font-bold text-[#0D1B3E] dark:text-slate-100">{ev.name}</p>
                <p className="text-xs text-slate-500">{ev.tithi} · {ev.nakshatra}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'hora' && (
        <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C59326]" />
            <h2 className="font-display text-2xl font-bold">
              D-52 &amp; D-53 · 24-Hour Sunrise Planetary Hora Table ({city.name} · {dateStr})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs tabular-nums">
            {horas.map((h) => (
              <div
                key={h.index}
                className="p-3 rounded-lg border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-slate-900/60 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-[#0D1B3E] dark:text-amber-200">
                    Hora #{h.index} ({h.period}) — {h.planet}
                  </p>
                  <p className="text-slate-500 mt-0.5">{h.bestFor}</p>
                </div>
                <span className="font-mono font-bold text-[#9A6D12] dark:text-amber-300 shrink-0">
                  {h.startTime}–{h.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'checks' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 flex flex-wrap items-center gap-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1">Your Janma Nakshatra (for Tara Bala)</label>
              <select
                value={birthNakIdx}
                onChange={(e) => setBirthNakIdx(Number(e.target.value))}
                className="px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
              >
                {NAKSHATRAS.map((n) => (
                  <option key={n.index} value={n.index}>{n.index + 1}. {n.name} ({n.lord})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Your Janma Rashi (for Chandra Bala)</label>
              <select
                value={birthSignIdx}
                onChange={(e) => setBirthSignIdx(Number(e.target.value))}
                className="px-3 py-2 rounded border border-[#D8CBAF] dark:border-slate-700 bg-transparent"
              >
                {ZODIAC_SIGNS.map((z) => (
                  <option key={z.index} value={z.index}>{z.name} ({z.sanskritName})</option>
                ))}
              </select>
            </div>
            <div className="ml-auto text-right">
              <p className="text-slate-500">Day Snapshot ({checks.date})</p>
              <p className="font-semibold text-sm">{checks.tithiName} · Moon in {checks.transitMoonSign} ({checks.transitNakshatra})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-2">
              <p className="text-slate-500 uppercase">D-54 · Tara Bala</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300">
                #{checks.taraBala.taraNumber} {checks.taraBala.taraName}
              </p>
              <p className={checks.taraBala.isAuspicious ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-300 font-semibold'}>
                {checks.taraBala.note}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-2">
              <p className="text-slate-500 uppercase">D-55 · Chandra Bala</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300">
                House {checks.chandraBala.moonHouseFromNatal} from Rashi
              </p>
              <p className={checks.chandraBala.isAuspicious ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-300 font-semibold'}>
                {checks.chandraBala.note}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-2">
              <p className="text-slate-500 uppercase">D-56 · Panchak Status</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300">
                {checks.panchak.label}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Moon traversal from Dhanishta 2nd half through Revati.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-2">
              <p className="text-slate-500 uppercase">D-57 · Bhadra (Vishti Karana)</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300">
                {checks.bhadra.active ? 'Bhadra Active' : 'No Bhadra'}
              </p>
              <p className="text-slate-600 dark:text-slate-400">{checks.bhadra.residence}</p>
            </div>

            <div className="p-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] space-y-2">
              <p className="text-slate-500 uppercase">D-58 · Gandmool Nakshatra</p>
              <p className="font-display text-2xl font-bold text-[#0D1B3E] dark:text-amber-300">
                {checks.gandmool.nakshatra}
              </p>
              <p className="text-slate-600 dark:text-slate-400">{checks.gandmool.note}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'muhurats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">D-59 · Vivah Muhurat Finder ({year})</h2>
            </div>
            <p className="text-xs text-slate-500">Filtered for auspicious non-Rikta Tithis, Vivah Nakshatras, non-Bhadra windows, and Sun outside Adhik/Chaturmas brackets.</p>
            <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
              {yearData.vivahMuhurats.map((m, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 flex justify-between">
                  <span className="font-mono font-bold text-[#9A6D12] dark:text-amber-300">{m.date}</span>
                  <span>{m.tithi} · {m.nakshatra}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C59326]" />
              <h2 className="font-display text-xl font-bold">D-60 · Naamkaran (Naming) Muhurat Finder ({year})</h2>
            </div>
            <p className="text-xs text-slate-500">Dates aligned with auspicious Mridu, Dhruva &amp; Laghu naming Nakshatras excluding Bhadra &amp; Rikta Tithis.</p>
            <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
              {yearData.naamkaranMuhurats.map((m, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-[#E7DEC8] dark:border-slate-800 flex justify-between">
                  <span className="font-mono font-bold text-[#9A6D12] dark:text-amber-300">{m.date}</span>
                  <span>{m.tithi} · {m.nakshatra}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
