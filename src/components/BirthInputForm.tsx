import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { CITIES_DATASET, type CityRecord } from '../data/cities';
import { resolveIndiaLocation } from '../data/indiaLocations';
import type { AyanamshaMode, BirthInput } from '../engine/ephemeris';
import { useApp } from '../context/AppContext';

interface Props {
  initialValue?: Partial<BirthInput>;
  submitLabel?: string;
  onSubmit: (input: BirthInput) => void;
  compact?: boolean;
}

export const BirthInputForm: React.FC<Props> = ({
  initialValue,
  submitLabel,
  onSubmit,
  compact = false,
}) => {
  const { t } = useApp();
  const [name, setName] = useState(initialValue?.name || 'Aarav Sharma');
  const [date, setDate] = useState(initialValue?.date || '1995-08-15');
  const [time, setTime] = useState(initialValue?.time || '14:30');
  const [unknownTime, setUnknownTime] = useState(Boolean(initialValue?.unknownBirthTime));
  const [cityQuery, setCityQuery] = useState(initialValue?.placeName || 'New Delhi, Delhi, India');
  const [selectedCity, setSelectedCity] = useState<CityRecord>(CITIES_DATASET[0]);
  const [latitude, setLatitude] = useState(initialValue?.latitude ?? 28.6139);
  const [longitude, setLongitude] = useState(initialValue?.longitude ?? 77.209);
  const [tzOffset, setTzOffset] = useState(initialValue?.timezoneOffsetMinutes ?? 330);
  const [tzName, setTzName] = useState(initialValue?.timezoneName || 'Asia/Kolkata');
  const [ayanamsha, setAyanamsha] = useState<AyanamshaMode>(initialValue?.ayanamsha || 'lahiri');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedCoords, setShowAdvancedCoords] = useState(false);
  const [error, setError] = useState('');

  const resolution = resolveIndiaLocation(cityQuery);
  const suggestions = resolution.matches;

  const handleSelectCity = (c: CityRecord) => {
    setSelectedCity(c);
    setCityQuery(`${c.city}, ${c.state}, ${c.country}`);
    setLatitude(c.latitude);
    setLongitude(c.longitude);
    setTzOffset(c.timezoneOffsetMinutes);
    setTzName(c.timezoneName);
    setShowSuggestions(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError(t('Please enter a name.', 'कृपया नाम दर्ज करें।'));
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError(t('Please select a valid birth date.', 'कृपया सही जन्म तिथि चुनें।'));
      return;
    }
    if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError(t('Latitude must be between -90 and 90.', 'अक्षांश -90 से 90 के बीच होना चाहिए।'));
      return;
    }
    if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError(t('Longitude must be between -180 and 180.', 'देशांतर -180 से 180 के बीच होना चाहिए।'));
      return;
    }
    onSubmit({
      name: name.trim(),
      date,
      time: unknownTime ? '12:00' : time,
      latitude,
      longitude,
      timezoneOffsetMinutes: tzOffset,
      timezoneName: tzName,
      placeName: cityQuery || `${selectedCity.city}, ${selectedCity.country}`,
      ayanamsha,
      unknownBirthTime: unknownTime,
    });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className={`grid grid-cols-1 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            {t('Full Name', 'पूरा नाम')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            {t('Date of Birth', 'जन्म तिथि')}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            {t('Birth Time', 'जन्म समय')}
          </label>
          <input
            type="time"
            value={time}
            disabled={unknownTime}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326] text-slate-900 dark:text-slate-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={unknownTime}
              onChange={(e) => setUnknownTime(e.target.checked)}
              className="rounded border-slate-400 text-amber-500 focus:ring-amber-500"
            />
            {t('Unknown birth time (uses 12:00 noon reference)', 'जन्म समय अज्ञात (12:00 दोपहर संदर्भ)')}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            {t('Birthplace (City / District / State / Country)', 'जन्म स्थान (शहर / जिला / राज्य)')}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={cityQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search Delhi, Mumbai, Jaipur, Varanasi, London..."
              className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1326] shadow-lg">
              {(resolution.resolvedByAlias || resolution.ambiguous) && (
                <div className="px-3.5 py-1.5 text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-b border-amber-500/20">
                  {resolution.notes}
                </div>
              )}
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCity(c)}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-amber-500/10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {c.city}, {c.district}, {c.state}, {c.country}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 ml-2 shrink-0">
                    {c.latitude.toFixed(2)}°, {c.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
            <span>·</span>
            <span>{tzName} (UTC{tzOffset >= 0 ? '+' : ''}{(tzOffset / 60).toFixed(2)})</span>
            <button
              type="button"
              onClick={() => setShowAdvancedCoords((v) => !v)}
              className="text-amber-600 dark:text-amber-400 hover:underline font-sans"
            >
              {showAdvancedCoords ? t('Hide Coordinates', 'निर्देशांक छिपाएं') : t('Edit Coordinates / TZ', 'निर्देशांक बदलें')}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            {t('Ayanamsha System', 'अयनांश पद्धति')}
          </label>
          <select
            value={ayanamsha}
            onChange={(e) => setAyanamsha(e.target.value as AyanamshaMode)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="lahiri">Lahiri Chitrapaksha (Default)</option>
            <option value="kp">KP (Krishnamurti)</option>
            <option value="raman">B.V. Raman</option>
            <option value="tropical">Tropical Western</option>
          </select>
        </div>
      </div>

      {showAdvancedCoords && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Latitude (°)</label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Longitude (°)</label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Timezone Offset (min)</label>
            <input
              type="number"
              step="15"
              value={tzOffset}
              onChange={(e) => setTzOffset(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-500 font-medium" role="alert">
          {error}
        </p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {submitLabel || t('Generate Janam Kundli', 'जन्म कुंडली बनाएं')}
        </button>
      </div>
    </form>
  );
};
