import React, { useState } from 'react';
import { BirthInputForm } from '../components/BirthInputForm';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { analyzeDoshasAndYogas } from '../engine/doshaYoga';
import { analyzeSadeSatiAndGochar, getLivePlanetaryTransits } from '../engine/astrologySystems';
import { ZODIAC_SIGNS } from '../engine/constants';

export const DashaDoshaYogaPage: React.FC<{
  section: 'dasha' | 'dosha' | 'yoga' | 'manglik' | 'sadesati' | 'transits';
}> = ({ section }) => {
  const { activeKundli, setActiveKundli, t } = useApp();
  const [moonSignIdx, setMoonSignIdx] = useState(activeKundli?.moonSignIndex ?? 0);

  const kundli =
    activeKundli ||
    calculateKundli({
      name: 'Sample Native',
      date: '1995-08-15',
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.209,
      timezoneOffsetMinutes: 330,
      placeName: 'New Delhi, India',
      ayanamsha: 'lahiri',
    });

  const { doshas, yogas } = analyzeDoshasAndYogas(kundli);
  const liveSky = getLivePlanetaryTransits('lahiri');
  const sadeSati = analyzeSadeSatiAndGochar(activeKundli ? activeKundli.moonSignIndex : moonSignIdx);

  const handleRecalc = (input: BirthInput) => {
    const k = calculateKundli(input);
    setActiveKundli(k);
    setMoonSignIdx(k.moonSignIndex);
  };

  const titles: Record<typeof section, string> = {
    dasha: t('Vimshottari Dasha Calculator', 'विंशोत्तरी दशा कैलकुलेटर'),
    dosha: t('Vedic Dosha Analysis (With Exception Rules)', 'वैदिक दोष विश्लेषण'),
    yoga: t('Vedic Raj Yoga & Dhan Yoga Analyzer', 'वैदिक राजयोग एवं धनयोग विश्लेषण'),
    manglik: t('Manglik (Kuja) Dosha & Cancellation Calculator', 'मांगलिक दोष एवं परिहार कैलकुलेटर'),
    sadesati: t('Shani Sade Sati & Dhaiya Calculator', 'शनि साढ़ेसाती एवं ढैय्या कैलकुलेटर'),
    transits: t('Live Planetary Transits (Gochar) & Retrograde Status', 'लाइव ग्रह गोचर एवं वक्री स्थिति'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title={titles[section]}
        description="Accurate Vedic Vimshottari Dasha, Manglik Dosha, Kaal Sarp, Raj Yoga, Sade Sati, and live astronomical planetary transits."
      />

      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          {titles[section]}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Active Subject: <span className="font-semibold text-slate-900 dark:text-white">{kundli.input.name}</span> · Lagna {kundli.ascendant.signName} · Moon {kundli.planets[1].signName}
        </p>
      </div>

      {section !== 'transits' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
          <BirthInputForm initialValue={kundli.input} onSubmit={handleRecalc} submitLabel={t('Calculate for Birth Details', 'गणना करें')} />
        </div>
      )}

      {section === 'dasha' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Current Period: <span className="font-semibold">{kundli.currentMahadasha?.lord} Mahadasha</span> →{' '}
            <span className="font-semibold">{kundli.currentAntardasha?.lord} Antardasha</span> →{' '}
            <span className="font-semibold">{kundli.currentPratyantardasha?.lord} Pratyantardasha</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kundli.dashas.map((m) => (
              <div key={m.lord + m.startDate} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">{m.lord} Mahadasha ({m.durationYears} yrs)</p>
                <p className="text-xs font-mono text-slate-500 mt-1">{m.startDate} → {m.endDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(section === 'dosha' || section === 'manglik') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(section === 'manglik' ? doshas.filter((d) => d.id === 'manglik') : doshas).map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{d.name} ({d.hindiName})</h2>
                <span className={`text-xs font-semibold ${d.present ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {d.severity}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{d.summary}</p>
              <p className="text-xs text-slate-500">Rule: {d.calculationRule}</p>
              <p className="text-xs text-slate-500">Exceptions: {d.exceptionsChecked.join(' ')}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Guidance: {d.remedialGuidance}</p>
            </div>
          ))}
        </div>
      )}

      {section === 'yoga' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {yogas.map((y) => (
            <div key={y.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{y.name} ({y.hindiName})</h2>
                <span className={`text-xs font-semibold ${y.present ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {y.present ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{y.summary}</p>
              <p className="text-xs text-slate-500">{y.classicalBasis}</p>
            </div>
          ))}
        </div>
      )}

      {(section === 'sadesati' || section === 'transits') && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {t('Shani Sade Sati & Gochar Analyzer', 'शनि साढ़ेसाती एवं गोचर विश्लेषण')}
              </h2>
              <select
                value={moonSignIdx}
                onChange={(e) => setMoonSignIdx(Number(e.target.value))}
                className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
              >
                {ZODIAC_SIGNS.map((z, idx) => (
                  <option key={z.name} value={idx}>Natal Moon: {z.name} ({z.hindiName})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Saturn Transit Sign</p>
                <p className="font-semibold mt-1">{sadeSati.saturnCurrentSign} (H{sadeSati.saturnHouseFromMoon} from Moon)</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Sade Sati Status</p>
                <p className="font-semibold mt-1">{sadeSati.sadeSatiStatus}</p>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Dhaiya Status</p>
                <p className="font-semibold mt-1">{sadeSati.dhaiyaStatus}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{sadeSati.jupiterTransitNote}</p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {t('Current Sky Planetary Positions (Lahiri Sidereal)', 'वर्तमान आकाशीय ग्रह स्थिति')}
            </h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500">
                  <th className="py-2 pr-3">Planet</th>
                  <th className="py-2 pr-3">Sign</th>
                  <th className="py-2 pr-3">Degree</th>
                  <th className="py-2 pr-3">Nakshatra</th>
                  <th className="py-2 pr-3">Speed (°/day)</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {liveSky.planets.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-3 font-semibold">{p.id}</td>
                    <td className="py-2.5 pr-3">{p.signName} ({p.hindiSign})</td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums">{p.dms}</td>
                    <td className="py-2.5 pr-3">{p.nakshatraName} P{p.pada}</td>
                    <td className="py-2.5 pr-3 font-mono tabular-nums">{p.speedDegPerDay}</td>
                    <td className="py-2.5">{p.isRetrograde ? 'Retrograde (Vakri)' : 'Direct (Margi)'}{p.isCombust ? ' · Combust' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
