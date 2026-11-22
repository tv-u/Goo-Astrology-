# Third-Party Open-Source Libraries & License Audit

All core astronomical, calendar, charting, 3D rendering, offline storage, PDF export, and validation dependencies used in **GOO ASTROLOGY UNLIMITED FREE** are audited for license compatibility with zero mandatory paid API keys.

## 1. Runtime & Calculation Libraries (Approved Permissive Licenses)

| Package | Version | License | Purpose in GOO ASTROLOGY | Compatibility |
|---|---|---|---|---|
| `astronomy-engine` | `^2.1.19` | **MIT** | NASA/JPL VSOP87 & ELP2000-82B geocentric planetary positions, sunrise/sunset, moon phases, lunar & solar eclipses | Browser, Node.js, Cloudflare Workers |
| `luxon` | installed latest | **MIT** | Historical IANA timezone & Daylight Saving Time (DST) correction engine | Browser & Server |
| `zod` | installed latest | **MIT** | Strict schema validation for birth inputs, API requests, and dataset checksums | Browser & Server |
| `recharts` | installed latest | **MIT** | Interactive Shadbala, Ashtakavarga SAV, Life Strength & benchmark visualizations | Browser React SPA |
| `three` | installed latest | **MIT** | Interactive 3D Cosmic Zodiac Constellation Sphere & Planetary Orbit Map | Browser WebGL2 |
| `idb` | installed latest | **ISC** | IndexedDB offline storage for saved Kundlis, Panchang & Open Data Sync datasets | Browser PWA |
| `papaparse` | installed latest | **MIT** | Multi-profile CSV batch Kundli import & export | Browser & Server |
| `jspdf` | installed latest | **MIT** | Offline client-side Kundli, Relationship & Audit PDF generation | Browser |
| `vite-plugin-pwa` | installed latest | **MIT** | Service Worker precaching, Web App Manifest, offline navigation fallback | Build & PWA |
| `better-sqlite3` | `^13.2.0` | **MIT** | Local Node.js SQLite runtime matching Cloudflare D1 schema (`u-tv`) | Node.js Server |
| `express` | `^4.21.2` | **MIT** | Full-stack API server & SSR metadata/sitemap endpoints | Node.js Server |
| `react` / `react-dom` / `react-router-dom` | `19.x` / `7.x` | **MIT** | Component architecture & dynamic client routing | Browser |
| `lucide-react` | `^0.546.0` | **ISC** | Minimalist geometric iconography | Browser |
| `@google/genai` | `^2.4.0` | **Apache-2.0** | Optional server-side Gemini integration (local Vedic KB works when unset) | Node.js Server (Optional) |

## 2. Evaluated & Excluded Libraries (License / Runtime Rationale)

- **Swiss Ephemeris (`swisseph` / `pyswisseph`)**: Dual-licensed under **AGPL-3.0 / Commercial**. Excluded from bundled runtime to keep the distribution strictly permissive (MIT/ISC/Apache-2.0) and edge-compatible with Cloudflare Pages Functions (no native C/Python bindings required). Instead, `astronomy-engine` (MIT) provides sub-arcminute analytical VSOP87/ELP2000 ephemeris across Node, Browser, and Cloudflare Workers, with Lahiri Chitrapaksha, KP, and B.V. Raman Ayanamsha engines audited against J2000.0 reference checkpoints.
- **`html2canvas`**: Excluded due to modern Tailwind CSS v4 `oklch()` color parsing issues in DOM clones; replaced with native SVG-to-Canvas PNG export and `jspdf` vector/canvas rendering.
- **Paywalled Horoscope / Astro APIs**: Excluded. Zero external paid keys required.
