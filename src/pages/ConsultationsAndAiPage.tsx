import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, UserCheck } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const AiAstrologerPage: React.FC = () => {
  const { activeKundli, language, geminiConfigured, t } = useApp();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; engine?: string }[]>([
    {
      role: 'assistant',
      text: activeKundli
        ? `Namaste! I have ${activeKundli.input.name}'s calculated chart (${activeKundli.ascendant.signName} Lagna, ${activeKundli.planets[1].signName} Moon, ${activeKundli.currentMahadasha?.lord} Mahadasha). Ask me about your Dasha, Doshas, Yogas, or career D10.`
        : 'Namaste! I am GOO AI Astrologer. You can ask questions about Vedic Astrology, Nakshatras, Panchang, Tarot, or generate a Kundli first so I can analyze your exact chart.',
      engine: geminiConfigured ? 'gemini-4-hydrogen' : 'local-vedic-kb',
    },
  ]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    const nextHistory = [...messages, { role: 'user' as const, text: q }];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const resp = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language,
          kundliContext: activeKundli,
          history: nextHistory.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await resp.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || data.error || 'Unable to generate reply.',
          engine: data.engine,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Network error contacting AI service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="GOO AI Astrologer (Bilingual Vedic Assistant)"
        description="Ask GOO AI Astrologer in Hindi or English about your calculated Kundli, Dasha periods, Doshas, Panchang, Numerology, and Tarot."
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            {t('GOO AI Astrologer', 'GOO AI ज्योतिषी')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Engine: {geminiConfigured ? 'Server-side Gemini AI + Vedic Chart Context' : 'Built-in Deterministic Vedic Knowledge Engine (API-Key-Free)'}
          </p>
        </div>
        <Link to="/free-kundli" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
          {activeKundli ? `Chart Loaded: ${activeKundli.input.name} (Change)` : 'Attach Your Birth Chart →'}
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-4">
        <div className="h-[380px] overflow-y-auto space-y-3 pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'ml-10 bg-amber-500/15 text-slate-900 dark:text-amber-100'
                  : 'mr-10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090E1D] text-slate-800 dark:text-slate-200'
              }`}
            >
              <p>{m.text}</p>
              {m.engine && (
                <p className="text-[11px] font-mono text-slate-500 mt-1.5">
                  Source: {m.engine === 'gemini-4-hydrogen' ? 'Gemini AI (Grounded)' : 'Local Vedic Knowledge Base'}
                </p>
              )}
            </div>
          ))}
          {loading && <p className="text-xs text-slate-500">Analyzing chart &amp; formulating response...</p>}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('Ask about your Dasha, Manglik Dosha, Panchang, or career...', 'अपनी दशा, मांगलिक दोष या पंचांग के बारे में पूछें...')}
            className="flex-1 px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {t('Send', 'भेजें')}
          </button>
        </form>

        <p className="text-[11px] text-slate-500">
          Disclaimer: Astrological guidance is interpretive and educational; consult licensed professionals for medical, legal, or financial decisions.
        </p>
      </div>
    </div>
  );
};

interface AstrologerRow {
  id: number;
  display_name: string;
  specializations: string;
  experience_years: number;
  languages: string;
  bio: string;
  consultation_rate_inr: number;
  is_available: number;
  rating_avg: number;
  review_count: number;
}

export const AstrologersAndConsultationPage: React.FC = () => {
  const { token, user, rtcConfigured, t } = useApp();
  const [astrologers, setAstrologers] = useState<AstrologerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({
    displayName: '',
    specializations: 'Vedic Kundli, Ashtakoot Matching',
    experienceYears: 5,
    languages: 'Hindi, English',
    bio: '',
    rateInr: 0,
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedAstroId, setSelectedAstroId] = useState<number | null>(null);
  const [bookingNotes, setBookingNotes] = useState('');

  useEffect(() => {
    fetch('/api/astrologers')
      .then((r) => r.json())
      .then((data) => setAstrologers(data.astrologers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatusMsg(t('Please sign in first to submit an astrologer application.', 'आवेदन करने के लिए कृपया पहले लॉग इन करें।'));
      return;
    }
    const resp = await fetch('/api/astrologers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(applyForm),
    });
    if (resp.ok) {
      setStatusMsg(t('Application submitted! Pending Admin verification.', 'आवेदन प्राप्त हुआ! व्यवस्थापक अनुमोदन की प्रतीक्षा है।'));
      setShowApply(false);
    } else {
      const err = await resp.json();
      setStatusMsg(err.error || 'Submission failed.');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedAstroId) {
      setStatusMsg(t('Please sign in to book a consultation.', 'परामर्श बुक करने के लिए लॉग इन करें।'));
      return;
    }
    const resp = await fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        astrologerId: selectedAstroId,
        mode: 'async_query',
        scheduledFor: new Date().toISOString().slice(0, 16),
        notes: bookingNotes,
      }),
    });
    if (resp.ok) {
      setStatusMsg(t('Consultation request recorded in your Dashboard.', 'परामर्श अनुरोध आपके डैशबोर्ड में सहेजा गया।'));
      setSelectedAstroId(null);
      setBookingNotes('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <SeoHead
        title="Verified Vedic Astrologers & Consultation Booking"
        description="Browse admin-verified Vedic astrologers, apply to join as an astrologer, and submit consultation requests."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Astrologers & Consultation Platform', 'ज्योतिषाचार्य एवं परामर्श मंच')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t(
              'Only admin-verified astrologers appear here. Zero fabricated profiles or synthetic ratings.',
              'यहाँ केवल व्यवस्थापक द्वारा सत्यापित ज्योतिषाचार्य दिखाई देते हैं।'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowApply((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer shrink-0"
        >
          <UserCheck className="w-4 h-4" />
          {t('Register as Astrologer', 'ज्योतिषाचार्य के रूप में पंजीकरण करें')}
        </button>
      </div>

      {/* Honest RTC Provider Status Notice */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090E1D] p-4 text-xs text-slate-600 dark:text-slate-300">
        Live Voice/Video Status:{' '}
        {rtcConfigured
          ? 'Real-time communication provider configured.'
          : 'Live voice/video/WebRTC provider (e.g., LiveKit or Daily) is not yet configured in environment settings. Asynchronous consultation requests are fully operational and stored in the database.'}
      </div>

      {statusMsg && <p className="text-sm font-medium text-amber-600 dark:text-amber-300">{statusMsg}</p>}

      {showApply && (
        <form onSubmit={handleApply} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold">Astrologer Verification Application</h2>
          {!user && (
            <p className="text-xs text-amber-600 dark:text-amber-300">
              Please <Link to="/login" className="underline">sign in or register</Link> first before submitting.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              placeholder="Display Name (e.g., Acharya Dev)"
              value={applyForm.displayName}
              onChange={(e) => setApplyForm({ ...applyForm, displayName: e.target.value })}
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
            <input
              type="text"
              required
              placeholder="Specializations"
              value={applyForm.specializations}
              onChange={(e) => setApplyForm({ ...applyForm, specializations: e.target.value })}
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
            <input
              type="number"
              min={0}
              placeholder="Experience (Years)"
              value={applyForm.experienceYears}
              onChange={(e) => setApplyForm({ ...applyForm, experienceYears: Number(e.target.value) })}
              className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
            />
          </div>
          <textarea
            required
            rows={3}
            placeholder="Qualifications, lineage, and consultation approach..."
            value={applyForm.bio}
            onChange={(e) => setApplyForm({ ...applyForm, bio: e.target.value })}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
          <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">
            Submit for Admin Approval
          </button>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0C1226]/50 animate-pulse" />
          ))}
        </div>
      ) : astrologers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-8 text-center space-y-3">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            No Verified Astrologers Listed Yet
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            In keeping with strict authenticity, we never display synthetic astrologer profiles or fake online badges. Qualified astrologers can apply above and be approved via the Admin Verification panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {astrologers.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">{a.display_name}</h2>
                  <p className="text-xs text-slate-500">{a.experience_years} yrs · {a.languages}</p>
                </div>
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400">
                  {a.consultation_rate_inr === 0 ? 'Free' : `₹${a.consultation_rate_inr}`}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{a.specializations}</p>
              <p className="text-xs text-slate-500">{a.bio}</p>
              <button
                type="button"
                onClick={() => setSelectedAstroId(a.id)}
                className="w-full py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer"
              >
                Request Consultation
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedAstroId && (
        <form onSubmit={handleBook} className="rounded-xl border border-amber-500/50 bg-white dark:bg-[#0C1226] p-6 space-y-3">
          <h3 className="font-display text-xl font-bold">Submit Consultation Request</h3>
          <textarea
            required
            rows={3}
            value={bookingNotes}
            onChange={(e) => setBookingNotes(e.target.value)}
            placeholder="Share your birth details or question for the astrologer..."
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]"
          />
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">
              Confirm Request
            </button>
            <button type="button" onClick={() => setSelectedAstroId(null)} className="px-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
