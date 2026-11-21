# GOO ASTROLOGY UNLIMITED FREE — Deployment Guide

## Architecture Summary
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Calculation Engine**: `astronomy-engine` (MIT License, NASA/JPL VSOP87 & ELP2000-82B analytical ephemeris) running locally in TypeScript without paid external APIs.
- **Database**: SQLite (`better-sqlite3` in Node/Express runtime; Cloudflare D1 SQLite via `migrations/0001_init.sql` in Cloudflare Pages).
- **Optional AI**: Server-side `@google/genai` (`gemini-4-hydrogen`) when `GEMINI_API_KEY` is configured, with automatic fallback to the built-in Vedic Knowledge Engine.

## GitHub -> Cloudflare Pages Setup
1. Push repository to GitHub `main` branch.
2. Connect GitHub repository in **Cloudflare Dashboard -> Workers & Pages -> Create -> Pages**.
3. Configure build settings:
   - **Framework preset**: Vite
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Provision a Cloudflare D1 database:
   ```bash
   npx wrangler d1 create goo_astrology_db
   npx wrangler d1 migrations apply goo_astrology_db --remote
   ```
5. Update `database_id` in `wrangler.toml` and bind `DB` in Cloudflare Pages Settings -> Functions -> D1 database bindings.
6. Set environment secrets in Cloudflare Pages Settings -> Environment variables:
   - `SESSION_SECRET` (random 32+ character string)
   - `GEMINI_API_KEY` (optional, enables Gemini AI responses in GOO AI Astrologer)
   - `ADMIN_PASSCODE` (optional, overrides/locks first-admin setup)
   - `RTC_PROVIDER_URL` (optional, enables live voice/video consultation rooms)
