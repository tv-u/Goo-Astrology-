import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../engine/constants';
import { getInterpretedHoroscopes } from '../data/horoscopes';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const HoroscopePage: React.FC = () => {
  const { sign } = useParams<{ sign?: string }>();
  const { t } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const horoscopes = useMemo(() => getInterpretedHoroscopes(today), [today]);

  const initialIdx = sign
    ? Math.max(
        0,
        ZODIAC_SIGNS.findIndex((z) => z.name.toLowerCase() === sign.toLowerCase())
      )
    : 0;
  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const [period, setPeriod] = useState<'daily' | 'tomorrow' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [compatSign2, setCompatSign2] = useState(4);

  const z = ZODIAC_SIGNS[selectedIdx];
  const h = horoscopes[selectedIdx];
  const z2 = ZODIAC_SIGNS[compatSign2];
  const sameElement = z.element === z2.element;
  const complementary =
    (z.element === 'Fire' && z2.element === 'Air') ||
    (z.element === 'Air' && z2.element === 'Fire') ||
    (z.element === 'Earth' && z2.element === 'Water') ||
    (z.element === 'Water' && z2.element === 'Earth');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title={`${z.name} (${z.hindiName}) Horoscope & Zodiac Profile`}
        description={`Interpretive daily, weekly, monthly, and yearly horoscope for ${z.name} (${z.sanskritName}), plus love, career, finance, and zodiac compatibility.`}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Horoscope & 12 Zodiac Signs', 'राशिफल एवं 12 राशियाँ')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(
              `Editorial interpretive guide · Published ${h.publishedDate}. For personal astronomical predictions, generate your Janam Kundli.`,
              `व्याख्यात्मक राशि मार्गदर्शन · प्रकाशन तिथि ${h.publishedDate}। व्यक्तिगत फलित के लिए अपनी जन्म कुंडली देखें।`
            )}
          </p>
        </div>
        <Link to="/free-kundli" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
          {t('Calculate Personal Moon & Lagna Chart →', 'व्यक्तिगत लग्न व चंद्र कुंडली बनाएं →')}
        </Link>
      </div>

      {/* 12 Zodiac Sign Selector */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2.5">
        {ZODIAC_SIGNS.map((item, idx) => (
          <Link
            key={item.name}
            to={`/zodiac/${item.name.toLowerCase()}`}
            onClick={() => setSelectedIdx(idx)}
            className={`p-3 rounded-lg border text-center transition-colors ${
              selectedIdx === idx
                ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226]'
            }`}
          >
            <div className="text-xl">{item.symbol}</div>
            <div className="text-xs font-semibold">{item.name}</div>
            <div className="text-[11px] text-slate-500">{item.hindiName}</div>
          </Link>
        ))}
      </div>

      {/* Selected Sign Overview & Period Switch */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {z.sanskritName} · {z.element} ({z.hindiElement}) · {z.modality} · Ruler: {z.rulerName}
            </p>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {z.symbol} {z.name} / {z.hindiName}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['daily', 'tomorrow', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize cursor-pointer ${
                  period === p
                    ? 'bg-amber-500 text-slate-950'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed">{h[period]}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{z.description} ({z.hindiDescription})</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[
            ['Love & Relationships', h.love],
            ['Career & Profession', h.career],
            ['Business Outlook', h.business],
            ['Finance & Wealth', h.finance],
            ['Health & Wellness', h.health],
            ['Education & Focus', h.education],
          ].map(([heading, text]) => (
            <div key={heading} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">{heading}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5">{text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div><span className="text-slate-500 block">Lucky Number</span><span className="font-semibold text-sm">{h.luckyNumber}</span></div>
          <div><span className="text-slate-500 block">Lucky Colour</span><span className="font-semibold text-sm">{h.luckyColour}</span></div>
          <div><span className="text-slate-500 block">Lucky Time</span><span className="font-semibold text-sm">{h.luckyTime}</span></div>
          <div><span className="text-slate-500 block">Traditional Gemstone</span><span className="font-semibold text-sm">{z.gemstone}</span></div>
        </div>
      </div>

      {/* Zodiac Compatibility Quick Checker */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {t('Zodiac Elemental Compatibility Checker', 'राशि तत्व अनुकूलता जांच')}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold">{z.name} ({z.element})</span>
          <span className="text-slate-400">+</span>
          <select
            value={compatSign2}
            onChange={(e) => setCompatSign2(Number(e.target.value))}
            className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          >
            {ZODIAC_SIGNS.map((item, idx) => (
              <option key={item.name} value={idx}>{item.name} ({item.hindiName})</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {sameElement
            ? `Strong Natural Affinity: Both ${z.name} and ${z2.name} share the ${z.element} element, creating intuitive mutual understanding.`
            : complementary
            ? `Supportive Complementary Pairing: ${z.element} (${z.name}) and ${z2.element} (${z2.name}) stimulate constructive balance.`
            : `Growth-Oriented Pairing: ${z.element} (${z.name}) and ${z2.element} (${z2.name}) bring contrasting rhythms—evaluate full Ashtakoot matching for marriage.`}
        </p>
      </div>
    </div>
  );
};
