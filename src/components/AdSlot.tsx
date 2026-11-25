import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  isAllowedAdScriptUrl,
  isValidMonetagZoneId,
  validateAdPlacementConfig,
  type AdPlacement,
} from '../utils/adConfig';
import { trackAnalyticsEvent } from './MonetagAndSeoExtras';
export { MonetagDirectLinkCta } from './MonetagAndSeoExtras';

/**
 * Loads Monetag ("Montage Ads") Global MultiTag script strictly when a verified numeric
 * Zone ID is configured in Admin Control Panel -> Settings or MONETAG_MULTITAG_ZONE_ID.
 * Renders nothing and injects no script if unconfigured (zero dummy/fake ad placeholders).
 */
export const MonetagGlobalScript: React.FC = () => {
  const { siteSettings } = useApp();
  const zoneId = (siteSettings.monetag_multitag_zone_id || '').trim();

  useEffect(() => {
    const existing = document.querySelector('script[data-goo-monetag-multitag]');
    if (!zoneId || !isValidMonetagZoneId(zoneId)) {
      existing?.remove();
      return;
    }

    if (existing && existing.getAttribute('data-zone') === zoneId) {
      return;
    }
    existing?.remove();

    const script = document.createElement('script');
    script.src = 'https://al5sm.com/tag.min.js';
    script.async = true;
    script.setAttribute('data-zone', zoneId);
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-goo-monetag-multitag', 'true');
    document.body.appendChild(script);
  }, [zoneId]);

  return null;
};

/**
 * Renders a real, verified advertisement container ONLY when enabled and backed by a
 * validated real network + Zone/Slot ID or allowlisted HTTPS CDN script URL.
 * Returns null completely when disabled or unconfigured (zero dummy placeholder boxes).
 */
export const AdSlot: React.FC<{ placement: AdPlacement; className?: string }> = ({
  placement,
  className = '',
}) => {
  const { adPlacements } = useApp();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const impressionSentRef = useRef(false);

  const row = adPlacements.find((a) => a.placement === placement);
  const check = row
    ? validateAdPlacementConfig({
        placement: row.placement,
        enabled: row.enabled === 1,
        networkCode: row.network_code,
        adSlotId: row.ad_slot_id,
      })
    : { valid: false };

  const isActive = Boolean(row && row.enabled === 1 && check.valid && check.sanitized?.adSlotId);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.replaceChildren();

    if (!isActive || !check.sanitized) return;
    const { networkCode, adSlotId } = check.sanitized;

    if (networkCode === 'monetag') {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      if (/^\d{4,12}$/.test(adSlotId)) {
        script.src = 'https://al5sm.com/tag.min.js';
        script.setAttribute('data-zone', adSlotId);
      } else if (isAllowedAdScriptUrl(adSlotId)) {
        script.src = adSlotId;
      }
      container.appendChild(script);
    } else if (networkCode === 'adsterra' && isAllowedAdScriptUrl(adSlotId)) {
      const script = document.createElement('script');
      script.async = true;
      script.src = adSlotId;
      container.appendChild(script);
    }
  }, [isActive, check.sanitized?.networkCode, check.sanitized?.adSlotId]);

  useEffect(() => {
    if (!isActive || impressionSentRef.current || !asideRef.current) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !impressionSentRef.current) {
          impressionSentRef.current = true;
          trackAnalyticsEvent(window.location.pathname, `ad_slot_${placement}`, 'ad_impression');
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(asideRef.current);
    return () => obs.disconnect();
  }, [isActive, placement]);

  if (!isActive || !check.sanitized) {
    return null;
  }

  const { networkCode, adSlotId } = check.sanitized;
  const [pubClient, pubSlot] = adSlotId.includes(':')
    ? adSlotId.split(':')
    : adSlotId.includes('/')
      ? adSlotId.split('/')
      : ['', adSlotId];

  return (
    <aside
      ref={asideRef}
      aria-label={`Sponsored ${placement} placement`}
      data-ad-placement={placement}
      data-ad-network={networkCode}
      className={`max-w-7xl mx-auto px-4 sm:px-6 my-4 ${className}`}
    >
      <div className="rounded-xl border border-[#E7DEC8]/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0C1226]/80 p-3 flex flex-col items-center justify-center min-h-[72px]">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
          Advertisement
        </span>
        {networkCode === 'adsense' && pubClient && pubSlot ? (
          <ins
            className="adsbygoogle block w-full text-center"
            data-ad-client={pubClient}
            data-ad-slot={pubSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <div ref={containerRef} className="w-full flex items-center justify-center min-h-[50px]" />
        )}
      </div>
    </aside>
  );
};
