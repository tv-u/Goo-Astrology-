import { useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../data/locales';
import { useApp } from '../context/AppContext';

interface SeoHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
}

export function SeoHead({ title, description, keywords, canonicalPath }: SeoHeadProps) {
  const { language } = useApp();

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
  }, [title, description, keywords, canonicalPath, language]);

  return null;
}
