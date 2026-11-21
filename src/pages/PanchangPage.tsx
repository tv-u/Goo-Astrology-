import React, { useMemo, useState } from 'react';
import { CITIES_DATASET } from '../data/cities';
import { calculatePanchang } from '../engine/panchang';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const PanchangPage: React.FC<{ mode?: 'panchang' | 'muhurat' | 'rahu' | 'choghadiya' | 'festivals' | 'sunrise' }> = ({
  mode = 'panchang',
}) => {
  const { t } = useApp();
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [cityId, setCityId] = useState('new-delhi');

  const city = CITIES_DATASET.find((c) => c.id === cityId) || CITIES_DATASET[0];
  const panchang = useMemo(
    () =>
      calculatePanchang(
        dateStr,
        city.latitude,
        city.longitude,
        city.timezoneOffsetMinutes,
        `${city.city}, ${city.state}`
      ),
    [dateStr, city]
  );

  // Compute upcoming 30-day Ekadashi, Purnima, Amavasya, Sankranti events
  const upcomingEvents = useMemo(() => {
    const events: { date: string; items: string[] }[] = [];
    const base = new Date(`${dateStr}T00:00:00Z`);
    for (let i = 0; i < 30; i++) {
      const d = new Date(base.getTime() + i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      const p = calculatePanchang(iso, city.latitude, city.longitude, city.timezoneOffsetMinutes, city.city);
      if (p.specialEvents.length > 0) {
        events.push({ date: iso, items: p.specialEvents });
      }
    }
    return events;
  }, [dateStr, city]);

  const titleByMode: Record<typeof mode, string> = {
    panchang: t('Daily Vedic Panchang & Calendar', 'दैनिक वैदिक पंचांग'),
    muhurat: t('Shubh Muhurat & Auspicious Timings', 'शुभ मुहूर्त कैलकुलेटर'),
    rahu: t('Rahu Kaal, Yamaganda & Gulika Calculator', 'राहुकाल, यमगंड एवं गुलिक काल'),
    choghadiya: t('Day & Night Choghadiya Muhurat', 'दिन व रात का चौघड़िया मुहूर्त'),
    festivals: t('Hindu Calendar, Ekadashi, Purnima & Festivals', 'हिंदू पंचांग, एकादशी, पूर्णिमा एवं व्रत'),
    sunrise: t('Local Astronomical Sunrise, Sunset & Moonrise', 'स्थानीय सूर्योदय, सूर्यास्त एवं चंद्रोदय'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title={titleByMode[mode]}
        description="Accurate local Sunrise/Sunset Panchang, Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Abhijit Muhurat, Choghadiya, and Hindu Samvat calendar."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {titleByMode[mode]}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(
              'Calculated dynamically from local astronomical sunrise & sunset at your chosen city.',
              'आपके चयनित शहर के स्थानीय सूर्योदय व सूर्यास्त के आधार पर सटीक खगोलीय गणना।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C1226]"
          />
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0C1226]"
          >
            {CITIES_DATASET.map((c) => (
              <option key={c.id} value={c.id}>
                {c.city}, {c.state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Core 5 Limbs + Samvat */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          ['Tithi (तिथि)', `${panchang.tithi.name} (${panchang.tithi.paksha})`],
          ['Vara (वार)', `${panchang.vara.name} (${panchang.vara.hindiName})`],
          ['Nakshatra (नक्षत्र)', `${panchang.nakshatra.name} P${panchang.nakshatra.pada}`],
          ['Yoga (योग)', panchang.yoga.name],
          ['Karana (करण)', panchang.karana.name],
          ['Hindu Month & Samvat', `${panchang.hinduMonth} · VS ${panchang.vikramSamvat} / Shaka ${panchang.shakaSamvat}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Rise/Set & Muhurats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t('Astronomical Timings & Auspicious Muhurats', 'सूर्योदय-सूर्यास्त एवं शुभ मुहूर्त')}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500 block text-xs">Sunrise</span><span className="font-mono font-semibold">{panchang.sunrise}</span></div>
            <div><span className="text-slate-500 block text-xs">Sunset</span><span className="font-mono font-semibold">{panchang.sunset}</span></div>
            <div><span className="text-slate-500 block text-xs">Moonrise</span><span className="font-mono font-semibold">{panchang.moonrise}</span></div>
            <div><span className="text-slate-500 block text-xs">Moonset</span><span className="font-mono font-semibold">{panchang.moonset}</span></div>
            <div><span className="text-slate-500 block text-xs">Brahma Muhurat</span><span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{panchang.brahmaMuhurat}</span></div>
            <div><span className="text-slate-500 block text-xs">Abhijit Muhurat</span><span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{panchang.abhijitMuhurat}</span></div>
            <div><span className="text-slate-500 block text-xs">Amrit Kaal</span><span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{panchang.amritKaal}</span></div>
            <div><span className="text-slate-500 block text-xs">Sun / Moon Rashi</span><span className="font-semibold">{panchang.sunSign} / {panchang.moonSign}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t('Inauspicious Kaal Windows', 'अशुभ काल (त्याज्य समय)')}
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span>Rahu Kaal (राहुकाल)</span>
              <span className="font-mono font-semibold text-rose-500">{panchang.rahuKaal}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span>Yamaganda (यमगंड)</span>
              <span className="font-mono font-semibold text-amber-500">{panchang.yamaganda}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Gulika Kaal (गुलिक काल)</span>
              <span className="font-mono font-semibold text-amber-500">{panchang.gulikaKaal}</span>
            </div>
          </div>
          {panchang.specialEvents.length > 0 && (
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-300 pt-2">
              Today’s Observances: {panchang.specialEvents.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Day & Night Choghadiya */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: t('Day Choghadiya (दिन का चौघड़िया)', 'दिन का चौघड़िया'), slots: panchang.dayChoghadiya },
          { title: t('Night Choghadiya (रात्रि का चौघड़िया)', 'रात्रि का चौघड़िया'), slots: panchang.nightChoghadiya },
        ].map((grp) => (
          <div key={grp.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">{grp.title}</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs">
              {grp.slots.map((s) => (
                <div key={s.name + s.startTime} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {s.name} ({s.hindiName})
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {s.startTime} – {s.endTime}
                  </span>
                  <span
                    className={`font-semibold ${
                      s.quality === 'Good'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : s.quality === 'Avoid'
                        ? 'text-rose-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {s.quality}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming 30-day Hindu Astronomical Events */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-4">
          {t('Upcoming Ekadashi, Purnima, Amavasya & Sankranti (Next 30 Days)', 'आगामी 30 दिनों के व्रत, एकादशी, पूर्णिमा व संक्रांति')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {upcomingEvents.map((ev) => (
            <div key={ev.date} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{ev.date}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{ev.items.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
