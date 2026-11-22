# ARCHITECTURE — GOO ASTROLOGY UNLIMITED FREE

## System Overview

GOO ASTROLOGY UNLIMITED FREE is a full-stack Indian Vedic Astrology application built on a **100% free-first local calculation core** (no paid API keys required for astronomical charts, Panchang, Ashtakoot matching, research analytics, report generation, or deterministic Vedic Q&A).

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Frontend SPA (React 19 + TypeScript + Tailwind CSS v4 + Vite 8 + PWA)   │
│  ├─ Core Pages: Kundli, Matching, Panchang, Horoscope, Tarot, Numerology│
│  ├─ Domains A–G: Research, Planetary Intel, Life, Muhurat, Data, 3D     │
│  ├─ Domains H–Q: India Locations, Academy, Report Studio, Verification  │
│  ├─ 12 Indian Languages (`locales.ts` + `i18nKnowledge.ts` + `AppContext`)│
│  └─ Offline IndexedDB Vault (`offlineDb.ts`) + Workbox Service Worker   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTP / JSON (/api/* & /api/v1/*)
┌─────────────────────────────────▼───────────────────────────────────────┐
│ Express Backend (`server.ts` + `server/auth.ts` + `server/ai.ts`)       │
│  ├─ Zod Input Validation (`birthInputSchema`, `registerSchema`)         │
│  ├─ Auth & RBAC (scrypt + timingSafeEqual HMAC-SHA256 tokens)           │
│  ├─ Sliding-Window Rate Limiting & Single-Use Admin Bootstrap Lock      │
│  ├─ Open Dataset Sync Engine (`server/syncEngine.ts` + SHA-256 rollback)│
│  ├─ Dual AI Astrologer (Local Vedic KB default + optional Gemini proxy) │
│  └─ Dynamic 12-Language Hreflang Sitemap (`/sitemap.xml`)               │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ better-sqlite3 (WAL + FK ON)
┌─────────────────────────────────▼───────────────────────────────────────┐
│ Relational Database (`migrations/0001_init.sql` + `0002_ecosystem.sql`) │
│  ├─ 36+ tables: Users, Profiles, Birth Charts, Reading History, CMS     │
│  ├─ Ecosystem: Sync Sources, Dataset Versions, 350 Feature Flags        │
│  └─ Cloudflare D1 Compatible Schema (`wrangler.toml` binding `u-tv`)    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Ephemeris & Vedic Calculation Pipeline

1. **Astronomical Foundation (`src/engine/ephemeris.ts`)**: Uses `astronomy-engine` (MIT, VSOP87/ELP2000) to compute geocentric tropical ecliptic longitudes and velocities for Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, plus Mean Lunar Nodes (Rahu & Ketu at exact 180° opposition).
2. **Precession & Ayanamsha Modes**: Supports **Lahiri Chitrapaksha** (calibrated to `23°51'25.53"` at J2000.0 +IAU linear precession), **KP**, **Raman**, and **Tropical**.
3. **Ascendant (Lagna) Solver**: Computes Greenwich Apparent Sidereal Time (`Astronomy.SiderealTime`), Local Sidereal Time / RAMC, true obliquity of the ecliptic (`Astronomy.e_tilt`), and spherical trigonometry atan2 horizon intersection with high-latitude (`±89.9°`) numerical clamps.
4. **Divisional & Strength Engines (`src/engine/vedicResearch.ts`)**: Exact Shodashvarga D1–D60 placements, Bhava Chalit & Sripati house cusps, KP 249 Sub-Lord cusp mapping, Jaimini Chara Karakas / Karakamsha / Swamsha, classical Parashari Bhinna & Sarva Ashtakavarga (mathematical conservation `SAV === 337`), and 6-fold Shadbala Virupas/Rupas.
5. **Report Export Safety (`src/utils/reportExporter.ts`)**: `validateReportSpec()` rejects empty outputs; `buildKundliPdfDocument()` uses WinAnsi-safe sanitization for binary jsPDF downloads; `buildUnicodePrintableHtml()` preserves full 12-script Indic typography natively for browser A4 printing.

## Key Routes & Modules

- `/india-locations` (`Domain H`): 28 States + 8 UTs, historical alias resolver (`Bombay` → `Mumbai`, `Kashi` → `Varanasi`, `Allahabad` → `Prayagraj`), ambiguity detector (`Aurangabad`, `Hamirpur`), Haversine nearest city finder.
- `/verification-center` (`Domains I & Q`): Live 12-check astronomical & Vedic conservation suite (`VER-01`..`VER-12`).
- `/academy` (`Domains J & L`): 12 structured Vedic Jyotish lessons with interactive quiz grading + 12-script glossary & localization coverage audit.
- `/report-studio` (`Domain K`): Configurable D1/Dasha/Dosha/SAV report compiler exporting PDF, Unicode HTML, SVG-to-PNG, CSV, and JSON.
- `/test-registry` (`QA Dashboard`): Filterable live inspector across all 350 modules (`WORKING`, `PARTIALLY_IMPLEMENTED`, `BLOCKED`).

## Vite Chunking & Performance

`vite.config.ts` splits heavy vendor modules cleanly into `vendor-three`, `vendor-charts`, `vendor-pdf`, and `vendor-astronomy` via `build.rollupOptions.output.manualChunks`, and includes a Three.js WebGL fallback in `Cosmic3DMap.tsx` for headless or GPU-constrained browsers.
