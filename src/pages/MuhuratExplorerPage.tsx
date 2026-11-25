import React, { useMemo, useState } from 'react';
import { Calendar, Clock, Compass, Download, Flame, Moon } from 'lucide-react';
import { BirthInputForm } from '../components/BirthInputForm';
import { MonetagDirectLinkCta } from '../components/AdSlot';
import { BrowserPanchangReminder, trackAnalyticsEvent } from '../components/MonetagAndSeoExtras';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import type { BirthInput } from '../engine/ephemeris';
import { calculatePanchang } from '../engine/panchang';
import { buildAstrologyCalendarIcs } from '../engine/prashnaAndVarshaphal';
import { downloadTextFile } from '../utils/reportExporter';
import {
  compareDrikVsSuryaSiddhanta,
  findPurposeMuhurats,
  findSpecialAstronomicalYogas,
  getRegionalIndianCalendars,
  runBirthTimeRectification,
  calculateDailyAlmanacChecks,
  type MuhuratPurpose,
} from '../engine/muhuratExtended60';

export const MuhuratExplorerPage: React.FC = () => {
  const { t } = useApp();
  const [tab, setTab] = useState<'purposes' | 'almanac' | 'yogas' | 'btr'>('purposes');
  const [purpose, setPurpose] = useState<MuhuratPurpose>('griha_pravesh');
  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [btrBirth, setBtrBirth] = useState<BirthInput>({
    name: 'Native',
    date: '1994-06-21',
    time: '11:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetMinutes: 330,
    placeName: 'New Delhi, India',
  });
  const [eventYear, setEventYear] = useState(2021);
  const [eventCat, setEventCat] = useState<'career' | 'marriage' | 'education' | 'relocation'>('career');

  const purposeRows = useMemo(() => findPurposeMuhurats(purpose, year, 18), [purpose, year]);
  const almanac = useMemo(() => calculateDailyAlmanacChecks(selectedDate), [selectedDate]);
  const drikVsSurya = useMemo(() => compareDrikVsSuryaSiddhanta(selectedDate), [selectedDate]);
  const regionalCalendars = useMemo(() => getRegionalIndianCalendars(selectedDate), [selectedDate]);
  const specialYogas = useMemo(() => findSpecialAstronomicalYogas(year), [year]);
  const todayPanchang = useMemo(() => calculatePanchang(selectedDate, 28.6139, 77.209, 330, 'New Delhi'), [selectedDate]);
  const btrCandidates = useMemo(
    () => runBirthTimeRectification(btrBirth, [{ year: eventYear, category: eventCat }], 30),
    [btrBirth, eventYear, eventCat]
  );

  const exportMuhuratIcs = () => {
    const icsEvents = purposeRows.map((r) => ({
      date: r.date,
      name: `${purpose.replace('_', ' ').toUpperCase()} Muhurat (${r.bestWindow})`,
      region: 'Pan-India' as const,
      category: 'Festival' as const,
      tithi: r.tithi,
      nakshatra: r.nakshatra,
    }));
    const icsText = buildAstrologyCalendarIcs(icsEvents, year);
    downloadTextFile(`goo-muhurat-${purpose}-${year}.ics`, icsText, 'text/calendar');
    trackAnalyticsEvent('/muhurat-explorer', `ics_${purpose}`, 'calculator_run');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Muhurat Explorer: Griha Pravesh, Vehicle, Agni/Shiv Vaas, Regional Calendars & BTR"
        description="Find astronomical Griha Pravesh, Vehicle, Business & Mundan Muhurats with .ICS export, Agni Vaas, Shiv Vaas, Disha Shool, 6 Indian regional calendars & Birth Time Rectification."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#9A6D12] dark:text-amber-400">
            Muhurat &amp; Almanac Suite · Features #21–#32
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-white mt-1">
            {t('Ceremony Muhurat Explorer, Regional Calendars & BTR', 'विवाह-गृहप्रवेश मुहूर्त, क्षेत्रीय पंचांग व जन्म समय सुधार')}
          </h1>
        </div>
        <BrowserPanchangReminder cityLabel="New Delhi" rahuKaal={todayPanchang.rahuKaal} abhijit={todayPanchang.abhijitMuhurat} />
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E7DEC8] dark:border-slate-800 pb-3">
        {(
          [
            ['purposes', '1. Griha Pravesh, Property, Mundan & Business Muhurats'],
            ['almanac', '2. Agni/Shiv Vaas, Disha Shool, Drik vs Surya & 6 Calendars'],
            ['yogas', '3. Guru/Ravi Pushya, Sankashti, Pradosh & Eclipse Sutak'],
            ['btr', '4. Birth Time Rectification (BTR)'],
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

      {tab === 'purposes' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as MuhuratPurpose)}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326] font-semibold"
              >
                <option value="griha_pravesh">Griha Pravesh (Housewarming)</option>
                <option value="vehicle_property">Vehicle &amp; Property Registration</option>
                <option value="mundan_vidyarambh">Mundan, Annaprashan &amp; Vidyarambh</option>
                <option value="business_trading">New Business &amp; Trading Account</option>
              </select>
              <input
                type="number"
                min={2020}
                max={2035}
                value={year}
                onChange={(e) => setYear(Number(e.target.value) || 2025)}
                className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>
            <button
              type="button"
              onClick={exportMuhuratIcs}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0D1B3E] dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export {purposeRows.length} Dates (.ICS)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purposeRows.map((item) => (
              <div key={item.date} className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#9A6D12] dark:text-amber-400">{item.date} ({item.weekday})</span>
                  <span className="font-mono text-slate-500">{item.bestWindow}</span>
                </div>
                <p className="font-semibold text-[#0D1B3E] dark:text-white">{item.tithi} · {item.nakshatra}</p>
                <p className="text-slate-500">Yoga: {item.yoga}</p>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 list-disc pl-4">
                  {item.reasons.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'almanac' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 flex items-center gap-3 text-xs">
            <Calendar className="w-4 h-4 text-[#C59326]" />
            <label className="font-semibold">Check Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-[#9A6D12] dark:text-amber-300">
                <Flame className="w-4 h-4" /> Agni Vaas (Havan Check)
              </p>
              <p className="text-base font-bold">{almanac.agniVaas.residence}</p>
              <p className="text-slate-500">{almanac.agniVaas.note}</p>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-[#9A6D12] dark:text-amber-300">
                <Moon className="w-4 h-4" /> Shiv Vaas (Rudrabhishek)
              </p>
              <p className="text-base font-bold">{almanac.shivVaas.label}</p>
              <p className="text-slate-500">{almanac.tithi} · {almanac.vara}</p>
            </div>
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5 text-[#9A6D12] dark:text-amber-300">
                <Compass className="w-4 h-4" /> Disha Shool &amp; Remedy
              </p>
              <p className="text-base font-bold">{almanac.dishaShool.direction}</p>
              <p className="text-slate-500">{almanac.dishaShool.remedy}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2 text-xs">
              <h2 className="font-display text-xl font-bold">Drik Ganita (VSOP87) vs Classical Surya Siddhanta</h2>
              <p>Drik Sidereal Sun: <strong className="font-mono">{drikVsSurya.drikSunDeg}°</strong></p>
              <p>Surya Siddhanta Mean Sun: <strong className="font-mono">{drikVsSurya.suryaSiddhantaMeanSunDeg}°</strong></p>
              <p>Sun Ephemeris Delta: <strong className="font-mono text-[#9A6D12] dark:text-amber-400">{drikVsSurya.sunDifferenceDeg}°</strong></p>
              <p>Drik Moon vs Surya Mean Moon: <strong className="font-mono">{drikVsSurya.drikMoonDeg}° vs {drikVsSurya.suryaSiddhantaMeanMoonDeg}°</strong></p>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2 text-xs">
              <h2 className="font-display text-xl font-bold">6 Regional Indian Calendars</h2>
              <div className="space-y-1.5">
                {regionalCalendars.map((c) => (
                  <div key={c.tradition} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="font-medium">{c.tradition}</span>
                    <span className="font-mono text-[#9A6D12] dark:text-amber-400">{c.monthName} · {c.yearLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'yogas' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
            <h2 className="font-display text-xl font-bold mb-3">Upcoming Eclipses &amp; Classical Sutak Kaal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {specialYogas.eclipses.map((e) => (
                <div key={e.peakUtc + e.kind} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="font-semibold text-sm">{e.kind} ({e.typeLabel}) · {e.peakIst.slice(0, 10)}</p>
                  <p className="font-mono text-[#9A6D12] dark:text-amber-400">Sutak Begins: {e.sutakHoursBefore} hours before peak · Mag {e.obscurationOrMagnitude}</p>
                  <p className="text-slate-500 mt-1">{e.visibilitySummary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
            <h2 className="font-display text-xl font-bold mb-3">Guru/Ravi Pushya, Sankashti, Pradosh &amp; Sarvartha Siddhi ({year})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {specialYogas.yogas.map((y, idx) => (
                <div key={y.date + y.yogaType + idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="font-mono text-[#9A6D12] dark:text-amber-400 font-semibold">{y.date} ({y.weekday})</p>
                  <p className="font-bold text-sm mt-0.5">{y.yogaType}</p>
                  <p className="text-slate-500">{y.nakshatra} · {y.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'btr' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C59326]" /> Birth Time Rectification (BTR) Engine
            </h2>
            <BirthInputForm initialValue={btrBirth} onSubmit={setBtrBirth} submitLabel="Set Approximate Birth Data" />
            <div className="flex flex-wrap items-center gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="font-semibold">Major Life Event Year:</label>
              <input
                type="number"
                min={1950}
                max={2030}
                value={eventYear}
                onChange={(e) => setEventYear(Number(e.target.value) || 2020)}
                className="w-24 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
              <label className="font-semibold">Event Category:</label>
              <select
                value={eventCat}
                onChange={(e) => setEventCat(e.target.value as 'career' | 'marriage' | 'education' | 'relocation')}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              >
                <option value="career">Career Milestone</option>
                <option value="marriage">Marriage / Partnership</option>
                <option value="education">Higher Education / Degree</option>
                <option value="relocation">Foreign Travel / Relocation</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 overflow-x-auto">
            <h3 className="font-display text-lg font-bold mb-3">Ranked Candidate Birth Times (±30 Minutes Scan)</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                  <th className="py-1.5">Candidate Time</th><th>Lagna</th><th>Navamsha (D9)</th><th>Alignment</th><th>Dasha House Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {btrCandidates.map((c) => (
                  <tr key={c.time}>
                    <td className="py-2 font-mono font-bold text-[#9A6D12] dark:text-amber-400">{c.time}</td>
                    <td className="py-2">{c.lagnaSign}</td>
                    <td className="py-2">{c.navamsaLagna}</td>
                    <td className="py-2 font-mono">{c.alignmentScore}%</td>
                    <td className="py-2 text-slate-500">{c.notes.join(' · ') || 'Baseline alignment'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MonetagDirectLinkCta placement="muhurat_explorer" />
    </div>
  );
};
