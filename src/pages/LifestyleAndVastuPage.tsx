import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Compass, Gem, Grid3X3, Hand, Moon, Users, Volume2 } from 'lucide-react';
import { MonetagDirectLinkCta } from '../components/AdSlot';
import { trackAnalyticsEvent } from '../components/MonetagAndSeoExtras';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import {
  MAHAVASTU_16_ZONES,
  SWAPNA_SHASTRA_DREAMS,
  calculateLoShuGrid,
  compareMultiPartnerMatrix,
  evaluateChaldeanIdentifier,
  recommendGemstonesAndRudraksha,
} from '../engine/lifestyleAndRemedies60';

const PALM_MOUNTS = [
  { name: 'Mount of Jupiter (Guru)', finger: 'Below Index', meaning: 'Leadership, wisdom, dharmic ambition & teaching ability.' },
  { name: 'Mount of Saturn (Shani)', finger: 'Below Middle', meaning: 'Discipline, solitary research, responsibility & endurance.' },
  { name: 'Mount of Sun (Surya)', finger: 'Below Ring', meaning: 'Creative fame, artistic refinement & recognition.' },
  { name: 'Mount of Mercury (Budha)', finger: 'Below Little', meaning: 'Commerce, speech fluency, wit & scientific aptitude.' },
  { name: 'Heart, Head & Life Lines', finger: 'Major Arcs', meaning: 'Emotional bonding, analytical clarity, and vital resilience.' },
];

export const LifestyleAndVastuPage: React.FC = () => {
  const { activeKundli, t } = useApp();
  const [tab, setTab] = useState<'numerology' | 'mahavastu' | 'palmistry' | 'remedies'>('numerology');

  // Numerology & Chaldean
  const [dob, setDob] = useState('1995-08-15');
  const [identifier, setIdentifier] = useState('DL01AB1234');
  const [idCategory, setIdCategory] = useState<'mobile' | 'vehicle' | 'house' | 'brand'>('vehicle');

  // MahaVastu 16 Zones
  const [selectedZoneCode, setSelectedZoneCode] = useState('NE');

  // Swapna Shastra
  const [dreamQuery, setDreamQuery] = useState('');

  // Palmistry selected feature
  const [palmIdx, setPalmIdx] = useState(0);

  // Audio Mantra Bell / Om Drone (136.1 Hz Earth Year Om)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const [mantraPlaying, setMantraPlaying] = useState(false);

  // 30-Day Local Tarot Mood Journal
  const [moodNote, setMoodNote] = useState('');
  const [moodScore, setMoodScore] = useState<'Balanced' | 'Focused' | 'Reflective' | 'Inspired'>('Balanced');
  const [moodLogs, setMoodLogs] = useState<Array<{ date: string; mood: string; note: string }>>(() => {
    try {
      const raw = localStorage.getItem('goo_tarot_mood_30d');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    return () => {
      try {
        oscRef.current?.stop();
        audioCtxRef.current?.close();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const toggleOmChantTone = () => {
    if (mantraPlaying) {
      oscRef.current?.stop();
      oscRef.current = null;
      setMantraPlaying(false);
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(136.1, ctx.currentTime); // Classical Om frequency
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    setMantraPlaying(true);
    trackAnalyticsEvent('/numerology-vastu-suite', 'mantra_om_audio', 'calculator_run');
  };

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
      }),
    [activeKundli]
  );

  const loShu = useMemo(() => calculateLoShuGrid(dob), [dob]);
  const chaldean = useMemo(() => evaluateChaldeanIdentifier(identifier, idCategory), [identifier, idCategory]);
  const gems = useMemo(() => recommendGemstonesAndRudraksha(kundli), [kundli]);

  const multiMatrix = useMemo(() => {
    const candidates: BirthInput[] = [
      { name: 'Candidate A (Jaipur)', date: '1996-11-18', time: '09:15', latitude: 26.9124, longitude: 75.7873, timezoneOffsetMinutes: 330 },
      { name: 'Candidate B (Pune)', date: '1997-04-06', time: '18:20', latitude: 18.5204, longitude: 73.8567, timezoneOffsetMinutes: 330 },
      { name: 'Candidate C (Lucknow)', date: '1995-12-28', time: '06:45', latitude: 26.8467, longitude: 80.9462, timezoneOffsetMinutes: 330 },
    ];
    return compareMultiPartnerMatrix(kundli.input, candidates);
  }, [kundli.input]);

  const loShuCells = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  const activeZone = MAHAVASTU_16_ZONES.find((z) => z.code === selectedZoneCode) || MAHAVASTU_16_ZONES[0];
  const filteredDreams = SWAPNA_SHASTRA_DREAMS.filter(
    (d) =>
      !dreamQuery.trim() ||
      d.keyword.toLowerCase().includes(dreamQuery.toLowerCase()) ||
      d.hindi.includes(dreamQuery) ||
      d.symbolism.toLowerCase().includes(dreamQuery.toLowerCase())
  );

  const saveMoodEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = { date: new Date().toISOString().slice(0, 10), mood: moodScore, note: moodNote.trim() || 'Daily reflection' };
    const next = [entry, ...moodLogs].slice(0, 30);
    setMoodLogs(next);
    setMoodNote('');
    try {
      localStorage.setItem('goo_tarot_mood_30d', JSON.stringify(next));
    } catch {
      // Storage quota safeguard
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Lo Shu Grid, Chaldean Numbers, 16-Zone MahaVastu, Palmistry, Swapna & Mantra"
        description="Analyze 3x3 Lo Shu Numerology Grid, Mobile/Vehicle/Brand Chaldean vibration, 16-Direction MahaVastu zones, Hastarekha Palmistry, Swapna Shastra & Multi-Partner Compatibility Matrix."
      />

      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-[#9A6D12] dark:text-amber-400">
          Vastu, Numerology, Palmistry &amp; Remedies · Features #33–#44
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0D1B3E] dark:text-white mt-1">
          {t('Lo Shu Grid, MahaVastu 16 Zones, Palmistry, Swapna & Remedies', 'लो शू ग्रिड, 16-दिशा महावास्तु, हस्तरेखा व रत्न-मंत्र')}
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E7DEC8] dark:border-slate-800 pb-3">
        {(
          [
            ['numerology', '1. Lo Shu Grid & Mobile/Vehicle/Brand Chaldean'],
            ['mahavastu', '2. 16-Direction MahaVastu Compass'],
            ['palmistry', '3. Hastarekha Palmistry & Swapna Shastra'],
            ['remedies', '4. Multi-Partner Matrix, Gems, Om Tone & Mood Log'],
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

      {tab === 'numerology' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-[#C59326]" /> 3×3 Lo Shu Grid &amp; Raj Yoga Arrows
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <label className="font-semibold">Date of Birth:</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-[260px]">
              {loShuCells.flat().map((n) => (
                <div
                  key={n}
                  className={`h-16 rounded-lg border flex flex-col items-center justify-center ${
                    loShu.counts[n] > 0
                      ? 'border-[#C59326] bg-amber-500/10 text-[#0D1B3E] dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="font-mono font-bold text-lg">
                    {loShu.counts[n] > 0 ? String(n).repeat(loShu.counts[n]) : '—'}
                  </span>
                  <span className="text-[10px]">Pos #{n}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-xs">
              {loShu.arrows.map((a) => (
                <div key={a.name} className="flex justify-between">
                  <span>{a.name} ({a.nums.join('-')})</span>
                  <span className={a.active ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                    {a.active ? 'Active Arrow' : 'Incomplete'}
                  </span>
                </div>
              ))}
              <p className="text-slate-500 pt-1">Missing Numbers: {loShu.missingNumbers.join(', ') || 'None (Full Grid)'}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-4">
            <h2 className="font-display text-xl font-bold">Mobile, Vehicle, House &amp; Brand Chaldean Optimizer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <select
                value={idCategory}
                onChange={(e) => setIdCategory(e.target.value as 'mobile' | 'vehicle' | 'house' | 'brand')}
                className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              >
                <option value="vehicle">Vehicle Plate (e.g. DL01AB1234)</option>
                <option value="mobile">Mobile Number</option>
                <option value="house">House / Flat Number</option>
                <option value="brand">Brand / Business Name</option>
              </select>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
              />
            </div>
            <div className="p-4 rounded-xl border border-[#C59326]/40 bg-[#FCFBF7] dark:bg-[#0B1124] space-y-1.5 text-xs">
              <p>Compound Chaldean Total: <strong className="font-mono text-base">{chaldean.compoundTotal}</strong></p>
              <p>Root Number &amp; Planet: <strong className="text-[#9A6D12] dark:text-amber-300">{chaldean.rootNumber} ({chaldean.rulingPlanet})</strong></p>
              <p className="text-slate-600 dark:text-slate-300">{chaldean.interpretation}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'mahavastu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 grid grid-cols-4 gap-2.5">
            {MAHAVASTU_16_ZONES.map((z) => (
              <button
                key={z.code}
                type="button"
                onClick={() => setSelectedZoneCode(z.code)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
                  selectedZoneCode === z.code
                    ? 'border-[#C59326] bg-amber-500/15'
                    : 'border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226]'
                }`}
              >
                <p className="font-mono font-bold text-sm text-[#9A6D12] dark:text-amber-400">{z.code}</p>
                <p className="text-xs font-semibold truncate">{z.element}</p>
                <p className="text-[10px] text-slate-500 truncate">{z.deity}</p>
              </button>
            ))}
          </div>
          <div className="lg:col-span-5 rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-3">
            <p className="text-xs font-mono text-[#9A6D12] dark:text-amber-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> MahaVastu Zone {activeZone.code}
            </p>
            <h2 className="font-display text-2xl font-bold">{activeZone.name}</h2>
            <p className="text-xs"><strong>Element:</strong> {activeZone.element} · <strong>Vedic Devata:</strong> {activeZone.deity}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300"><strong>Life Attribute:</strong> {activeZone.attribute}</p>
            <p className="text-xs text-slate-500"><strong>Ideal Placement &amp; Colors:</strong> {activeZone.ideal}</p>
          </div>
        </div>
      )}

      {tab === 'palmistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Hand className="w-5 h-5 text-[#C59326]" /> Hastarekha (Palmistry) Mount &amp; Line Mapper
            </h2>
            <div className="flex flex-wrap gap-2">
              {PALM_MOUNTS.map((pm, idx) => (
                <button
                  key={pm.name}
                  type="button"
                  onClick={() => setPalmIdx(idx)}
                  className={`px-3 py-1.5 text-xs rounded-lg border cursor-pointer ${
                    palmIdx === idx ? 'border-[#C59326] bg-amber-500/15 font-semibold' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {pm.name}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#FCFBF7] dark:bg-[#0B1124] space-y-1 text-xs">
              <p className="font-bold text-sm">{PALM_MOUNTS[palmIdx].name} ({PALM_MOUNTS[palmIdx].finger})</p>
              <p className="text-slate-600 dark:text-slate-300">{PALM_MOUNTS[palmIdx].meaning}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Moon className="w-5 h-5 text-[#C59326]" /> Swapna Shastra (Dream Symbolism)
            </h2>
            <input
              type="text"
              value={dreamQuery}
              onChange={(e) => setDreamQuery(e.target.value)}
              placeholder="Search dream symbol (river, elephant, snake, temple)..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {filteredDreams.map((d) => (
                <div key={d.keyword} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="font-semibold">{d.keyword} ({d.hindi})</p>
                  <p className="text-slate-500 mt-0.5">{d.symbolism}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'remedies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <Gem className="w-5 h-5 text-[#C59326]" /> Authentic Ratna &amp; Rudraksha Guide
                </h2>
                <button
                  type="button"
                  onClick={toggleOmChantTone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#C59326] text-[#9A6D12] dark:text-amber-300 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {mantraPlaying ? 'Stop 136.1 Hz Om' : 'Play 136.1 Hz Om Tone'}
                </button>
              </div>
              <div className="space-y-2 text-xs">
                {gems.map((g) => (
                  <div key={g.role} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <p className="font-semibold">{g.role}: {g.gem}</p>
                    <p className="text-slate-500">Metal: {g.metal} · Finger: {g.finger} · {g.rudraksha}</p>
                    <p className="font-mono text-[#9A6D12] dark:text-amber-400 mt-0.5">Mantra: {g.mantra}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C59326]" /> Multi-Partner Kundli Matrix (1 vs N)
              </h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                    <th className="py-1.5">Candidate</th><th>Moon/Nak</th><th>Score</th><th>Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {multiMatrix.map((m) => (
                    <tr key={m.candidateName}>
                      <td className="py-2 font-semibold">{m.candidateName}</td>
                      <td className="py-2">{m.moonSign} · {m.nakshatra}</td>
                      <td className="py-2 font-mono font-bold text-[#9A6D12] dark:text-amber-400">{m.totalScore}/36</td>
                      <td className="py-2">{m.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
            <h2 className="font-display text-xl font-bold">30-Day Local Tarot &amp; Cosmic Mood Tracker</h2>
            <form onSubmit={saveMoodEntry} className="flex flex-wrap gap-2 text-xs">
              <select
                value={moodScore}
                onChange={(e) => setMoodScore(e.target.value as 'Balanced' | 'Focused' | 'Reflective' | 'Inspired')}
                className="px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              >
                <option value="Balanced">Balanced</option>
                <option value="Focused">Focused</option>
                <option value="Reflective">Reflective</option>
                <option value="Inspired">Inspired</option>
              </select>
              <input
                type="text"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Write a brief daily note or Tarot draw reflection..."
                className="flex-1 min-w-[220px] px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-transparent"
              />
              <button type="submit" className="px-4 py-2 font-semibold rounded-lg bg-[#C59326] text-white cursor-pointer">
                Log Today
              </button>
            </form>
            {moodLogs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {moodLogs.slice(0, 6).map((l, idx) => (
                  <div key={l.date + idx} className="p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-slate-400">{l.date}</span> · <strong>{l.mood}</strong>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{l.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <MonetagDirectLinkCta placement="lifestyle_vastu" />
    </div>
  );
};
