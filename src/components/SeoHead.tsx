import { useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/locales';
import { useApp } from '../context/AppContext';
import { isValidMonetagMetaToken } from '../utils/adConfig';

interface SeoHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function SeoHead({ title, description, keywords, canonicalPath, jsonLd }: SeoHeadProps) {
  const { language, siteSettings } = useApp();

  useEffect(() => {
    const origin = window.location.origin;
    const path = canonicalPath || window.location.pathname;
    const canonicalUrl = `${origin}${path}`;

    document.title = `${title} | GOO ASTROLOGY UNLIMITED FREE`;
    document.documentElement.lang = language;

    const setMeta = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', description);
    if (keywords) {
      setMeta('meta[name="keywords"]', 'name', 'keywords', keywords);
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', `${title} | GOO ASTROLOGY`);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

    // Optional verified Monetag publisher verification meta tag
    const monetagMeta = (siteSettings.monetag_verification_meta || '').trim();
    if (monetagMeta && isValidMonetagMetaToken(monetagMeta)) {
      setMeta('meta[name="monetag"]', 'name', 'monetag', monetagMeta);
    } else {
      document.querySelector('meta[name="monetag"]')?.remove();
    }

    // Optional Google Search Console verification meta tag
    const gscMeta = (siteSettings.google_search_console_meta || '').trim();
    if (gscMeta && /^[a-zA-Z0-9_-]{8,128}$/.test(gscMeta)) {
      setMeta('meta[name="google-site-verification"]', 'name', 'google-site-verification', gscMeta);
    }

    // Fixed Canonical Permalink
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Multi-language Indian hreflang links (same URL pattern with ?lang= for indexing clarity)
    document.querySelectorAll('link[data-goo-hreflang="true"]').forEach((node) => node.remove());
    for (const lang of SUPPORTED_LANGUAGES) {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang.hreflang;
      link.href = lang.code === 'en' ? canonicalUrl : `${canonicalUrl}?lang=${lang.code}`;
      link.setAttribute('data-goo-hreflang', 'true');
      document.head.appendChild(link);
    }

    // Structured JSON-LD Schema.org injection
    document.querySelectorAll('script[data-goo-jsonld="true"]').forEach((node) => node.remove());
    const schemas = jsonLd
      ? Array.isArray(jsonLd)
        ? jsonLd
        : [jsonLd]
      : [
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: `${title} | GOO ASTROLOGY UNLIMITED FREE`,
            applicationCategory: 'LifestyleApplication',
            operatingSystem: 'Web, PWA',
            url: canonicalUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          },
        ];
    for (const schemaObj of schemas) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-goo-jsonld', 'true');
      script.textContent = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    }
  }, [
    title,
    description,
    keywords,
    canonicalPath,
    language,
    siteSettings.monetag_verification_meta,
    siteSettings.google_search_console_meta,
    jsonLd,
  ]);

  return null;
}
