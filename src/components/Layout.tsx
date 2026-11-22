import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Compass, Globe2, Home, Menu, Moon, Sparkles, Sun, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, type IndianLanguageCode } from '../data/locales';
import { OfflineIndicator, PWAInstallButton } from './PwaControls';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, locale, theme, toggleTheme, user, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Strict 5-link Top Bar Contract
  const navLinks = [
    { to: '/free-kundli', label: locale.freeKundli },
    { to: '/research', label: locale.researchEngine },
    { to: '/planetary-intelligence', label: locale.planetaryIntel },
    { to: '/muhurat-calendar', label: locale.muhuratCalendar },
    { to: '/tools', label: locale.allTools },
  ];

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#0D1B3E] dark:bg-[#070B19] dark:text-[#F3F4F6] transition-colors duration-200">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-[#E7DEC8] dark:border-slate-800/80 bg-[#FCFBF7]/92 dark:bg-[#070B19]/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0D1B3E] dark:text-amber-300 whitespace-nowrap shrink-0"
          >
            GOO ASTROLOGY
          </Link>

          {/* Zone 2: 5 concise single-line text nav links */}
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

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={user ? '/dashboard' : '/ai-astrologer'}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-[#0D1B3E] hover:bg-[#162958] text-[#FCFBF7] border border-[#C59326]/50 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              {user ? locale.myDashboard : locale.aiAstrologer}
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
              <Link
                to="/kundli-matching"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-100"
              >
                {locale.matching}
              </Link>
              <Link
                to="/life-analysis"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-100"
              >
                {locale.lifeAnalysis}
              </Link>
              <Link
                to="/data-tools"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-100"
              >
                {locale.dataTools}
              </Link>
              <Link
                to="/workspace"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#9A6D12] dark:text-amber-300"
              >
                {locale.workspace}
              </Link>
              <Link
                to="/ai-astrologer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#9A6D12] dark:text-amber-300"
              >
                {locale.aiAstrologer}
              </Link>
              <Link
                to={user ? '/dashboard' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-[#E7DEC8] dark:border-slate-800 text-[#0D1B3E] dark:text-slate-100"
              >
                {user ? locale.myDashboard : locale.signIn}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Compact Workspace Utility Bar (Ecosystem Hubs, 12 Indian Languages, PWA, Theme, Account) */}
      <div className="border-b border-[#E7DEC8]/80 dark:border-slate-800/70 bg-[#F7F2E4]/75 dark:bg-[#0A1022]/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569] dark:text-slate-400">
          <div className="flex items-center gap-2.5 flex-wrap">
            {!isHome && (
              <>
                <Link to="/" className="hover:text-[#9A6D12] dark:hover:text-amber-300 font-medium">
                  {locale.home}
                </Link>
                <span aria-hidden="true">·</span>
              </>
            )}
            <Link to="/kundli-matching" className="hover:text-[#9A6D12] dark:hover:text-amber-300">
              {locale.matching}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/panchang" className="hover:text-[#9A6D12] dark:hover:text-amber-300">
              {locale.panchang}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/life-analysis" className="hover:text-[#9A6D12] dark:hover:text-amber-300">
              {locale.lifeAnalysis}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/data-tools" className="hover:text-[#9A6D12] dark:hover:text-amber-300">
              {locale.dataTools}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/workspace" className="hover:text-[#9A6D12] dark:hover:text-amber-300 font-medium text-[#0D1B3E] dark:text-amber-200">
              {locale.workspace}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/test-registry" className="hover:text-[#9A6D12] dark:hover:text-amber-300">
              {t('150-Feature QA', '150-फीचर जांच')}
            </Link>
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
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="font-semibold text-[#9A6D12] dark:text-amber-300 hover:underline whitespace-nowrap"
              >
                {user.fullName}
              </Link>
            ) : (
              <Link to="/login" className="font-medium text-[#0D1B3E] dark:text-slate-200 hover:text-[#9A6D12] dark:hover:text-amber-300 whitespace-nowrap">
                {locale.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-12">{children}</main>

      {/* Quiet Enterprise Footer */}
      <footer className="border-t border-[#E7DEC8] dark:border-slate-800 bg-white dark:bg-[#050814] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="font-display text-xl font-bold text-[#0D1B3E] dark:text-amber-300">
              GOO ASTROLOGY
            </p>
            <p className="text-xs leading-relaxed">
              {locale.tagline}
            </p>
            <p className="text-xs text-slate-500">
              Asia/Kolkata · INR · 12 Indian Languages · Offline PWA
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">
              Vedic Calculators
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/free-kundli" className="hover:text-[#9A6D12]">Free Janam Kundli</Link></li>
              <li><Link to="/kundli-matching" className="hover:text-[#9A6D12]">Ashtakoot Matching</Link></li>
              <li><Link to="/research" className="hover:text-[#9A6D12]">Research (KP, Jaimini, SAV)</Link></li>
              <li><Link to="/planetary-intelligence" className="hover:text-[#9A6D12]">Planetary Intelligence &amp; Eclipses</Link></li>
              <li><Link to="/life-analysis" className="hover:text-[#9A6D12]">Life Area Analysis</Link></li>
              <li><Link to="/dasha" className="hover:text-[#9A6D12]">Vimshottari Dasha</Link></li>
              <li><Link to="/dosha" className="hover:text-[#9A6D12]">Dosha &amp; Yoga</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">
              Calendar &amp; Systems
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/panchang" className="hover:text-[#9A6D12]">Daily Panchang</Link></li>
              <li><Link to="/muhurat-calendar" className="hover:text-[#9A6D12]">Festivals, Hora &amp; Muhurat</Link></li>
              <li><Link to="/horoscope" className="hover:text-[#9A6D12]">Horoscope &amp; 12 Signs</Link></li>
              <li><Link to="/tarot" className="hover:text-[#9A6D12]">Tarot Reading</Link></li>
              <li><Link to="/numerology" className="hover:text-[#9A6D12]">Numerology</Link></li>
              <li><Link to="/vastu" className="hover:text-[#9A6D12]">Vastu &amp; Lal Kitab</Link></li>
              <li><Link to="/baby-names" className="hover:text-[#9A6D12]">Baby Names</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">
              Data &amp; Workspace
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/workspace" className="hover:text-[#9A6D12]">3D Map &amp; Widget Studio</Link></li>
              <li><Link to="/data-tools" className="hover:text-[#9A6D12]">Open Data Sync &amp; Bulk CSV</Link></li>
              <li><Link to="/ai-astrologer" className="hover:text-[#9A6D12]">GOO AI Astrologer</Link></li>
              <li><Link to="/astrologers" className="hover:text-[#9A6D12]">Astrologers Directory</Link></li>
              <li><Link to="/test-registry" className="hover:text-[#9A6D12]">150-Feature QA Registry</Link></li>
              <li><Link to="/tools" className="hover:text-[#9A6D12]">All Tools Directory</Link></li>
              <li><Link to="/admin" className="hover:text-[#9A6D12]">Admin Control Panel</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[#0D1B3E] dark:text-slate-200 text-xs uppercase tracking-wider">
              Company &amp; Legal
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/about" className="hover:text-[#9A6D12]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#9A6D12]">Contact Us</Link></li>
              <li><Link to="/blog" className="hover:text-[#9A6D12]">Articles &amp; Guides</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#9A6D12]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#9A6D12]">Terms &amp; Conditions</Link></li>
              <li><Link to="/disclaimer" className="hover:text-[#9A6D12]">Disclaimer</Link></li>
              <li><Link to="/sitemap" className="hover:text-[#9A6D12]">HTML Sitemap</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#E7DEC8] dark:border-slate-800/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} GOO ASTROLOGY UNLIMITED FREE · MIT-licensed Astronomy Engine + Open Data Sync · Zero Mandatory Paid Keys.
        </div>
      </footer>

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
        <Link to="/workspace" className="flex flex-col items-center justify-center gap-0.5 text-[#9A6D12] dark:text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>3D Studio</span>
        </Link>
        <Link to="/tools" className="flex flex-col items-center justify-center gap-0.5 text-[#0D1B3E] dark:text-slate-300">
          <User className="w-4 h-4" />
          <span>{locale.allTools}</span>
        </Link>
      </nav>
    </div>
  );
};
