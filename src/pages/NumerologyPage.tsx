import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { calculateNumerology } from '../engine/numerology';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const NumerologyPage: React.FC = () => {
  const { token, user, t } = useApp();
  const [name1, setName1] = useState('Aarav Sharma');
  const [dob1, setDob1] = useState('1995-08-15');
  const [name2, setName2] = useState('Ananya Verma');
  const [dob2, setDob2] = useState('1997-04-18');
  const [savedMsg, setSavedMsg] = useState('');

  const r1 = calculateNumerology(name1, dob1);
  const r2 = calculateNumerology(name2, dob2);

  const compatDiff = Math.abs((r1.lifePathNumber % 9 || 9) - (r2.lifePathNumber % 9 || 9));
  const compatSummary =
    compatDiff === 0 || compatDiff === 3 || compatDiff === 6
      ? 'Harmonious Vibrational Alignment: Shared or trinal Life Path numbers create natural rhythm.'
      : compatDiff === 1 || compatDiff === 5
      ? 'Dynamic Complementary Pair: Distinct temperaments stimulate mutual growth.'
      : 'Measured Adjustment Required: Balance communication styles and shared financial goals.';

  const handleSave = async () => {
    if (!token || !user) {
      setSavedMsg(t('Sign in to save numerology reports.', 'रिपोर्ट सहेजने के लिए लॉग इन करें।'));
      return;
    }
    const resp = await fetch('/api/user/saved-readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        readingType: 'numerology',
        title: `${r1.fullName} (LP ${r1.lifePathNumber} / Destiny ${r1.destinyNumber})`,
        payload: r1,
      }),
    });
    if (resp.ok) setSavedMsg(t('Saved to your Saved Reports dashboard.', 'अंकशास्त्र रिपोर्ट सहेजी गई।'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Numerology Calculator (Pythagorean & Chaldean)"
        description="Calculate Life Path, Destiny, Soul Urge, Personality, Birthday, Personal Year, Chaldean Name Number, and Numerology Compatibility."
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Pythagorean & Chaldean Numerology', 'अंकशास्त्र (पाइथागोरस एवं कैल्डियन)')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('Transparent letter-by-letter and digit-reduction formulas.', 'मूलांक, भाग्यांक, नामांक एवं अंक अनुकूलता की स्पष्ट गणना।')}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
        >
          <Bookmark className="w-3.5 h-3.5" />
          {t('Save Report', 'रिपोर्ट सहेजें')}
        </button>
      </div>

      {savedMsg && <p className="text-xs text-amber-600 dark:text-amber-300">{savedMsg}</p>}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Full Birth Name</label>
          <input
            type="text"
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Date of Birth</label>
          <input
            type="date"
            value={dob1}
            onChange={(e) => setDob1(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          ['Life Path', r1.lifePathNumber],
          ['Destiny', r1.destinyNumber],
          ['Soul Urge', r1.soulUrgeNumber],
          ['Personality', r1.personalityNumber],
          ['Birthday', r1.birthdayNumber],
          ['Personal Year', r1.personalYearNumber],
          ['Chaldean', r1.chaldeanNameNumber],
        ].map(([label, val]) => (
          <div key={String(label)} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4 text-center">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">{val}</p>
          </div>
        ))}
      </div>

      {/* Step-by-step calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {r1.calculations.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-white">{c.label}</h2>
              <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">{c.result}</span>
            </div>
            <p className="text-xs font-mono text-slate-500">{c.formula}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{c.meaning}</p>
          </div>
        ))}
      </div>

      {/* Compatibility Numerology */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t('Partner Numerology Compatibility', 'अंकशास्त्र अनुकूलता मिलान')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            placeholder="Partner Name"
            className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
          <input
            type="date"
            value={dob2}
            onChange={(e) => setDob2(e.target.value)}
            className="px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {r1.fullName} (Life Path {r1.lifePathNumber}) + {r2.fullName} (Life Path {r2.lifePathNumber}): <span className="font-semibold">{compatSummary}</span>
        </p>
      </div>
    </div>
  );
};
