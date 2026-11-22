# SECURITY-AUDIT — GOO ASTROLOGY UNLIMITED FREE

**Scope**: Express API (`server.ts`), Authentication (`server/auth.ts`), SQLite Persistence (`server/db.ts`), AI Proxy (`server/ai.ts`), and Browser Client (`src/`).  
**Status**: Verified via static inspection and `tests/backend-security.test.ts`.

## 1. Password Hashing & Session Security (`server/auth.ts`)

- **Password Storage**: Uses Node.js `crypto.scryptSync` with a unique per-user 16-byte random salt (`salt:derivedHex`).
- **Verification**: Uses `crypto.timingSafeEqual` to eliminate timing side-channels and gracefully guards against malformed hex hashes (`verifyPassword` returns `false` cleanly without crashing).
- **Token Signing**: HMAC-SHA256 Base64URL session tokens with 7-day expiry verified with `crypto.timingSafeEqual`.
- **Ephemeral Secret Protection**: Reads `SESSION_SECRET` (`>= 16 chars`) from environment variables; logs an informational warning in non-test server runs if absent rather than silently hardcoding a weak static string.

## 2. Role-Based Access Control & Admin Bootstrap

- **Single-Use Admin Bootstrap (`POST /api/admin/bootstrap`)**: Permits claiming the first `admin` account strictly when zero admin users exist in `users`. Any subsequent call fails deterministically with `403 Forbidden`. Supports optional `ADMIN_PASSCODE` environment verification.
- **Route Enforcement**: All `/api/admin/*` endpoints strictly enforce `requireAdmin` (`401` if unauthenticated, `403` for non-admin users).
- **Cross-User Isolation**: Protected endpoints (`/api/user/birth-profiles/:id`, `/api/user/saved-readings/:id`, `/api/user/dashboard`, `/api/user/export`, `/api/user/account`) always scope SQL queries with `WHERE id = ? AND user_id = ?` using `req.user.id` from the verified JWT.

## 3. Input Validation, SQL Injection & Data Preservation

- **Zod Schema Enforcement**: `birthInputSchema` and `registerSchema` enforce strict bounds on calendar dates (rejecting invalid dates like `2026-99-99`), coordinate ranges (`latitude ∈ [-90, 90]`, `longitude ∈ [-180, 180]`), time format (`HH:MM`), email format, minimum 8-character passwords, and clean defaults (`name: 'Subject'`, `time: '12:00'`, `timezoneOffsetMinutes: 330`, `ayanamsha: 'lahiri'`).
- **Parameterized Queries**: Every database query uses bound `?` parameters (`better-sqlite3`). Dynamic table-name string interpolation in `count(table)` inside `/api/admin/overview` was removed and replaced with explicit static queries.
- **Upsert Preservation**: `PUT /api/user/profile` uses `ON CONFLICT(user_id) DO UPDATE SET ...` rather than `INSERT OR REPLACE`, preserving `privacy_public_chart` preferences across updates.

## 4. Rate Limiting & HTTP Headers

- **Sliding-Window Rate Limiter**: Protects `/api/auth/register`, `/api/auth/login`, `/api/auth/change-password`, `/api/admin/bootstrap`, `/api/ai/chat`, `/api/feedback`, and `/api/v1/*` endpoints.
- **Headers**: Sets `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin` (deliberately avoiding `X-Frame-Options` to support preview iframe rendering).
- **No `window.alert` / `window.open`**: Verified zero browser popup traps in `src/`.

## 5. Secrets & API Key Hygiene

- **Zero Client-Side API Keys**: `GEMINI_API_KEY` is evaluated strictly on the server in `server/ai.ts`. When absent or placeholder, the app seamlessly uses `local-vedic-kb` without failing or leaking configuration details.
- **Self-Service GDPR/DPDP Export & Delete**: Authenticated users can export all stored records (`GET /api/user/export`) and permanently delete their account and cascaded records (`DELETE /api/user/account`), recorded in `audit_logs`.
