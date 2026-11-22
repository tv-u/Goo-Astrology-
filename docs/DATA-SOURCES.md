# DATA-SOURCES — GOO ASTROLOGY UNLIMITED FREE

All core data sources used by GOO ASTROLOGY UNLIMITED FREE are bundled locally, deterministically generated, or versioned inside SQLite with SHA-256 verification and automatic fallback rollback (`server/syncEngine.ts`). Zero unlicensed web scrapers or mandatory paid APIs are used.

## 1. Astronomical & Ephemeris Computation

| Source | Module / Package | License | Usage | Offline Availability |
|---|---|---|---|---|
| Astronomy Engine | `astronomy-engine` (`^2.1.19`) | MIT | Solar, lunar, planetary geocentric positions, GAST, obliquity, lunar phases, eclipse predictions | 100% Offline |
| Lahiri Chitrapaksha Constants | `src/engine/ephemeris.ts` | MIT (Original code) | J2000.0 Lahiri (`23.857092°`), Raman, and KP precession constants | 100% Offline |
| Classical Parashari Rules | `src/engine/vedicResearch.ts`, `doshaYoga.ts`, `ashtakoot.ts` | Public Vedic Canon / MIT code | BAV/SAV 337 Bindu tables, KP Vimshottari sub-lords, 36-Guna Ashtakoot, Manglik cancellation rules | 100% Offline |

## 2. India Geographical Gazetteer & Calendars

| Dataset | File | Scope | Integrity Controls |
|---|---|---|---|
| States & Union Territories | `src/data/indiaLocations.ts` | All **28 States + 8 Union Territories (36 regions)** with Panchang traditions (Purnimanta, Amanta, Solar Sankranti) and primary languages | Deterministic typed TypeScript array; verified count assertions in `tests/india-i18n-reports.test.ts` |
| Verified City Gazetteer | `src/data/cities.ts` | **84+ verified cities** covering Indian state/UT capitals, tier-2 hubs, pilgrimage centers, diaspora hubs, and **historical/alternate aliases** (`Bombay`, `Calcutta`, `Madras`, `Kashi`, `Banaras`, `Allahabad`, `Baroda`, `Trivandrum`, `Pondicherry`) | Exact & fuzzy alias lookup + multi-state ambiguity warnings (`Aurangabad` MH vs BR, `Hamirpur` HP vs UP) |
| Rural 640k+ Villages | External Census of India Shapefiles | **Not bundled (`BLOCKED` `H-120`)** | Honestly flagged; users can enter exact lat/lon manually or pick the nearest verified city via Haversine distance |

## 3. Open Dataset Sync Engine (`server/syncEngine.ts`)

Seeded and versioned in SQLite (`sync_sources`, `datasets`, `sync_history`) with SHA-256 checksums, strict schema validation, and single-click rollback:
1. `ephemeris_j2000_reference` — Swiss/JPL & Lahiri J2000 reference check benchmarks.
2. `indian_cities_coordinates` — Curated Indian observatory city coordinates dataset.
3. `nakshatra_pada_encyclopedia` — 27 Nakshatra & 108 Pada metadata with ruler and syllable mappings.
4. `tarot_78_archetypes` — Complete 78-card Major & Minor Arcana interpretations.
5. `multilingual_vedic_glossary` — 12-Indian-language script glossary terms.

Corrupted payloads trigger `recovered_fallback` automatically without overwriting verified cached data.

## 4. Historical Timezone & DST Rules

- Provided via **`luxon` (`^3.7.2`)** IANA timezone database (`Asia/Kolkata`, global diaspora IANA zones such as `America/New_York`), ensuring accurate historical UTC offsets and Daylight Saving Time transitions (`resolveHistoricalTimezone`).
