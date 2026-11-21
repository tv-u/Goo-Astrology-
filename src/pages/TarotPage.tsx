import React, { useState } from 'react';
import { Bookmark, RotateCcw } from 'lucide-react';
import { drawTarotSpread, TAROT_DECK, type DrawnTarotCard } from '../engine/tarot';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const TarotPage: React.FC = () => {
  const { token, user, t } = useApp();
  const [spreadType, setSpreadType] = useState<'one' | 'three' | 'five' | 'love' | 'career' | 'finance' | 'daily' | 'yesno'>('three');
  const [question, setQuestion] = useState('');
  const [allowReversed, setAllowReversed] = useState(true);
  const [drawn, setDrawn] = useState<DrawnTarotCard[]>(() => drawTarotSpread('three', true));
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  const handleDraw = () => {
    setDrawn(drawTarotSpread(spreadType, allowReversed));
    setSavedNotice('');
  };

  const handleSave = async () => {
    if (!token || !user) {
      setSavedNotice(t('Sign in to save your Tarot reading.', 'रीडिंग सहेजने के लिए लॉग इन करें।'));
      return;
    }
    const resp = await fetch('/api/user/saved-readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        readingType: 'tarot',
        title: `${spreadType.toUpperCase()} Tarot${question ? `: ${question.slice(0, 40)}` : ''}`,
        payload: { spreadType, question, cards: drawn.map((d) => ({ name: d.card.name, reversed: d.isReversed, position: d.positionLabel })) },
      }),
    });
    if (resp.ok) setSavedNotice(t('Tarot reading saved to your dashboard.', 'टैरो रीडिंग आपके डैशबोर्ड में सहेजी गई।'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Tarot Reading (1, 3, 5-Card, Love, Career & Yes/No)"
        description="Draw upright and reversed cards from a complete 78-card Tarot deck for daily guidance, love, career, finance, and Yes/No spreads."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Tarot Card Reading & 78-Card Guide', 'टैरो कार्ड रीडिंग एवं 78 कार्ड ज्ञानकोश')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t(
              'Select a spread, focus on your question, and draw from the 22 Major and 56 Minor Arcana.',
              'स्प्रेड चुनें, अपना प्रश्न लिखें और 78 कार्डों के डेक से मार्गदर्शन प्राप्त करें।'
            )}
          </p>
        </div>
        <div className="lg:col-span-4 aspect-[4/3] max-h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
          <img
            src="/src/assets/images/tarot_celestial_deck_1795272508164.jpg"
            alt="Celestial gold-foil Tarot cards on slate"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['one', '1-Card'],
              ['three', '3-Card'],
              ['five', '5-Card'],
              ['daily', 'Daily'],
              ['yesno', 'Yes / No'],
              ['love', 'Love'],
              ['career', 'Career'],
              ['finance', 'Finance'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSpreadType(key)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                spreadType === key
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('Optional: Focus question (e.g., Career direction next quarter)', 'वैकल्पिक: अपना प्रश्न लिखें...')}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
          <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 px-2">
            <input
              type="checkbox"
              checked={allowReversed}
              onChange={(e) => setAllowReversed(e.target.checked)}
            />
            {t('Include Reversed', 'उल्टे कार्ड शामिल करें')}
          </label>
          <button
            type="button"
            onClick={handleDraw}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            {t('Shuffle & Draw', 'कार्ड निकालें')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {t('Save', 'सहेजें')}
          </button>
        </div>
        {savedNotice && <p className="text-xs text-amber-600 dark:text-amber-300">{savedNotice}</p>}
      </div>

      {/* Drawn Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drawn.map((item) => (
          <div key={item.positionLabel + item.card.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-3">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              {item.positionLabel} · {item.isReversed ? 'Reversed' : 'Upright'}
            </p>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {item.card.name}
            </h2>
            <p className="text-xs text-slate-500">
              {item.card.hindiName} · {item.card.arcana} Arcana · {item.card.element} · {item.card.astrology}
            </p>
            {spreadType === 'yesno' && (
              <p className="text-sm font-mono font-bold text-amber-500">
                Polarity: {item.isReversed && item.card.yesNo === 'Yes' ? 'Maybe / Delay' : item.card.yesNo}
              </p>
            )}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.isReversed ? item.card.reversedMeaning : item.card.uprightMeaning}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p>Love: {item.card.loveMeaning}</p>
              <p>Career: {item.card.careerMeaning}</p>
              <p>Finance: {item.card.financeMeaning}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tarot History & Complete 78-Card Encyclopedia */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {t('Tarot History & 78-Card Reference Deck', 'टैरो इतिहास एवं संपूर्ण 78 कार्ड संदर्भ')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Originating in 15th-century Northern Italy as Tarocchi, the 78-card structure evolved into a contemplative symbolic framework pairing Major Arcana archetypes with four elemental Minor suits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEncyclopedia((v) => !v)}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
          >
            {showEncyclopedia ? t('Hide Deck', 'डेक छिपाएं') : t('Browse All 78 Cards', 'सभी 78 कार्ड देखें')}
          </button>
        </div>
        {showEncyclopedia && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 max-h-[420px] overflow-y-auto">
            {TAROT_DECK.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">{c.name} ({c.arcana})</p>
                <p className="text-slate-500">{c.uprightKeywords.join(', ')}</p>
                <p className="text-slate-600 dark:text-slate-300">{c.uprightMeaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
