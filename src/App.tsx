import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

const KundliPage = lazy(() => import('./pages/KundliPage').then((m) => ({ default: m.KundliPage })));
const MatchingPage = lazy(() => import('./pages/MatchingPage').then((m) => ({ default: m.MatchingPage })));
const PanchangPage = lazy(() => import('./pages/PanchangPage').then((m) => ({ default: m.PanchangPage })));
const HoroscopePage = lazy(() => import('./pages/HoroscopePage').then((m) => ({ default: m.HoroscopePage })));
const DashaDoshaYogaPage = lazy(() => import('./pages/DashaDoshaYogaPage').then((m) => ({ default: m.DashaDoshaYogaPage })));
const TarotPage = lazy(() => import('./pages/TarotPage').then((m) => ({ default: m.TarotPage })));
const NumerologyPage = lazy(() => import('./pages/NumerologyPage').then((m) => ({ default: m.NumerologyPage })));
const VastuPage = lazy(() => import('./pages/AuxiliarySystemsPage').then((m) => ({ default: m.VastuPage })));
const KpAndLalKitabPage = lazy(() => import('./pages/AuxiliarySystemsPage').then((m) => ({ default: m.KpAndLalKitabPage })));
const BabyNamesPage = lazy(() => import('./pages/AuxiliarySystemsPage').then((m) => ({ default: m.BabyNamesPage })));
const FinderToolPage = lazy(() => import('./pages/AuxiliarySystemsPage').then((m) => ({ default: m.FinderToolPage })));
const ToolsDirectoryPage = lazy(() => import('./pages/AuxiliarySystemsPage').then((m) => ({ default: m.ToolsDirectoryPage })));
const AiAstrologerPage = lazy(() => import('./pages/ConsultationsAndAiPage').then((m) => ({ default: m.AiAstrologerPage })));
const AstrologersAndConsultationPage = lazy(() =>
  import('./pages/ConsultationsAndAiPage').then((m) => ({ default: m.AstrologersAndConsultationPage }))
);
const BlogPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.BlogPage })));
const ArticleDetailPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.ArticleDetailPage })));
const AboutPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.LegalPage })));
const SitemapPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.SitemapPage })));
const NotFoundPage = lazy(() => import('./pages/BlogAndInfoPages').then((m) => ({ default: m.NotFoundPage })));
const AuthPage = lazy(() => import('./pages/AccountAndAdminPages').then((m) => ({ default: m.AuthPage })));
const UserDashboardPage = lazy(() => import('./pages/AccountAndAdminPages').then((m) => ({ default: m.UserDashboardPage })));
const AdminDashboardPage = lazy(() => import('./pages/AccountAndAdminPages').then((m) => ({ default: m.AdminDashboardPage })));

function PageFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-4">
      <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="h-48 w-full rounded-xl bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/free-kundli" element={<KundliPage />} />
              <Route path="/birth-chart" element={<KundliPage />} />
              <Route path="/kundli-matching" element={<MatchingPage />} />
              <Route path="/marriage-compatibility" element={<MatchingPage />} />
              <Route path="/panchang" element={<PanchangPage mode="panchang" />} />
              <Route path="/muhurat" element={<PanchangPage mode="muhurat" />} />
              <Route path="/rahu-kaal" element={<PanchangPage mode="rahu" />} />
              <Route path="/choghadiya" element={<PanchangPage mode="choghadiya" />} />
              <Route path="/festival-calendar" element={<PanchangPage mode="festivals" />} />
              <Route path="/hindu-calendar" element={<PanchangPage mode="festivals" />} />
              <Route path="/sunrise-sunset" element={<PanchangPage mode="sunrise" />} />
              <Route path="/horoscope" element={<HoroscopePage />} />
              <Route path="/zodiac/:sign" element={<HoroscopePage />} />
              <Route path="/dasha" element={<DashaDoshaYogaPage section="dasha" />} />
              <Route path="/dosha" element={<DashaDoshaYogaPage section="dosha" />} />
              <Route path="/yoga" element={<DashaDoshaYogaPage section="yoga" />} />
              <Route path="/manglik-calculator" element={<DashaDoshaYogaPage section="manglik" />} />
              <Route path="/sade-sati" element={<DashaDoshaYogaPage section="sadesati" />} />
              <Route path="/transits" element={<DashaDoshaYogaPage section="transits" />} />
              <Route path="/tarot" element={<TarotPage />} />
              <Route path="/numerology" element={<NumerologyPage />} />
              <Route path="/name-numerology" element={<NumerologyPage />} />
              <Route path="/lucky-number" element={<NumerologyPage />} />
              <Route path="/vastu" element={<VastuPage />} />
              <Route path="/lal-kitab" element={<KpAndLalKitabPage mode="lalkitab" />} />
              <Route path="/kp-astrology" element={<KpAndLalKitabPage mode="kp" />} />
              <Route path="/nakshatra-finder" element={<FinderToolPage finderType="nakshatra" />} />
              <Route path="/rashi-finder" element={<FinderToolPage finderType="rashi" />} />
              <Route path="/lagna-finder" element={<FinderToolPage finderType="lagna" />} />
              <Route path="/baby-names" element={<BabyNamesPage />} />
              <Route path="/tools" element={<ToolsDirectoryPage />} />
              <Route path="/ai-astrologer" element={<AiAstrologerPage />} />
              <Route path="/astrologers" element={<AstrologersAndConsultationPage />} />
              <Route path="/consultation" element={<AstrologersAndConsultationPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/articles" element={<BlogPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<LegalPage docType="privacy" />} />
              <Route path="/terms" element={<LegalPage docType="terms" />} />
              <Route path="/disclaimer" element={<LegalPage docType="disclaimer" />} />
              <Route path="/refund-policy" element={<LegalPage docType="refund" />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/dashboard" element={<UserDashboardPage initialTab="overview" />} />
              <Route path="/profile" element={<UserDashboardPage initialTab="profile" />} />
              <Route path="/saved-reports" element={<UserDashboardPage initialTab="reports" />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
