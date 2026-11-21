import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { INITIAL_ARTICLES, type ArticleRecord } from '../data/articles';
import { ZODIAC_SIGNS } from '../engine/constants';
import { SeoHead } from '../components/SeoHead';
import { useApp } from '../context/AppContext';

export const BlogPage: React.FC = () => {
  const { t } = useApp();
  const [articles, setArticles] = useState<ArticleRecord[]>(INITIAL_ARTICLES);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.articles?.length) setArticles(data.articles);
      })
      .catch(() => {});
  }, []);

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category)))];
  const visible = category === 'All' ? articles : articles.filter((a) => a.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <SeoHead
        title="Vedic Astrology Articles & Research Guides"
        description="Original guides on Lahiri Ayanamsha, Ashtakoot Gun Milan, Panchang sunrise math, Vimshottari Dasha, Vastu, and Tarot."
      />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('Astrology Articles & Learning Guides', 'ज्योतिष लेख एवं ज्ञान भंडार')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Original educational articles explaining astronomical formulas and Vedic traditions.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                category === cat
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((art) => (
          <Link
            key={art.slug}
            to={`/articles/${art.slug}`}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 hover:border-amber-500 transition-colors flex flex-col justify-between space-y-3"
          >
            <div>
              <p className="text-xs text-slate-500">{art.category} · {art.publishedAt}</p>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-2">{art.title}</h2>
              {art.hindiTitle && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{art.hindiTitle}</p>}
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{art.excerpt}</p>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Read Full Guide →</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<ArticleRecord[]>(INITIAL_ARTICLES);

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.articles?.length) setArticles(data.articles);
      })
      .catch(() => {});
  }, []);

  const article = articles.find((a) => a.slug === slug) || articles[0];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <SeoHead title={article.title} description={article.excerpt} />
      <Link to="/blog" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
        ← Back to Articles
      </Link>
      <header className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <p className="text-xs text-slate-500">{article.category} · {article.publishedAt} · {article.author}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{article.title}</h1>
        {article.hindiTitle && <p className="text-base text-amber-600 dark:text-amber-400">{article.hindiTitle}</p>}
      </header>
      <div className="space-y-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
        {article.body.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>
    </article>
  );
};

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
    <SeoHead title="About Us" description="About GOO ASTROLOGY UNLIMITED FREE — our astronomical calculation standards and open-first Vedic philosophy." />
    <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">About GOO ASTROLOGY UNLIMITED FREE</h1>
    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      GOO ASTROLOGY UNLIMITED FREE was built to make mathematically accurate Indian Vedic Astrology accessible to everyone without deceptive paywalls, fabricated horoscopes, or opaque predictions.
    </p>
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
      <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Our Technical &amp; Ethical Standards</h2>
      <p>1. Ephemeris Integrity: Planetary longitudes use MIT-licensed NASA/JPL VSOP87 &amp; ELP2000-82B analytical series with Lahiri Chitrapaksha Ayanamsha.</p>
      <p>2. Zero Fake Profiles: Astrologers only appear after real account registration and Administrator approval.</p>
      <p>3. Transparent Interpretations: General zodiac articles are explicitly marked as editorial interpretations rather than personalized birth calculations.</p>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    const resp = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (resp.ok) {
      setStatus('Thank you! Your message has been recorded in our support database.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } else {
      const err = await resp.json();
      setStatus(err.error || 'Could not submit inquiry.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <SeoHead title="Contact Us & Feedback" description="Reach out to GOO ASTROLOGY UNLIMITED FREE support, feedback, or astrologer verification inquiries." />
      <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">Contact Us</h1>
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1226] p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required type="text" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
          <input required type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
        </div>
        <input required type="text" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
        <textarea required rows={4} placeholder="Your message or feedback..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1326]" />
        <button type="submit" className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-slate-950 cursor-pointer">
          Send Message
        </button>
        {status && <p className="text-xs font-medium text-amber-600 dark:text-amber-300">{status}</p>}
      </form>
    </div>
  );
};

export const LegalPage: React.FC<{ docType: 'privacy' | 'terms' | 'disclaimer' | 'refund' }> = ({ docType }) => {
  const docs = {
    privacy: {
      title: 'Privacy Policy',
      paragraphs: [
        'GOO ASTROLOGY UNLIMITED FREE respects your privacy. Public astrology calculators run directly using your provided birth details without requiring an account.',
        'When you create an account, your password is protected with salted scrypt cryptographic hashing. Authentication tokens are held strictly in runtime memory during your session rather than unencrypted local storage.',
        'You can export all your saved birth profiles and reports in JSON format or permanently delete your account anytime from your User Dashboard.',
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      paragraphs: [
        'By accessing GOO ASTROLOGY UNLIMITED FREE, you agree to use its astronomical calculators, articles, and consultation tools responsibly and lawfully.',
        'All calculators are provided free of charge. Astrologers applying to list on the platform must provide truthful credentials and await administrator verification.',
      ],
    },
    disclaimer: {
      title: 'Astrology Disclaimer',
      paragraphs: [
        'Vedic astrology, Tarot, Numerology, Vastu, and Panchang interpretations combine astronomical calculations with traditional cultural frameworks.',
        'Content on this platform is for educational, cultural, and self-reflective purposes only and does not constitute medical, legal, psychological, or financial advice.',
      ],
    },
    refund: {
      title: 'Consultation & Refund Policy',
      paragraphs: [
        'All core software calculators (Kundli, Matching, Panchang, Dasha, Dosha, Tarot, Numerology) on GOO ASTROLOGY UNLIMITED FREE are 100% free with zero fees.',
        'If optional paid human consultations are booked once a payment provider is enabled by an administrator, cancellations made at least 12 hours prior to the scheduled session are eligible for a full refund in INR.',
      ],
    },
  };
  const d = docs[docType];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">
      <SeoHead title={d.title} description={`${d.title} for GOO ASTROLOGY UNLIMITED FREE.`} />
      <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">{d.title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {d.paragraphs.map((p) => <p key={p}>{p}</p>)}
      </div>
    </div>
  );
};

export const SitemapPage: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
    <SeoHead title="HTML Sitemap" description="Complete directory of all pages, tools, and zodiac guides on GOO ASTROLOGY UNLIMITED FREE." />
    <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white">Platform Sitemap</h1>
    <p className="text-xs text-slate-500">XML Sitemap is served dynamically at <a href="/sitemap.xml" className="underline text-amber-500">/sitemap.xml</a>.</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
      {[
        ['/', 'Home'], ['/free-kundli', 'Free Kundli'], ['/kundli-matching', 'Kundli Matching'],
        ['/panchang', 'Daily Panchang'], ['/muhurat', 'Shubh Muhurat'], ['/horoscope', 'Horoscope'],
        ['/dasha', 'Vimshottari Dasha'], ['/dosha', 'Dosha Analysis'], ['/yoga', 'Vedic Yogas'],
        ['/tarot', 'Tarot Reading'], ['/numerology', 'Numerology'], ['/vastu', 'Vastu Shastra'],
        ['/lal-kitab', 'Lal Kitab'], ['/kp-astrology', 'KP Astrology'], ['/baby-names', 'Baby Names'],
        ['/tools', 'All 26 Free Tools'], ['/astrologers', 'Astrologers'], ['/consultation', 'Consultations'],
        ['/ai-astrologer', 'GOO AI Astrologer'], ['/blog', 'Blog & Articles'], ['/dashboard', 'User Dashboard'],
        ['/login', 'Sign In'], ['/register', 'Register'], ['/admin', 'Admin Dashboard'],
        ['/about', 'About Us'], ['/contact', 'Contact Us'], ['/privacy-policy', 'Privacy Policy'],
        ['/terms', 'Terms & Conditions'], ['/disclaimer', 'Disclaimer'], ['/refund-policy', 'Refund Policy'],
        ...ZODIAC_SIGNS.map((z) => [`/zodiac/${z.name.toLowerCase()}`, `${z.name} (${z.hindiName})`]),
      ].map(([path, label]) => (
        <Link key={path + label} to={path} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500">
          {label}
        </Link>
      ))}
    </div>
  </div>
);

export const NotFoundPage: React.FC = () => (
  <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
    <SeoHead title="404 – Page Not Found" description="Requested page was not found." />
    <h1 className="font-display text-5xl font-bold text-amber-500">404</h1>
    <p className="text-lg font-semibold text-slate-900 dark:text-white">This celestial coordinate was not found.</p>
    <Link to="/" className="inline-block px-5 py-2.5 text-sm font-semibold rounded-lg bg-amber-500 text-slate-950">
      Return to Home
    </Link>
  </div>
);
