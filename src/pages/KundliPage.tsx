import React, { useEffect, useState } from 'react';
import { Bookmark, Download, Printer, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { BirthInputForm } from '../components/BirthInputForm';
import { KundliChartSvg, type ChartStyle } from '../components/KundliChartSvg';
import { MonetagDirectLinkCta } from '../components/AdSlot';
import {
  KundliShareCardAndQr,
  VoiceReadAloudButton,
  decodeBirthUrlParam,
  trackAnalyticsEvent,
} from '../components/MonetagAndSeoExtras';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { analyzeDoshasAndYogas } from '../engine/doshaYoga';

export const KundliPage: React.FC = () => {
  const { activeKundli, setActiveKundli, user, token, t } = useApp();
  const [searchParams] = useSearchParams();
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north');
  const [selectedDivisionalCode, setSelectedDivisionalCode] = useState('D1');
  const [activeTab, setActiveTab] = useState<'charts' | 'planets' | 'dasha' | 'dosha' | 'yoga'>('charts');
  const [expandedMaha, setExpandedMaha] = useState<number | null>(0);
  const [expandedAntar, setExpandedAntar] = useState<number | null>(0);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const bToken = searchParams.get('b');
    if (bToken) {
      const decoded = decodeBirthUrlParam(bToken);
      if (decoded) {
        setActiveKundli(calculateKundli(decoded));
        return;
      }
    }
    if (!activeKundli) {
      const defaultKundli = calculateKundli({
        name: 'Aarav Sharma',
        date: '1995-08-15',
        time: '14:30',
        latitude: 28.6139,
        longitude: 77.209,
        timezoneOffsetMinutes: 330,
        timezoneName: 'Asia/Kolkata',
        placeName: 'New Delhi, Delhi, India',
        ayanamsha: 'lahiri',
      });
      setActiveKundli(defaultKundli);
    }
  }, [activeKundli, searchParams, setActiveKundli]);

  const handleGenerate = async (input: BirthInput) => {
    const res = calculateKundli(input);
    setActiveKundli(res);
    setSaveMessage('');
    trackAnalyticsEvent('/free-kundli', 'generate_kundli', 'calculator_run');
    if (token) {
      fetch('/api/kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      }).catch(() => {});
    }
  };

  const handleSaveToDashboard = async () => {
    if (!activeKundli) return;
    if (!token || !user) {
      setSaveMessage(t('Please sign in to save reports to your account.', 'रिपोर्ट सहेजने के लिए कृपया लॉग इन करें।'));
      return;
    }
    const resp = await fetch('/api/user/saved-readings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        readingType: 'kundli',
        title: `${activeKundli.input.name} (${activeKundli.input.date})`,
        payload: {
          input: activeKundli.input,
          ascendant: activeKundli.ascendant.signName,
          moonSign: activeKundli.planets.find((p) => p.id === 'Moon')?.signName,
        },
      }),
    });
    if (resp.ok) {
      setSaveMessage(t('Saved to your Saved Reports dashboard.', 'रिपोर्ट आपके डैशबोर्ड में सहेजी गई।'));
    } else {
      setSaveMessage(t('Unable to save right now.', 'अभी सहेजा नहीं जा सका।'));
    }
  };

  const handleDownloadJson = () => {
    if (!activeKundli) return;
    const blob = new Blob([JSON.stringify(activeKundli, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kundli-${activeKundli.input.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analysis = activeKundli ? analyzeDoshasAndYogas(activeKundli) : null;
  const activeDivChart =
    activeKundli?.divisionalCharts.find((c) => c.code === selectedDivisionalCode) ||
    activeKundli?.divisionalCharts[0];

  // Moon & Sun Charts
  const moonPlacements = activeKundli
    ? [
        {
          id: 'Ascendant' as const,
          signIndex: activeKundli.moonSignIndex,
          signName: activeKundli.planets[1].signName,
          house: 1,
        },
        ...activeKundli.planets.map((p) => ({
          id: p.id,
          signIndex: p.signIndex,
          signName: p.signName,
          house: p.moonHouse,
        })),
      ]
    : [];

  const sunPlacements = activeKundli
    ? [
        {
          id: 'Ascendant' as const,
          signIndex: activeKundli.sunSignIndex,
          signName: activeKundli.planets[0].signName,
          house: 1,
        },
        ...activeKundli.planets.map((p) => ({
          id: p.id,
          signIndex: p.signIndex,
          signName: p.signName,
          house: ((p.signIndex - activeKundli.sunSignIndex + 12) % 12) + 1,
        })),
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Free Janam Kundli Generator (D1–D60, Dasha & Dosha)"
        description="Calculate accurate Lahiri Sidereal Janam Kundli with North, South & East Indian charts, 16 divisional Vargas, Vimshottari Dasha, and Dosha/Yoga analysis."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Free Janam Kundli & Shodashvarga Engine', 'निःशुल्क जन्म कुंडली एवं षोडशवर्ग')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(
              'Lahiri Sidereal Nirayana ephemeris with all 16 divisional charts, planetary strength, aspects, Dasha, and classical Dosha checks.',
              'लाहिड़ी निरयण एफेमेरिस पर आधारित सभी 16 वर्ग कुंडली, ग्रह बल, दृष्टि, दशा और दोष जांच।'
            )}
          </p>
        </div>
        {activeKundli && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToDashboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {t('Save Report', 'सहेजें')}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {t('Print / PDF', 'प्रिंट / PDF')}
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JSON
            </button>
            <VoiceReadAloudButton
              text={`Janam Kundli summary for ${activeKundli.input.name}. Lagna is ${activeKundli.ascendant.signName}. Moon Rashi is ${activeKundli.planets[1].signName} in ${activeKundli.planets[1].nakshatraName} Pada ${activeKundli.planets[1].pada}. Current Mahadasha is ${activeKundli.currentMahadasha?.lord} and Antardasha is ${activeKundli.currentAntardasha?.lord}.`}
            />
            <Link
              to="/ai-astrologer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('Ask AI About This Chart', 'AI से पूछें')}
            </Link>
          </div>
        )}
      </div>

      {saveMessage && (
        <div className="text-xs font-medium text-amber-600 dark:text-amber-300">{saveMessage}</div>
      )}

      {/* Input Form */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
        <BirthInputForm
          initialValue={activeKundli?.input}
          onSubmit={handleGenerate}
          submitLabel={t('Recalculate Kundli', 'कुंडली गणना करें')}
        />
      </div>

      {activeKundli && (
        <>
          {/* Key Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lagna (Ascendant)</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {activeKundli.ascendant.signName} ({activeKundli.ascendant.hindiSign})
              </p>
              <p className="text-xs font-mono text-amber-600 dark:text-amber-400">{activeKundli.ascendant.dms}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Moon Rashi &amp; Nakshatra</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {activeKundli.planets[1].signName} · {activeKundli.planets[1].nakshatraName}
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Pada {activeKundli.planets[1].pada} · Lord {activeKundli.planets[1].nakshatraLord}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current Vimshottari Dasha</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {activeKundli.currentMahadasha?.lord} / {activeKundli.currentAntardasha?.lord} / {activeKundli.currentPratyantardasha?.lord}
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Until {activeKundli.currentAntardasha?.endDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ayanamsha &amp; LST</p>
              <p className="text-base font-semibold font-mono text-slate-900 dark:text-white">
                {activeKundli.ayanamshaDms}
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {activeKundli.ayanamshaMode.toUpperCase()} · LST {activeKundli.localSiderealTimeHours.toFixed(2)}h
              </p>
            </div>
          </div>

          <KundliShareCardAndQr kundli={activeKundli} />
          <MonetagDirectLinkCta placement="kundli_top" compact />

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {(
              [
                ['charts', t('Lagna, Moon, Sun & D1–D60 Charts', 'लग्न, चंद्र, सूर्य व D1–D60 चक्र')],
                ['planets', t('Planetary Degrees & Strength', 'ग्रह स्थिति एवं बल')],
                ['dasha', t('Vimshottari Dasha (Maha/Antar/Pratyantar)', 'विंशोत्तरी दशा')],
                ['dosha', t('Dosha Analysis', 'दोष विश्लेषण')],
                ['yoga', t('Vedic Yogas', 'वैदिक योग')],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === key
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white dark:bg-[#0C1226] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'charts' && (
            <div className="space-y-8">
              {/* Style & Divisional Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
                  {(['north', 'south', 'east'] as ChartStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setChartStyle(style)}
                      className={`px-4 py-2 text-xs font-semibold capitalize cursor-pointer ${
                        chartStyle === style
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white dark:bg-[#0C1226] text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {style} Indian
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeKundli.divisionalCharts.map((dc) => (
                    <button
                      key={dc.code}
                      type="button"
                      onClick={() => setSelectedDivisionalCode(dc.code)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md border cursor-pointer ${
                        selectedDivisionalCode === dc.code
                          ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {dc.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lagna + Selected Divisional + Moon + Sun Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeDivChart && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
                    <KundliChartSvg
                      title={`${activeDivChart.code} ${activeDivChart.name}`}
                      ascendantSignIndex={activeDivChart.ascendantSignIndex}
                      placements={activeDivChart.placements}
                      styleType={chartStyle}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                      {activeDivChart.sanskritName} · {activeDivChart.purpose}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
                  <KundliChartSvg
                    title="Chandra Kundli (Moon Chart)"
                    ascendantSignIndex={activeKundli.moonSignIndex}
                    placements={moonPlacements}
                    styleType={chartStyle}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                    Emotional mind, Gochar reference &amp; lunar strength
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5">
                  <KundliChartSvg
                    title="Surya Kundli (Sun Chart)"
                    ascendantSignIndex={activeKundli.sunSignIndex}
                    placements={sunPlacements}
                    styleType={chartStyle}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
                    Vitality, soul purpose &amp; authority axis
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'planets' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3">Body</th>
                    <th className="py-2.5 pr-3">Sign</th>
                    <th className="py-2.5 pr-3">Degree</th>
                    <th className="py-2.5 pr-3">Nakshatra (Pada)</th>
                    <th className="py-2.5 pr-3">House</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3">Dignity</th>
                    <th className="py-2.5 pr-3 text-right">Strength</th>
                    <th className="py-2.5">Aspects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {[activeKundli.ascendant, ...activeKundli.planets].map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-white">{p.id}</td>
                      <td className="py-2.5 pr-3">{p.signName} ({p.hindiSign})</td>
                      <td className="py-2.5 pr-3 font-mono tabular-nums">{p.dms}</td>
                      <td className="py-2.5 pr-3">
                        {p.nakshatraName} ({p.pada}) · <span className="text-slate-500">{p.nakshatraLord}</span>
                      </td>
                      <td className="py-2.5 pr-3 font-mono">H{p.house}</td>
                      <td className="py-2.5 pr-3">
                        {[p.isRetrograde ? 'Retrograde' : 'Direct', p.isCombust ? 'Combust' : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </td>
                      <td className="py-2.5 pr-3">{p.dignity}</td>
                      <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{p.strengthScore}%</td>
                      <td className="py-2.5 font-mono text-slate-500">
                        {p.aspectsHouses.length ? p.aspectsHouses.map((h) => `H${h}`).join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'dasha' && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Vimshottari Mahadasha → Antardasha → Pratyantardasha
              </h2>
              <div className="space-y-2">
                {activeKundli.dashas.map((maha, idx) => (
                  <div key={maha.lord + maha.startDate} className="border border-slate-200 dark:border-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedMaha(expandedMaha === idx ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                    >
                      <span>{maha.lord} Mahadasha ({maha.durationYears} yrs)</span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {maha.startDate} → {maha.endDate}
                      </span>
                    </button>
                    {expandedMaha === idx && maha.children && (
                      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 bg-slate-50/60 dark:bg-[#090E1D]">
                        {maha.children.map((antar, aIdx) => (
                          <div key={antar.lord + antar.startDate}>
                            <button
                              type="button"
                              onClick={() => setExpandedAntar(expandedAntar === aIdx ? null : aIdx)}
                              className="w-full flex items-center justify-between py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                            >
                              <span>{maha.lord} / {antar.lord} Antardasha</span>
                              <span className="font-mono text-slate-500">{antar.startDate} → {antar.endDate}</span>
                            </button>
                            {expandedAntar === aIdx && antar.children && (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 pl-4">
                                {antar.children.map((prat) => (
                                  <div
                                    key={prat.lord + prat.startDate}
                                    className="text-[11px] font-mono px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226]"
                                  >
                                    {maha.lord.slice(0, 2)}-{antar.lord.slice(0, 2)}-{prat.lord}: {prat.startDate}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dosha' && analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysis.doshas.map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {d.name} ({d.hindiName})
                    </h3>
                    <span
                      className={`text-xs font-semibold ${
                        d.present
                          ? 'text-rose-500'
                          : d.severity === 'Mild / Cancelled'
                          ? 'text-amber-500'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{d.summary}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rule: {d.calculationRule}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Exceptions: {d.exceptionsChecked.join(' ')}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'yoga' && analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysis.yogas.map((y) => (
                <div key={y.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {y.name} ({y.hindiName})
                    </h3>
                    <span className={`text-xs font-semibold ${y.present ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {y.present ? 'Active' : 'Not Active'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{y.summary}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Basis: {y.classicalBasis}</p>
                </div>
              ))}
            </div>
          )}

          {/* Documented Assumptions */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090E1D] p-5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Calculation Conventions &amp; Ephemeris Documentation</p>
            <p>Ephemeris: {activeKundli.assumptions.ephemerisSource}</p>
            <p>Ayanamsha: {activeKundli.assumptions.ayanamshaSetting} · Zodiac: {activeKundli.assumptions.zodiacSystem} · Houses: {activeKundli.assumptions.houseSystem}</p>
            <p>Nodes &amp; Timezone: {activeKundli.assumptions.nodeType} · {activeKundli.assumptions.timezoneHandling}</p>
            <p>Notes: {activeKundli.assumptions.limitations.join(' ')}</p>
          </div>
        </>
      )}
    </div>
  );
};
