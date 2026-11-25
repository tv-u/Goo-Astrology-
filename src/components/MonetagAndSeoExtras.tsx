import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Bell, Check, Copy, ExternalLink, Image as ImageIcon, QrCode, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BirthInput, KundliResult } from '../engine/ephemeris';
import { isValidMonetagDirectUrl } from '../utils/adConfig';

export function trackAnalyticsEvent(
  route: string,
  featureKey: string,
  eventType: 'page_view' | 'calculator_run' | 'ad_impression' | 'ad_click'
): void {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        route: (route || window.location.pathname || '/').slice(0, 160),
        featureKey: featureKey.slice(0, 80),
        eventType,
      }),
    }).catch(() => {});
  } catch {
    // Analytics must never block UX
  }
}

export function encodeBirthUrlParam(input: BirthInput): string {
  try {
    const minimal = {
      n: input.name,
      d: input.date,
      t: input.time,
      la: Number(input.latitude.toFixed(4)),
      lo: Number(input.longitude.toFixed(4)),
      tz: input.timezoneOffsetMinutes,
      tn: input.timezoneName || 'Asia/Kolkata',
      pl: input.placeName || '',
      ay: input.ayanamsha || 'lahiri',
    };
    const json = JSON.stringify(minimal);
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeBirthUrlParam(token: string): BirthInput | null {
  try {
    if (!token || token.length > 1000) return null;
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed.d !== 'string' || typeof parsed.t !== 'string') return null;
    return {
      name: String(parsed.n || 'Native').slice(0, 80),
      date: String(parsed.d).slice(0, 10),
      time: String(parsed.t).slice(0, 8),
      latitude: Number(parsed.la) || 28.6139,
      longitude: Number(parsed.lo) || 77.209,
      timezoneOffsetMinutes: Number(parsed.tz) || 330,
      timezoneName: String(parsed.tn || 'Asia/Kolkata'),
      placeName: String(parsed.pl || 'New Delhi, India'),
      ayanamsha: (parsed.ay || 'lahiri') as BirthInput['ayanamsha'],
    };
  } catch {
    return null;
  }
}

export const MonetagDirectLinkCta: React.FC<{
  placement?: string;
  compact?: boolean;
  className?: string;
}> = ({ placement = 'global', compact = false, className = '' }) => {
  const { siteSettings, t } = useApp();
  const rawUrl = (siteSettings.monetag_direct_link_url || '').trim();
  const isEnabled = siteSettings.monetag_direct_link_enabled !== 'false';
  const valid = Boolean(rawUrl && isEnabled && isValidMonetagDirectUrl(rawUrl));
  const trackedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!valid || trackedRef.current || !rootRef.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      trackedRef.current = true;
      trackAnalyticsEvent(window.location.pathname, `monetag_direct_${placement}`, 'ad_impression');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !trackedRef.current) {
          trackedRef.current = true;
          trackAnalyticsEvent(window.location.pathname, `monetag_direct_${placement}`, 'ad_impression');
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, [valid, placement]);

  if (!valid) return null;

  return (
    <div ref={rootRef} className={`max-w-7xl mx-auto px-4 sm:px-6 ${compact ? 'my-3' : 'my-5'} ${className}`}>
      <div className="rounded-xl border border-[#C59326]/40 bg-gradient-to-r from-[#FCFBF7] via-[#F7F2E4] to-[#FCFBF7] dark:from-[#0C1226] dark:via-[#111936] dark:to-[#0C1226] px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#9A6D12] dark:text-amber-400">
            {t('Sponsored Partner Resource · Keeps All 410 Vedic Tools 100% Free', 'प्रायोजित सहयोगी सेवा · सभी 410 वैदिक टूल्स को निःशुल्क रखने हेतु')}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-[#0D1B3E] dark:text-white truncate">
            {t(
              'Explore Special Planetary Remedies, Compatibility & Partner Offers',
              'विशेष ग्रह उपाय, विवाह मिलान एवं सहयोगी सुझाव देखें'
            )}
          </p>
        </div>
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackAnalyticsEvent(window.location.pathname, `monetag_direct_${placement}`, 'ad_click')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white shrink-0 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t('Open Partner Offer', 'विशेष ऑफ़र देखें')}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

const SPEECH_LOCALE: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  sa: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  or: 'or-IN',
};

export const VoiceReadAloudButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const { language, t } = useApp();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const toggleSpeech = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LOCALE[language] || 'en-IN';
    utter.rate = 0.96;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
    trackAnalyticsEvent(window.location.pathname, 'voice_read_aloud', 'calculator_run');
  };

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:border-[#C59326] cursor-pointer"
    >
      {speaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-[#C59326]" />}
      {speaking ? t('Stop Reading', 'पढ़ना रोकें') : label || t('Listen (Voice)', 'सुनें (आवाज़)')}
    </button>
  );
};

export const KundliShareCardAndQr: React.FC<{ kundli: KundliResult }> = ({ kundli }) => {
  const { t } = useApp();
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/free-kundli?b=${encodeBirthUrlParam(kundli.input)}`
      : '';

  useEffect(() => {
    if (!shareUrl) return;
    QRCode.toDataURL(shareUrl, { width: 160, margin: 1, color: { dark: '#0D1B3E', light: '#FCFBF7' } })
      .then((u) => setQrUrl(u))
      .catch(() => {});
  }, [shareUrl]);

  const handleCopy = () => {
    if (!shareUrl || !navigator.clipboard) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadSharePng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#070B19';
    ctx.fillRect(0, 0, 1200, 630);
    ctx.strokeStyle = '#C59326';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, 1152, 582);

    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('GOO ASTROLOGY UNLIMITED FREE · VEDIC BIRTH PROFILE', 60, 86);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 52px serif';
    ctx.fillText(kundli.input.name.slice(0, 32), 60, 165);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '24px monospace';
    ctx.fillText(`${kundli.input.date} · ${kundli.input.time} · ${kundli.input.placeName || 'India'}`, 60, 212);

    const moon = kundli.planets[1];
    const rows = [
      `Lagna (Ascendant): ${kundli.ascendant.signName} (${kundli.ascendant.dms})`,
      `Moon Rashi & Nakshatra: ${moon.signName} · ${moon.nakshatraName} Pada ${moon.pada}`,
      `Current Mahadasha: ${kundli.currentMahadasha?.lord || '-'} / ${kundli.currentAntardasha?.lord || '-'}`,
      `Ayanamsha (${kundli.ayanamshaMode.toUpperCase()}): ${kundli.ayanamshaDms}`,
    ];
    ctx.font = '26px sans-serif';
    rows.forEach((line, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#FDE68A' : '#E2E8F0';
      ctx.fillText(line, 60, 290 + idx * 54);
    });

    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px sans-serif';
    ctx.fillText('Computed via VSOP87 Ephemeris · Scan QR or visit /free-kundli', 60, 560);

    const finishDownload = () => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `kundli-card-${kundli.input.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.click();
      trackAnalyticsEvent(window.location.pathname, 'share_png_card', 'calculator_run');
    };

    if (qrUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#FCFBF7';
        ctx.fillRect(920, 180, 210, 210);
        ctx.drawImage(img, 930, 190, 190, 190);
        finishDownload();
      };
      img.src = qrUrl;
    } else {
      finishDownload();
    }
  };

  return (
    <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7] dark:bg-[#0B1124] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt={`QR code to open ${kundli.input.name} Kundli`}
            className="w-16 h-16 rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white p-1 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg border border-dashed border-slate-400 flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6 text-slate-400" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#0D1B3E] dark:text-white">
            {t('Bookmarkable Kundli URL, QR Code & Social Share Card', 'बुकमार्क लिंक, QR कोड एवं शेयर कार्ड')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t(
              'Scan QR or copy URL to reopen this exact chart instantly across devices without signup.',
              'बिना लॉग-इन किसी भी डिवाइस पर यह कुंडली तुरंत खोलने के लिए QR स्कैन या लिंक कॉपी करें।'
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] hover:border-[#C59326] cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#C59326]" />}
          {copied ? t('Copied URL', 'लिंक कॉपी हुआ') : t('Copy Share URL', 'लिंक कॉपी करें')}
        </button>
        <button
          type="button"
          onClick={handleDownloadSharePng}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0D1B3E] dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {t('Download Share PNG', 'शेयर PNG डाउनलोड')}
        </button>
      </div>
    </div>
  );
};

export const BrowserPanchangReminder: React.FC<{ cityLabel: string; rahuKaal: string; abhijit: string }> = ({
  cityLabel,
  rahuKaal,
  abhijit,
}) => {
  const { t } = useApp();
  const [status, setStatus] = useState<string>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return localStorage.getItem('goo_panchang_reminder') === 'on' ? 'enabled' : Notification.permission;
  });

  const enableReminder = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    const perm = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (perm === 'granted') {
      localStorage.setItem('goo_panchang_reminder', 'on');
      setStatus('enabled');
      new Notification(`GOO ASTROLOGY Panchang (${cityLabel})`, {
        body: `Abhijit Muhurat: ${abhijit} | Rahu Kaal: ${rahuKaal}`,
      });
    } else {
      setStatus('denied');
    }
  };

  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={enableReminder}
        disabled={status === 'unsupported'}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] hover:border-[#C59326] cursor-pointer disabled:opacity-50"
      >
        <Bell className="w-3.5 h-3.5 text-[#C59326]" />
        {status === 'enabled'
          ? t('Daily Panchang Alert Active', 'दैनिक पंचांग अलर्ट सक्रिय')
          : status === 'denied'
            ? t('Browser Notifications Blocked', 'ब्राउज़र अलर्ट अवरुद्ध')
            : status === 'unsupported'
              ? t('Notifications Unsupported', 'अलर्ट उपलब्ध नहीं')
              : t('Enable Daily Panchang Alert', 'दैनिक पंचांग अलर्ट चालू करें')}
      </button>
    </div>
  );
};
