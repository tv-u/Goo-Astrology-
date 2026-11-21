import React, { useState } from 'react';
import { Printer, Share2 } from 'lucide-react';
import { BirthInputForm } from '../components/BirthInputForm';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';
import { calculateKundli, type BirthInput } from '../engine/ephemeris';
import { calculateAshtakoot, type AshtakootReport } from '../engine/ashtakoot';

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

export const MatchingPage: React.FC = () => {
  const { token, t } = useApp();
  const [brideInput, setBrideInput] = useState<BirthInput>(DEFAULT_BRIDE);
  const [groomInput, setGroomInput] = useState<BirthInput>(DEFAULT_GROOM);
  const [report, setReport] = useState<AshtakootReport>(() =>
    calculateAshtakoot(calculateKundli(DEFAULT_BRIDE), calculateKundli(DEFAULT_GROOM))
  );
  const [copiedMsg, setCopiedMsg] = useState('');

  const runMatch = (nextBride: BirthInput, nextGroom: BirthInput) => {
    const bK = calculateKundli(nextBride);
    const gK = calculateKundli(nextGroom);
    const res = calculateAshtakoot(bK, gK);
    setReport(res);
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

  const handleShare = async () => {
    const summary = `GOO ASTROLOGY Ashtakoot Match: ${brideInput.name} & ${groomInput.name} — ${report.totalScore}/36 (${report.verdict})`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedMsg(t('Report summary copied to clipboard.', 'रिपोर्ट सारांश क्लिपबोर्ड पर कॉपी हो गया।'));
    } catch {
      setCopiedMsg(summary);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Kundli Matching (36-Point Ashtakoot Gun Milan)"
        description="Complete Vedic Ashtakoot marriage compatibility calculator with Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi, and Manglik checks."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Kundli Matching & Ashtakoot Gun Milan', 'कुंडली मिलान एवं अष्टकूट गुण मिलान')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(
              '36-point Nakshatra compatibility evaluation including Nadi, Bhakoot, Gana, and Manglik cancellation checks.',
              'नाड़ी, भकूट, गण और मांगलिक परिहार नियमों सहित 36 गुणों का संपूर्ण विवाह मिलान।'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            {t('Share Summary', 'सारांश साझा करें')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            {t('PDF / Print Report', 'PDF / प्रिंट')}
          </button>
        </div>
      </div>

      {copiedMsg && <p className="text-xs font-medium text-amber-600 dark:text-amber-300">{copiedMsg}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
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

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">
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
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ashtakoot Score</p>
          <p className="text-3xl font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {report.totalScore} / 36
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{report.verdict}</p>
        </div>
        <div className="md:col-span-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>{report.recommendation}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">Manglik Check</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{report.manglikCheck.note}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">Nadi Check</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{report.nadiDosha.note}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white">Bhakoot Check</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{report.bhakootDosha.note}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Koota Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
              <th className="py-2.5 pr-4">Koota</th>
              <th className="py-2.5 pr-4">Bride</th>
              <th className="py-2.5 pr-4">Groom</th>
              <th className="py-2.5 pr-4 text-right">Obtained / Max</th>
              <th className="py-2.5">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {report.kootas.map((k) => (
              <tr key={k.name}>
                <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-white">
                  {k.name} ({k.hindiName})
                </td>
                <td className="py-3 pr-4">{k.brideValue}</td>
                <td className="py-3 pr-4">{k.groomValue}</td>
                <td className="py-3 pr-4 text-right font-mono tabular-nums font-semibold">
                  {k.obtainedScore} / {k.maxScore}
                </td>
                <td className="py-3 text-slate-600 dark:text-slate-400">{k.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
