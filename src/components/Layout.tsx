import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Globe2,
  Home,
  LayoutGrid,
  Mail,
  Menu,
  MessageSquare,
  Moon,
  Share2,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, type IndianLanguageCode } from '../data/locales';
import { ZODIAC_SIGNS } from '../engine/constants';
import { OfflineIndicator, PWAInstallButton } from './PwaControls';
import { AdSlot, MonetagDirectLinkCta, MonetagGlobalScript } from './AdSlot';
import { trackAnalyticsEvent } from './MonetagAndSeoExtras';

const MEGA_MENU_CATEGORIES: Array<{ title: string; links: Array<[string, string]> }> = [
  { title: 'Horoscopes (2026/27)', links: [['/horoscope', '84-Panel Rashifal'], ['/zodiac/aries', '12 Zodiac Signs'], ['/transits', '2026–2027 Transits']] },
  { title: 'Kundli & Charts', links: [['/free-kundli', 'Free Janam Kundli'], ['/brihat-kundli', 'Brihat Kundli PDF'], ['/research', 'KP, Shadbala & SAV']] },
  { title: 'Marriage & Matching', links: [['/kundli-matching', '36-Pt Ashtakoot'], ['/tamil-porutham', 'Tamil 10-Porutham'], ['/manglik-calculator', 'Manglik & Cancellations']] },
  { title: 'Panchang & Muhurat', links: [['/panchang', 'Daily Panchang'], ['/muhurat-explorer', 'Griha Pravesh Muhurat'], ['/rahu-kaal', 'Rahu Kaal & Hora']] },
  { title: 'Spiritual Prashnavali', links: [['/spiritual-tools', 'Ramshalaka 15×15'], ['/spiritual-tools', 'Hanuman 49 Yantra'], ['/spiritual-tools', 'Chalisa & Mantras']] },
  { title: 'Healing & Feng Shui', links: [['/healing-ayurveda', 'Feng Shui Kua & Bagua'], ['/healing-ayurveda', 'Ayurveda & Swarodaya'], ['/numerology-vastu-suite', 'MahaVastu 16 & Lo Shu']] },
  { title: 'Dasha, Dosha & Tools', links: [['/vedic-suite', 'Chara, Yogini & Sudarshan'], ['/prashna-varshaphal', 'Prashna & Varshaphal'], ['/tools', 'All 410+ Calculators']] },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, locale, theme, toggleTheme, user, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);

  // Feedback modal state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbStatus, setFbStatus] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    trackAnalyticsEvent(location.pathname, '', 'page_view');
    setMegaMenuOpen(false);
  }, [location.pathname]);

  // Strict 5-link Top Bar Contract
  const navLinks = [
    { to: '/free-kundli', label: locale.freeKundli },
    { to: '/horoscope', label: locale.horoscope },
    { to: '/spiritual-tools', label: t('Prashnavali', 'प्रश्नावली') },
    { to: '/healing-ayurveda', label: t('Healing & Kua', 'आयुर्वेद व वास्तु') },
    { to: '/tools', label: locale.allTools },
  ];

  const isHome = location.pathname === '/';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://gooastrology.local/';

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus(null);
    try {
      const resp = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          preferredLanguage: language,
          sourceRoute: location.pathname,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; alreadySubscribed?: boolean; error?: string };
      if (!resp.ok) {
        setNewsletterStatus(data.error || 'Could not subscribe.');
        return;
      }
      setNewsletterStatus(data.alreadySubscribed ? 'Preferences updated for your email.' : 'Subscribed to weekly Panchang & Horoscope alerts.');
      setNewsletterEmail('');
    } catch {
      setNewsletterStatus('Network error while subscribing.');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbStatus(null);
    try {
      const resp = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fbName,
          email: fbEmail,
          subject: `Portal Feedback (${location.pathname})`,
          message: fbMessage,
        }),
      });
      const data = (await resp.json()) as { ok?: boolean; error?: string };
      if (!resp.ok) {
        setFbStatus(data.error || 'Please check your feedback fields.');
        return;
      }
      setFbStatus('Thank you! Your feedback has been saved.');
      setFbMessage('');
    } catch {
      setFbStatus('Could not send feedback right now.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#0D1B3E] dark:bg-[#070B19] dark:text-[#F3F4F6] transition-colors duration-200">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#E7DEC8] dark:border-slate-800/80 bg-[#FCFBF7]/92 dark:bg-[#070B19]/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0D1B3E] dark:text-amber-300 whitespace-nowrap shrink-0"
          >
            GOO ASTROLOGY
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#334155] dark:text-slate-300">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 transition-colors hover:text-[#9A6D12] dark:hover:text-amber-300 ${
                    isActive
                      ? 'text-[#9A6D12] dark:text-amber-300 font-semibold underline underline-offset-8 decoration-[#C59326]'
                      : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={user ? '/dashboard' : '/brihat-kundli'}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-[#0D1B3E] hover:bg-[#162958] text-[#FCFBF7] border border-[#C59326]/50 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              {user ? locale.myDashboard : t('Brihat Kundli PDF', 'बृहत् कुंडली PDF')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 text-[#0D1B3E] dark:text-slate-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0D1326] px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-100"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/brihat-kundli" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800">Brihat Kundli PDF</Link>
              <Link to="/tamil-porutham" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800">Tamil 10-Porutham</Link>
              <Link to="/kundli-matching" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800">{locale.matching}</Link>
              <Link to="/panchang" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800">{locale.panchang}</Link>
              <Link to="/ai-astrologer" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#9A6D12] dark:text-amber-300">{locale.aiAstrologer}</Link>
              <Link to={user ? '/dashboard' : '/login'} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800">{user ? locale.myDashboard : locale.signIn}</Link>
            </div>
          </div>
        )}
      </header>

      {/* Workspace Utility Bar + Collapsible Mega-Menu */}
      <div className="border-b border-[#E7DEC8]/80 dark:border-slate-800/70 bg-[#F7F2E4]/75 dark:bg-[#0A1022]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569] dark:text-slate-400">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setMegaMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1 font-semibold text-[#0D1B3E] dark:text-amber-300 hover:underline cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#C59326]" />
              <span>{t('Portal Index', 'सभी श्रेणियां')}</span>
              {megaMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span aria-hidden="true">·</span>
            {!isHome && (
              <>
                <Link to="/" className="hover:text-[#9A6D12] dark:hover:text-amber-300 font-medium">{locale.home}</Link>
                <span aria-hidden="true">·</span>
              </>
            )}
            <Link to="/kundli-matching" className="hover:text-[#9A6D12] dark:hover:text-amber-300">{locale.matching}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/tamil-porutham" className="hover:text-[#9A6D12] dark:hover:text-amber-300">{t('Tamil Porutham', 'तमिल पोरुत्तम')}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/panchang" className="hover:text-[#9A6D12] dark:hover:text-amber-300">{locale.panchang}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/research" className="hover:text-[#9A6D12] dark:hover:text-amber-300">{locale.researchEngine}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/planetary-intelligence" className="hover:text-[#9A6D12] dark:hover:text-amber-300">{locale.planetaryIntel}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/vedic-suite" className="hover:text-[#9A6D12] dark:hover:text-amber-300 font-medium text-[#9A6D12] dark:text-amber-300">{t('Jaimini & Sudarshan', 'जैमिनी व सुदर्शन')}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/ai-astrologer" className="hover:text-[#9A6D12] dark:hover:text-amber-300 font-medium">{locale.aiAstrologer}</Link>
            <span aria-hidden="true">·</span>
            <Link to="/academy" className="hover:text-[#9A6D12] dark:hover:text-amber-300">{locale.academy}</Link>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <OfflineIndicator />
            <PWAInstallButton />

            <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326]">
              <Globe2 className="w-3.5 h-3.5 text-[#C59326]" />
              <select
                aria-label="Select Indian language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as IndianLanguageCode)}
                className="bg-transparent text-xs font-medium text-[#0D1B3E] dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              title={theme === 'dark' ? 'Switch to Ivory White + Gold' : 'Switch to Midnight Cosmic'}
              className="p-1.5 rounded-md border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0D1326] hover:border-[#C59326] text-[#0D1B3E] dark:text-slate-200 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-[#0D1B3E]" />}
            </button>

            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="font-semibold text-[#9A6D12] dark:text-amber-300 hover:underline whitespace-nowrap">
                {user.fullName}
              </Link>
            ) : (
              <Link to="/login" className="font-medium text-[#0D1B3E] dark:text-slate-200 hover:text-[#9A6D12] dark:hover:text-amber-300 whitespace-nowrap">
                {locale.signIn}
              </Link>
            )}
          </div>
        </div>

        {/* Collapsible Mega-Menu + 12 Zodiac Quick Jump */}
        {megaMenuOpen && (
          <div className="border-t border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#0C1226]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-xs">
                {MEGA_MENU_CATEGORIES.map((cat) => (
                  <div key={cat.title} className="space-y-1.5">
                    <p className="font-semibold uppercase tracking-wider text-[11px] text-[#9A6D12] dark:text-amber-400">{cat.title}</p>
                    <ul className="space-y-1">
                      {cat.links.map(([to, label]) => (
                        <li key={label}>
                          <Link to={to} onClick={() => setMegaMenuOpen(false)} className="text-slate-600 dark:text-slate-300 hover:text-[#9A6D12]">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
                <span className="font-semibold text-slate-500">Quick Rashifal Jump:</span>
                {ZODIAC_SIGNS.map((z) => (
                  <Link
                    key={z.name}
                    to={`/zodiac/${z.name.toLowerCase()}`}
                    onClick={() => setMegaMenuOpen(false)}
                    className="hover:text-amber-600 dark:hover:text-amber-300 font-medium"
                  >
                    {z.symbol} {z.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <MonetagGlobalScript />
      <AdSlot placement="header" />

      <main className="flex-1 pb-20 lg:pb-12">{children}</main>

      <MonetagDirectLinkCta placement="layout_footer" />
      <AdSlot placement="footer" />

      {/* Quiet Enterprise Footer + Newsletter Subscription */}
      <footer className="border-t border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#050814] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-6 gap-8 text-sm">
          <div className="col-span-2 space-y-3">
            <p className="font-display text-xl font-bold text-[#0D1B3E] dark:text-amber-300">GOO ASTROLOGY</p>
            <p className="text-xs leading-relaxed">{locale.tagline}</p>

            {/* Real Newsletter Subscription Form */}
            <form onSubmit={handleNewsletterSubmit} className="pt-2 space-y-2 max-w-sm">
              <p className="text-xs font-semibold text-[#0D1B3E] dark:text-slate-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C59326]" />
                {t('Free Weekly Panchang & Transit Newsletter', 'मुफ्त साप्ताहिक पंचांग व गोचर न्यूज़लेटर')}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-[#FCFBF7] dark:bg-[#0C1226]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#C59326] hover:bg-[#b1821e] text-white cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
              {newsletterStatus && <p className="text-[11px] text-amber-700 dark:text-amber-300">{newsletterStatus}</p>}
            </form>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">Vedic Calculators</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/free-kundli" className="hover:text-[#9A6D12]">Free Janam Kundli</Link></li>
              <li><Link to="/brihat-kundli" className="hover:text-[#9A6D12]">Brihat Kundli PDF</Link></li>
              <li><Link to="/kundli-matching" className="hover:text-[#9A6D12]">Ashtakoot Matching</Link></li>
              <li><Link to="/tamil-porutham" className="hover:text-[#9A6D12]">Tamil 10-Porutham</Link></li>
              <li><Link to="/research" className="hover:text-[#9A6D12]">Research (KP, SAV)</Link></li>
              <li><Link to="/vedic-suite" className="hover:text-[#9A6D12]">Jaimini &amp; Sudarshan</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">Horoscope &amp; Healing</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/horoscope" className="hover:text-[#9A6D12]">84-Panel Horoscope</Link></li>
              <li><Link to="/spiritual-tools" className="hover:text-[#9A6D12]">Ramshalaka &amp; Hanuman</Link></li>
              <li><Link to="/healing-ayurveda" className="hover:text-[#9A6D12]">Ayurveda &amp; Feng Shui Kua</Link></li>
              <li><Link to="/panchang" className="hover:text-[#9A6D12]">Daily Panchang</Link></li>
              <li><Link to="/muhurat-explorer" className="hover:text-[#9A6D12]">Muhurat Explorer</Link></li>
              <li><Link to="/numerology-vastu-suite" className="hover:text-[#9A6D12]">MahaVastu &amp; Lo Shu</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">Data &amp; Workspace</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/workspace" className="hover:text-[#9A6D12]">3D Map &amp; Widget Studio</Link></li>
              <li><Link to="/india-locations" className="hover:text-[#9A6D12]">India Locations (28+8)</Link></li>
              <li><Link to="/academy" className="hover:text-[#9A6D12]">Vedic Academy</Link></li>
              <li><Link to="/report-studio" className="hover:text-[#9A6D12]">Report Studio</Link></li>
              <li><Link to="/test-registry" className="hover:text-[#9A6D12]">350-Module QA</Link></li>
              <li><Link to="/admin" className="hover:text-[#9A6D12]">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">Company &amp; Support</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/about" className="hover:text-[#9A6D12]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#9A6D12]">Contact Us</Link></li>
              <li>
                <button type="button" onClick={() => setFeedbackOpen(true)} className="hover:text-[#9A6D12] cursor-pointer font-medium inline-flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#C59326]" />
                  Quick Feedback
                </button>
              </li>
              <li><Link to="/privacy-policy" className="hover:text-[#9A6D12]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#9A6D12]">Terms &amp; Conditions</Link></li>
              <li><Link to="/sitemap" className="hover:text-[#9A6D12]">HTML Sitemap</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E7DEC8] dark:border-slate-800/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} GOO ASTROLOGY UNLIMITED FREE · VSOP87 Ephemeris + Open Data Sync · Zero Mandatory Paid Keys.
        </div>
      </footer>

      {/* Compact Collapsible Floating Share & Feedback Pill (Desktop bottom-right, unobtrusive) */}
      <div className="hidden lg:flex fixed bottom-5 right-5 z-30 flex-col items-end gap-2">
        {shareOpen && (
          <div className="rounded-xl border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] p-2.5 flex items-center gap-2 text-xs shadow-lg">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`GOO ASTROLOGY UNLIMITED FREE: ${currentUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
            >
              WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Free Vedic Kundli, Horoscope & Panchang')}&url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:border-sky-500"
            >
              X
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(currentUrl);
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 1800);
              }}
              className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:border-amber-500 cursor-pointer inline-flex items-center gap-1"
            >
              {copiedUrl ? <Check className="w-3 h-3 text-emerald-500" /> : null}
              {copiedUrl ? 'Copied' : 'Copy Link'}
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            aria-label="Send quick feedback"
            className="px-3 py-2 rounded-lg border border-[#D8CBAF] dark:border-slate-700 bg-white dark:bg-[#0C1226] text-xs font-medium hover:border-[#C59326] cursor-pointer shadow-sm inline-flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C59326]" />
            Feedback
          </button>
          <button
            type="button"
            onClick={() => setShareOpen((v) => !v)}
            aria-label="Share this page"
            className="p-2 rounded-lg bg-[#0D1B3E] dark:bg-amber-500 text-white dark:text-slate-950 cursor-pointer shadow-sm"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-[#E7DEC8] dark:border-slate-700 bg-white dark:bg-[#0C1226] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Send Website Feedback</h3>
              <button type="button" onClick={() => setFeedbackOpen(false)} className="p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-sm">
              <input
                type="text"
                required
                value={fbName}
                onChange={(e) => setFbName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
              <input
                type="email"
                required
                value={fbEmail}
                onChange={(e) => setFbEmail(e.target.value)}
                placeholder="Your Email"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
              <textarea
                required
                rows={3}
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                placeholder="Suggestions, bug reports, or new calculator requests..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-600 dark:text-amber-300">{fbStatus}</span>
                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C59326] text-white cursor-pointer">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 border-t border-[#E7DEC8] dark:border-slate-800 bg-[#FCFBF7]/95 dark:bg-[#070B19]/95 backdrop-blur-md grid grid-cols-4 text-[11px]"
      >
        <Link to="/" className="flex flex-col items-center justify-center gap-0.5 text-[#0D1B3E] dark:text-slate-300">
          <Home className="w-4 h-4" />
          <span>{locale.home}</span>
        </Link>
        <Link to="/free-kundli" className="flex flex-col items-center justify-center gap-0.5 text-[#0D1B3E] dark:text-slate-300">
          <Compass className="w-4 h-4" />
          <span>Kundli</span>
        </Link>
        <Link to="/horoscope" className="flex flex-col items-center justify-center gap-0.5 text-[#9A6D12] dark:text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>{locale.horoscope}</span>
        </Link>
        <Link to="/tools" className="flex flex-col items-center justify-center gap-0.5 text-[#0D1B3E] dark:text-slate-300">
          <User className="w-4 h-4" />
          <span>{locale.allTools}</span>
        </Link>
      </nav>
    </div>
  );
};
