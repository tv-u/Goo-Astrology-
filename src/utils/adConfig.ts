export type AdPlacement = 'header' | 'homepage' | 'sidebar' | 'article' | 'footer';
export type AdNetworkCode = '' | 'monetag' | 'adsense' | 'adsterra';

export const ALLOWED_AD_PLACEMENTS: readonly AdPlacement[] = [
  'header',
  'homepage',
  'sidebar',
  'article',
  'footer',
] as const;

export const ALLOWED_AD_NETWORKS: readonly AdNetworkCode[] = [
  '',
  'monetag',
  'adsense',
  'adsterra',
] as const;

// Explicit allowlist of verified HTTPS CDN hostnames for ad script tags (blocks arbitrary XSS/third-party injections)
export const ALLOWED_AD_SCRIPT_HOSTS = new Set<string>([
  'al5sm.com',
  'vemtoutcheeg.com',
  'pertawee.net',
  'dolohen.com',
  'monetag.com',
  'quge5.com',
  '3nbf4.com',
  'pagead2.googlesyndication.com',
  'highperformanceformat.com',
  'www.highperformanceformat.com',
  'effectivegatecpm.com',
  'www.effectivegatecpm.com',
]);

// Explicit allowlist for Monetag ("Montage") official Direct Link / Smartlink HTTPS domains
export const ALLOWED_DIRECT_LINK_HOSTS = new Set<string>([
  'uplcm.com',
  'otieu.com',
  'monetag.com',
  'al5sm.com',
  'poawooptugroo.com',
  'whoursie.com',
  'luglawhaulsano.net',
  'thaudray.com',
]);

export function isValidMonetagMetaToken(token: string): boolean {
  if (!token) return true;
  return /^[a-zA-Z0-9_-]{8,128}$/.test(token.trim());
}

export function isValidMonetagZoneId(zoneId: string): boolean {
  if (!zoneId) return true;
  return /^\d{4,12}$/.test(zoneId.trim());
}

export function isValidMonetagDirectUrl(rawUrl: string): boolean {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return true; // empty clears setting cleanly
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_DIRECT_LINK_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function isAllowedAdScriptUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_AD_SCRIPT_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export interface AdValidationInput {
  placement: string;
  enabled: boolean;
  networkCode: string;
  adSlotId: string;
}

export interface AdValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: {
    placement: AdPlacement;
    enabled: boolean;
    networkCode: AdNetworkCode;
    adSlotId: string;
  };
}

export function validateAdPlacementConfig(input: AdValidationInput): AdValidationResult {
  const placement = String(input.placement || '').trim() as AdPlacement;
  if (!ALLOWED_AD_PLACEMENTS.includes(placement)) {
    return { valid: false, error: 'Invalid ad placement.' };
  }

  const networkCode = String(input.networkCode || '').trim().toLowerCase() as AdNetworkCode;
  if (!ALLOWED_AD_NETWORKS.includes(networkCode)) {
    return { valid: false, error: 'Unsupported ad network. Allowed: monetag, adsense, adsterra.' };
  }

  const adSlotId = String(input.adSlotId || '').trim();
  const enabled = Boolean(input.enabled);

  if (/[<>'"`]|javascript:|data:/i.test(adSlotId)) {
    return { valid: false, error: 'Ad Zone/Slot ID contains forbidden characters or script markup.' };
  }

  if (adSlotId.length > 0) {
    if (networkCode === 'monetag') {
      const ok = /^\d{4,12}$/.test(adSlotId) || isAllowedAdScriptUrl(adSlotId);
      if (!ok) {
        return {
          valid: false,
          error: 'Monetag Zone ID must be 4–12 digits (e.g. 9123456) or an official Monetag HTTPS CDN URL.',
        };
      }
    } else if (networkCode === 'adsense') {
      const ok = /^\d{6,16}$/.test(adSlotId) || /^ca-pub-\d{10,20}[:/]\d{6,16}$/.test(adSlotId);
      if (!ok) {
        return {
          valid: false,
          error: 'AdSense slot must be numeric digits or ca-pub-XXXXXXXXXXXXXXXX:SLOTID.',
        };
      }
    } else if (networkCode === 'adsterra') {
      const ok = /^[a-fA-F0-9]{16,48}$/.test(adSlotId) || isAllowedAdScriptUrl(adSlotId);
      if (!ok) {
        return {
          valid: false,
          error: 'Adsterra key must be a valid hex key or official Adsterra HTTPS URL.',
        };
      }
    } else if (enabled) {
      return { valid: false, error: 'Select an ad network (Monetag / AdSense / Adsterra) before enabling.' };
    }
  } else if (enabled) {
    return { valid: false, error: 'Enter a valid Zone/Slot ID before enabling this placement.' };
  }

  return {
    valid: true,
    sanitized: {
      placement,
      enabled,
      networkCode,
      adSlotId,
    },
  };
}

export function sanitizeAdsTxtContent(raw: string): string {
  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/[<>]/g, '').trim())
    .filter((line) => {
      if (!line) return false;
      if (line.startsWith('#')) return line.length <= 200;
      return /^[a-zA-Z0-9.-]+\s*,\s*[a-zA-Z0-9_-]+\s*,\s*(DIRECT|RESELLER)(\s*,\s*[a-zA-Z0-9_-]+)?$/.test(line);
    });
  return lines.slice(0, 100).join('\n');
}
