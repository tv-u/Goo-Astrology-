import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Compass, Home, Menu, Moon, Sparkles, Sun, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage, theme, toggleTheme, user, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/free-kundli', label: t('Free Kundli', 'मुफ्त कुंडली') },
    { to: '/kundli-matching', label: t('Matching', 'कुंडली मिलान') },
    { to: '/panchang', label: t('Panchang', 'पंचांग') },
    { to: '/horoscope', label: t('Horoscope', 'राशिफल') },
    { to: '/tools', label: t('All Tools', 'सभी उपकरण') },
  ];

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#111827] dark:bg-[#070B19] dark:text-[#F3F4F6] transition-colors duration-200">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F8F7F4]/90 dark:bg-[#070B19]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-amber-300 whitespace-nowrap shrink-0"
          >
            GOO ASTROLOGY
          </Link>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 transition-colors hover:text-amber-600 dark:hover:text-amber-300 ${
                    isActive ? 'text-amber-600 dark:text-amber-300 underline underline-offset-8' : ''
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
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap shrink-0"
            >
              {user ? t('My Dashboard', 'मेरा डैशबोर्ड') : t('AI Astrologer', 'AI ज्योतिषी')}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1326] px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/ai-astrologer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-300"
              >
                {t('AI Astrologer', 'AI ज्योतिषी')}
              </Link>
              <Link
                to={user ? '/dashboard' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              >
                {user ? t('My Account', 'मेरा खाता') : t('Sign In', 'लॉग इन')}
              </Link>
              <Link
                to="/astrologers"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              >
                {t('Astrologers', 'ज्योतिषाचार्य')}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Compact Workspace Utility Bar (Language, Theme, Quick Account & Admin Links) */}
      <div className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-[#0A1022]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            {!isHome && (
              <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-300">
                {t('Home', 'होम')}
              </Link>
            )}
            {!isHome && <span aria-hidden="true">·</span>}
            <Link to="/ai-astrologer" className="hover:text-amber-600 dark:hover:text-amber-300">
              {t('GOO AI Astrologer', 'GOO AI ज्योतिषी')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/astrologers" className="hover:text-amber-600 dark:hover:text-amber-300">
              {t('Consultations', 'परामर्श')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/tarot" className="hover:text-amber-600 dark:hover:text-amber-300">
              {t('Tarot', 'टैरो')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/numerology" className="hover:text-amber-600 dark:hover:text-amber-300">
              {t('Numerology', 'अंकशास्त्र')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/baby-names" className="hover:text-amber-600 dark:hover:text-amber-300">
              {t('Baby Names', 'शिशु नाम')}
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/blog" className="hover:text-amber-600 dark:hover:text-amber-300">
              {t('Articles', 'लेख')}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-md border border-slate-300 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-medium cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-transparent text-slate-600 dark:text-slate-300'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 text-xs font-medium cursor-pointer ${
                  language === 'hi'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-transparent text-slate-600 dark:text-slate-300'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="p-1.5 rounded-md border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="font-medium text-amber-600 dark:text-amber-300 hover:underline whitespace-nowrap"
              >
                {user.fullName}
              </Link>
            ) : (
              <Link to="/login" className="font-medium hover:text-amber-600 dark:hover:text-amber-300 whitespace-nowrap">
                {t('Sign In', 'लॉग इन')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-12">{children}</main>

      {/* Quiet Enterprise Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#050814] text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <p className="font-display text-xl font-bold text-slate-900 dark:text-amber-300">
              GOO ASTROLOGY
            </p>
            <p className="text-xs leading-relaxed">
              {t(
                'Discover Your Stars. Understand Your Life. Free Lahiri Sidereal Vedic astrology platform.',
                'अपने नक्षत्रों को जानें। अपने जीवन को समझें। पूर्णतः निःशुल्क वैदिक ज्योतिष मंच।'
              )}
            </p>
            <p className="text-xs text-slate-500">Asia/Kolkata · INR · EN / HI / Sanskrit</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              {t('Core Calculators', 'मुख्य गणनाएं')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/free-kundli" className="hover:text-amber-500">Free Janam Kundli</Link></li>
              <li><Link to="/kundli-matching" className="hover:text-amber-500">Kundli Matching</Link></li>
              <li><Link to="/panchang" className="hover:text-amber-500">Daily Panchang</Link></li>
              <li><Link to="/muhurat" className="hover:text-amber-500">Shubh Muhurat</Link></li>
              <li><Link to="/dasha" className="hover:text-amber-500">Vimshottari Dasha</Link></li>
              <li><Link to="/dosha" className="hover:text-amber-500">Dosha Analysis</Link></li>
              <li><Link to="/yoga" className="hover:text-amber-500">Vedic Yoga Finder</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              {t('Systems & Readings', 'अन्य प्रणालियां')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/horoscope" className="hover:text-amber-500">Horoscope &amp; 12 Signs</Link></li>
              <li><Link to="/tarot" className="hover:text-amber-500">Tarot Reading</Link></li>
              <li><Link to="/numerology" className="hover:text-amber-500">Numerology</Link></li>
              <li><Link to="/vastu" className="hover:text-amber-500">Vastu Shastra</Link></li>
              <li><Link to="/lal-kitab" className="hover:text-amber-500">Lal Kitab</Link></li>
              <li><Link to="/kp-astrology" className="hover:text-amber-500">KP Astrology</Link></li>
              <li><Link to="/baby-names" className="hover:text-amber-500">Baby Name Finder</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              {t('Platform', 'मंच')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/ai-astrologer" className="hover:text-amber-500">GOO AI Astrologer</Link></li>
              <li><Link to="/astrologers" className="hover:text-amber-500">Astrologers Directory</Link></li>
              <li><Link to="/consultation" className="hover:text-amber-500">Book Consultation</Link></li>
              <li><Link to="/blog" className="hover:text-amber-500">Articles &amp; Guides</Link></li>
              <li><Link to="/tools" className="hover:text-amber-500">All 26 Free Tools</Link></li>
              <li><Link to="/dashboard" className="hover:text-amber-500">User Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-amber-500">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wider">
              {t('Company & Legal', 'संस्थान एवं नियम')}
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/about" className="hover:text-amber-500">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-amber-500">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-amber-500">Terms &amp; Conditions</Link></li>
              <li><Link to="/disclaimer" className="hover:text-amber-500">Disclaimer</Link></li>
              <li><Link to="/refund-policy" className="hover:text-amber-500">Refund Policy</Link></li>
              <li><Link to="/sitemap" className="hover:text-amber-500">HTML Sitemap</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} GOO ASTROLOGY UNLIMITED FREE · Astronomical calculations via MIT-licensed VSOP87/ELP2000 ephemeris.
        </div>
      </footer>

      {/* Mobile Bottom Navigation (< 15% viewport height) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-14 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#070B19]/95 backdrop-blur-md grid grid-cols-4 text-[11px]"
      >
        <Link to="/" className="flex flex-col items-center justify-center gap-0.5 text-slate-600 dark:text-slate-300">
          <Home className="w-4 h-4" />
          <span>{t('Home', 'होम')}</span>
        </Link>
        <Link to="/free-kundli" className="flex flex-col items-center justify-center gap-0.5 text-slate-600 dark:text-slate-300">
          <Compass className="w-4 h-4" />
          <span>{t('Kundli', 'कुंडली')}</span>
        </Link>
        <Link to="/ai-astrologer" className="flex flex-col items-center justify-center gap-0.5 text-amber-600 dark:text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>{t('AI Chat', 'AI ज्योतिष')}</span>
        </Link>
        <Link to="/tools" className="flex flex-col items-center justify-center gap-0.5 text-slate-600 dark:text-slate-300">
          <User className="w-4 h-4" />
          <span>{t('Tools', 'उपकरण')}</span>
        </Link>
      </nav>
    </div>
  );
};
