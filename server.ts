import 'dotenv/config';
import express from 'express';
import path from 'path';
import { z } from 'zod';
import { createServer as createViteServer } from 'vite';
import { db, initializeDatabase, writeAuditLog } from './server/db';
import {
  attachUserOptional,
  hashPassword,
  rateLimit,
  requireAdmin,
  requireAuth,
  signToken,
  verifyPassword,
  type AuthenticatedRequest,
} from './server/auth';
import { runAiAstrologer } from './server/ai';
import {
  getPublicDatasetPayload,
  getSyncOverview,
  initializeSyncDatasets,
  rollbackDataset,
  runDatasetSync,
} from './server/syncEngine';
import { calculateKundli } from './src/engine/ephemeris';
import { calculateAshtakoot } from './src/engine/ashtakoot';
import { calculatePanchang } from './src/engine/panchang';
import { getUpcomingEclipses } from './src/engine/planetaryIntelligence';
import { ZODIAC_SIGNS } from './src/engine/constants';
import { SUPPORTED_LANGUAGES, type IndianLanguageCode } from './src/data/locales';
import { INDIA_STATES_AND_UTS, resolveIndiaLocation } from './src/data/indiaLocations';

initializeDatabase();
initializeSyncDatasets();

export const app = express();
const PORT = Number(process.env.PORT || 3000);

const VALID_LANGUAGE_CODES = new Set<string>(SUPPORTED_LANGUAGES.map((l) => l.code));
function normalizeLanguageCode(raw: unknown): IndianLanguageCode {
  if (typeof raw === 'string' && VALID_LANGUAGE_CODES.has(raw)) {
    return raw as IndianLanguageCode;
  }
  return 'en';
}

const birthInputSchema = z.object({
  name: z.string().trim().min(1).max(80).default('Subject'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .refine((d) => {
      const [y, m, day] = d.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, day));
      return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === day;
    }, 'Invalid calendar date'),
  time: z
    .string()
    .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, 'time must be HH:MM or HH:MM:SS')
    .default('12:00'),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  timezoneOffsetMinutes: z.number().finite().min(-720).max(840).default(330),
  timezoneName: z.string().max(80).optional(),
  placeName: z.string().max(120).optional(),
  ayanamsha: z.enum(['lahiri', 'raman', 'kp', 'tropical']).default('lahiri'),
  unknownBirthTime: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().max(80).optional(),
  preferredLanguage: z.string().optional(),
});

app.use(express.json({ limit: '2mb' }));

// Security headers (no X-Frame-Options so AI Studio iframe preview works smoothly)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Health & capabilities status
app.get('/api/health', (_req, res) => {
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY.trim() !== '' &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  const rtcConfigured = Boolean(process.env.RTC_PROVIDER_URL);
  res.json({
    ok: true,
    geminiConfigured,
    rtcConfigured,
    database: 'sqlite',
    d1BindingName: 'u-tv',
    timezone: 'Asia/Kolkata',
  });
});

// Public site settings & ad flags
app.get('/api/settings/public', (_req, res) => {
  const rows = db.prepare('SELECT key, value FROM website_settings').all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  const ads = db.prepare('SELECT placement, enabled, network_code, ad_slot_id FROM advertisements').all();
  res.json({ settings, ads });
});

// Dynamic Multilingual XML Sitemap (12 Indian Languages hreflang + fixed permalinks)
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
    ? process.env.APP_URL.replace(/\/$/, '')
    : `${req.protocol}://${req.get('host')}`;
  const staticPaths = [
    '/', '/free-kundli', '/kundli-matching', '/panchang', '/muhurat', '/muhurat-calendar',
    '/research', '/planetary-intelligence', '/life-analysis', '/data-tools', '/workspace', '/test-registry',
    '/india-locations', '/academy', '/report-studio', '/verification-center',
    '/horoscope', '/dasha', '/dosha', '/yoga', '/tarot', '/numerology',
    '/vastu', '/lal-kitab', '/kp-astrology', '/baby-names', '/tools',
    '/astrologers', '/consultation', '/ai-astrologer', '/blog',
    '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/sitemap',
    ...ZODIAC_SIGNS.map((z) => `/zodiac/${z.name.toLowerCase()}`),
  ];
  const articles = db
    .prepare("SELECT slug, published_at FROM articles WHERE status = 'published'")
    .all() as { slug: string; published_at: string }[];

  const makeAlternates = (p: string) =>
    SUPPORTED_LANGUAGES.map(
      (l) =>
        `<xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${baseUrl}${p}${l.code === 'en' ? '' : `?lang=${l.code}`}"/>`
    ).join('');

  const urls = [
    ...staticPaths.map(
      (p) => `<url><loc>${baseUrl}${p}</loc>${makeAlternates(p)}<changefreq>weekly</changefreq></url>`
    ),
    ...articles.map(
      (a) =>
        `<url><loc>${baseUrl}/articles/${a.slug}</loc><lastmod>${a.published_at}</lastmod></url>`
    ),
  ].join('');

  res.setHeader('Content-Type', 'application/xml');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`
  );
});

// --- AUTHENTICATION ---
app.post('/api/auth/register', rateLimit(15, 60_000), (req, res) => {
  const parsed = registerSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid email and password (min 8 chars) are required.' });
    return;
  }
  const cleanEmail = parsed.data.email.toLowerCase();
  const cleanName = parsed.data.fullName && parsed.data.fullName.length > 0
    ? parsed.data.fullName
    : cleanEmail.split('@')[0];
  const lang = normalizeLanguageCode(parsed.data.preferredLanguage);

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const hash = hashPassword(parsed.data.password);
  const info = db
    .prepare('INSERT INTO users (email, password_hash, full_name, role, preferred_language) VALUES (?, ?, ?, ?, ?)')
    .run(cleanEmail, hash, cleanName, 'user', lang);
  const userId = Number(info.lastInsertRowid);
  db.prepare('INSERT INTO user_profiles (user_id) VALUES (?)').run(userId);

  writeAuditLog(userId, 'USER_REGISTER', `user:${userId}`, 'Account created', req.ip || '');
  const token = signToken({ userId, email: cleanEmail, role: 'user' });
  res.status(201).json({
    token,
    user: { id: userId, email: cleanEmail, fullName: cleanName, role: 'user', preferredLanguage: lang },
  });
});

app.post('/api/auth/login', rateLimit(20, 60_000), (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  const cleanEmail = email.trim().toLowerCase();
  const row = db
    .prepare('SELECT id, email, password_hash, full_name, role, preferred_language FROM users WHERE email = ?')
    .get(cleanEmail) as
    | { id: number; email: string; password_hash: string; full_name: string; role: 'user' | 'astrologer' | 'admin'; preferred_language: string }
    | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  writeAuditLog(row.id, 'USER_LOGIN', `user:${row.id}`, 'Signed in', req.ip || '');
  const token = signToken({ userId: row.id, email: row.email, role: row.role });
  res.json({
    token,
    user: {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role,
      preferredLanguage: row.preferred_language,
    },
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const profile = db.prepare('SELECT phone, city, bio, privacy_public_chart FROM user_profiles WHERE user_id = ?').get(req.user!.id);
  res.json({ user: req.user, profile });
});

app.post('/api/auth/change-password', requireAuth, rateLimit(10, 60_000), (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ error: 'Current password and new password (min 8 chars) required.' });
    return;
  }
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as { password_hash: string } | undefined;
  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(
    hashPassword(newPassword),
    req.user!.id
  );
  writeAuditLog(req.user!.id, 'PASSWORD_CHANGE', `user:${req.user!.id}`, 'Password updated', req.ip || '');
  res.json({ ok: true });
});

// --- FIRST-ADMIN SECURE SETUP ---
app.get('/api/admin/bootstrap-status', (_req, res) => {
  const adminRow = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number };
  const envPasscodeActive = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
  res.json({
    needsAdminSetup: adminRow.c === 0,
    envPasscodeActive,
  });
});

app.post('/api/admin/bootstrap', rateLimit(10, 60_000), (req, res) => {
  const adminRow = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number };
  if (adminRow.c > 0) {
    res.status(403).json({ error: 'Admin account already initialized. Please sign in.' });
    return;
  }
  const { email, password, fullName, envPasscode } = req.body || {};
  const configuredPasscode = process.env.ADMIN_PASSCODE;
  if (configuredPasscode && configuredPasscode.trim() !== '' && envPasscode !== configuredPasscode) {
    res.status(403).json({ error: 'Invalid server ADMIN_PASSCODE.' });
    return;
  }
  if (typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Valid admin email and strong password (min 8 chars) required.' });
    return;
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = typeof fullName === 'string' && fullName.trim() ? fullName.trim() : 'Platform Administrator';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail) as { id: number } | undefined;

  let userId: number;
  if (existing) {
    db.prepare("UPDATE users SET role = 'admin', password_hash = ?, full_name = ? WHERE id = ?").run(
      hashPassword(password),
      cleanName,
      existing.id
    );
    userId = existing.id;
  } else {
    const info = db
      .prepare('INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
      .run(cleanEmail, hashPassword(password), cleanName, 'admin');
    userId = Number(info.lastInsertRowid);
    db.prepare('INSERT OR IGNORE INTO user_profiles (user_id) VALUES (?)').run(userId);
  }

  writeAuditLog(userId, 'ADMIN_BOOTSTRAP', `user:${userId}`, 'First admin claimed', req.ip || '');
  const token = signToken({ userId, email: cleanEmail, role: 'admin' });
  res.status(201).json({
    token,
    user: { id: userId, email: cleanEmail, fullName: cleanName, role: 'admin', preferredLanguage: 'en' },
  });
});

// --- ASTROLOGY CALCULATIONS + REPORT PERSISTENCE ---
app.post('/api/kundli', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const parsed = birthInputSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Date, latitude, and longitude are required.' });
    return;
  }
  try {
    const input = parsed.data;
    const result = calculateKundli(input);
    if (req.user) {
      db.prepare('INSERT INTO kundli_reports (user_id, subject_name, input_json, summary_json) VALUES (?, ?, ?, ?)').run(
        req.user.id,
        input.name,
        JSON.stringify(input),
        JSON.stringify({
          ascendant: result.ascendant.signName,
          moonSign: result.planets.find((p) => p.id === 'Moon')?.signName,
          nakshatra: result.planets.find((p) => p.id === 'Moon')?.nakshatraName,
        })
      );
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to compute Kundli.' });
  }
});

app.post('/api/matching', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ bride: birthInputSchema, groom: birthInputSchema }).safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid bride and groom birth details are required.' });
    return;
  }
  try {
    const { bride, groom } = parsed.data;
    const brideKundli = calculateKundli(bride);
    const groomKundli = calculateKundli(groom);
    const report = calculateAshtakoot(brideKundli, groomKundli);
    if (req.user) {
      db.prepare(
        'INSERT INTO compatibility_reports (user_id, bride_name, groom_name, total_score, report_json) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, bride.name, groom.name, report.totalScore, JSON.stringify(report));
    }
    res.json({ brideKundli, groomKundli, report });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Matching calculation failed.' });
  }
});

app.get('/api/panchang', (req, res) => {
  const dateStr = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
    ? req.query.date
    : new Date().toISOString().slice(0, 10);
  const lat = Number(req.query.lat ?? 28.6139);
  const lon = Number(req.query.lon ?? 77.209);
  const tz = Number(req.query.tz ?? 330);
  const place = typeof req.query.place === 'string' ? req.query.place : 'New Delhi, India';
  const result = calculatePanchang(dateStr, lat, lon, tz, place);
  res.json(result);
});

// --- AI ASTROLOGER ---
app.post('/api/ai/chat', rateLimit(25, 60_000), attachUserOptional, async (req: AuthenticatedRequest, res) => {
  const { question, language, kundliContext, history } = req.body || {};
  if (typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'Please enter a question.' });
    return;
  }
  const result = await runAiAstrologer({
    question: question.trim().slice(0, 1500),
    language: normalizeLanguageCode(language),
    kundliContext: kundliContext || null,
    history: Array.isArray(history) ? history : [],
  });
  res.json(result);
});

// --- USER PROFILE & SAVED DATA ---
app.get('/api/user/dashboard', requireAuth, (req: AuthenticatedRequest, res) => {
  const uid = req.user!.id;
  const birthProfiles = db.prepare('SELECT * FROM birth_profiles WHERE user_id = ? ORDER BY created_at DESC').all(uid);
  const savedReadings = db.prepare('SELECT * FROM saved_readings WHERE user_id = ? ORDER BY created_at DESC').all(uid);
  const consultations = db
    .prepare(
      `SELECT c.*, a.display_name as astrologer_name FROM consultations c
       JOIN astrologers a ON c.astrologer_id = a.id
       WHERE c.user_id = ? ORDER BY c.created_at DESC`
    )
    .all(uid);
  res.json({ birthProfiles, savedReadings, consultations });
});

app.post('/api/user/birth-profiles', requireAuth, (req: AuthenticatedRequest, res) => {
  const { fullName, birthDate, birthTime, placeName, latitude, longitude, timezoneOffsetMinutes, timezoneName, ayanamsha } = req.body || {};
  if (!fullName || !birthDate || typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'Invalid birth profile details.' });
    return;
  }
  const info = db
    .prepare(
      `INSERT INTO birth_profiles (user_id, full_name, birth_date, birth_time, place_name, latitude, longitude, timezone_offset_minutes, timezone_name, ayanamsha)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.user!.id,
      String(fullName).slice(0, 80),
      String(birthDate),
      String(birthTime || '12:00'),
      String(placeName || 'New Delhi'),
      latitude,
      longitude,
      Number(timezoneOffsetMinutes ?? 330),
      String(timezoneName || 'Asia/Kolkata'),
      String(ayanamsha || 'lahiri')
    );
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/user/birth-profiles/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM birth_profiles WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user!.id);
  res.json({ ok: true });
});

app.post('/api/user/saved-readings', requireAuth, (req: AuthenticatedRequest, res) => {
  const { readingType, title, payload } = req.body || {};
  if (!readingType || !title || !payload) {
    res.status(400).json({ error: 'readingType, title, and payload are required.' });
    return;
  }
  const info = db
    .prepare('INSERT INTO saved_readings (user_id, reading_type, title, payload_json) VALUES (?, ?, ?, ?)')
    .run(req.user!.id, String(readingType), String(title).slice(0, 120), JSON.stringify(payload));
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/user/saved-readings/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM saved_readings WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user!.id);
  res.json({ ok: true });
});

app.put('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const { fullName, phone, city, bio, preferredLanguage, privacyPublicChart } = req.body || {};
  const nextLang = preferredLanguage !== undefined
    ? normalizeLanguageCode(preferredLanguage)
    : req.user!.preferredLanguage;
  if (fullName || preferredLanguage !== undefined) {
    db.prepare("UPDATE users SET full_name = ?, preferred_language = ?, updated_at = datetime('now') WHERE id = ?").run(
      fullName ? String(fullName).slice(0, 80) : req.user!.fullName,
      nextLang,
      req.user!.id
    );
  }
  const existingProfile = db
    .prepare('SELECT privacy_public_chart FROM user_profiles WHERE user_id = ?')
    .get(req.user!.id) as { privacy_public_chart: number } | undefined;
  const privacyFlag =
    typeof privacyPublicChart === 'boolean'
      ? privacyPublicChart ? 1 : 0
      : existingProfile?.privacy_public_chart ?? 0;

  db.prepare(
    `INSERT INTO user_profiles (user_id, phone, city, bio, privacy_public_chart)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       phone = excluded.phone,
       city = excluded.city,
       bio = excluded.bio,
       privacy_public_chart = excluded.privacy_public_chart`
  ).run(
    req.user!.id,
    String(phone || '').slice(0, 30),
    String(city || '').slice(0, 80),
    String(bio || '').slice(0, 500),
    privacyFlag
  );
  res.json({ ok: true });
});

app.get('/api/user/export', requireAuth, (req: AuthenticatedRequest, res) => {
  const uid = req.user!.id;
  const user = db.prepare('SELECT id, email, full_name, role, preferred_language, created_at FROM users WHERE id = ?').get(uid);
  const birthProfiles = db.prepare('SELECT * FROM birth_profiles WHERE user_id = ?').all(uid);
  const savedReadings = db.prepare('SELECT * FROM saved_readings WHERE user_id = ?').all(uid);
  const consultations = db.prepare('SELECT * FROM consultations WHERE user_id = ?').all(uid);
  res.json({ exportedAt: new Date().toISOString(), user, birthProfiles, savedReadings, consultations });
});

app.delete('/api/user/account', requireAuth, (req: AuthenticatedRequest, res) => {
  const uid = req.user!.id;
  writeAuditLog(uid, 'USER_DELETE_SELF', `user:${uid}`, 'Self-service account deletion', req.ip || '');
  db.prepare('DELETE FROM users WHERE id = ?').run(uid);
  res.json({ ok: true });
});

// --- ASTROLOGERS & CONSULTATIONS (NO FAKE ONLINE ASTROLOGERS) ---
app.get('/api/astrologers', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, display_name, specializations, experience_years, languages, bio, consultation_rate_inr, is_available, rating_avg, review_count
       FROM astrologers WHERE approval_status = 'approved' ORDER BY rating_avg DESC, experience_years DESC`
    )
    .all();
  res.json({ astrologers: rows, rtcConfigured: Boolean(process.env.RTC_PROVIDER_URL) });
});

app.post('/api/astrologers/apply', requireAuth, (req: AuthenticatedRequest, res) => {
  const { displayName, specializations, experienceYears, languages, bio, rateInr } = req.body || {};
  if (!displayName || !specializations || !bio) {
    res.status(400).json({ error: 'Display name, specializations, and bio are required.' });
    return;
  }
  db.prepare(
    `INSERT OR REPLACE INTO astrologers (user_id, display_name, specializations, experience_years, languages, bio, consultation_rate_inr, approval_status, is_available)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0)`
  ).run(
    req.user!.id,
    String(displayName).slice(0, 80),
    String(specializations).slice(0, 200),
    Math.max(0, Number(experienceYears || 0)),
    String(languages || 'Hindi, English').slice(0, 120),
    String(bio).slice(0, 800),
    Math.max(0, Number(rateInr || 0))
  );
  writeAuditLog(req.user!.id, 'ASTROLOGER_APPLY', `user:${req.user!.id}`, 'Submitted astrologer application', req.ip || '');
  res.status(201).json({ ok: true, status: 'pending' });
});

app.post('/api/consultations', requireAuth, (req: AuthenticatedRequest, res) => {
  const { astrologerId, mode, scheduledFor, notes } = req.body || {};
  const astro = db
    .prepare("SELECT id FROM astrologers WHERE id = ? AND approval_status = 'approved'")
    .get(Number(astrologerId));
  if (!astro) {
    res.status(404).json({ error: 'Verified astrologer not found.' });
    return;
  }
  const info = db
    .prepare('INSERT INTO consultations (user_id, astrologer_id, mode, scheduled_for, notes) VALUES (?, ?, ?, ?, ?)')
    .run(req.user!.id, Number(astrologerId), String(mode || 'async_query'), String(scheduledFor || new Date().toISOString().slice(0, 16)), String(notes || '').slice(0, 500));
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

// --- ARTICLES / BLOG ---
app.get('/api/articles', (_req, res) => {
  const rows = db
    .prepare("SELECT id, slug, title, hindi_title, category, author, excerpt, body_json, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC")
    .all() as { id: number; slug: string; title: string; hindi_title: string; category: string; author: string; excerpt: string; body_json: string; published_at: string }[];
  res.json({
    articles: rows.map((r) => ({
      ...r,
      hindiTitle: r.hindi_title,
      publishedAt: r.published_at,
      body: JSON.parse(r.body_json || '[]'),
    })),
  });
});

// --- FEEDBACK / CONTACT ---
app.post('/api/feedback', rateLimit(10, 60_000), (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }
  db.prepare('INSERT INTO feedback (name, email, subject, message) VALUES (?, ?, ?, ?)').run(
    String(name).slice(0, 80),
    String(email).slice(0, 120),
    String(subject || 'General Inquiry').slice(0, 150),
    String(message).slice(0, 2000)
  );
  res.status(201).json({ ok: true });
});

// --- ADMIN CONTROL PANEL ENDPOINTS ---
app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  const usersCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  const kundliReportsCount = (db.prepare('SELECT COUNT(*) as c FROM kundli_reports').get() as { c: number }).c;
  const compatibilityReportsCount = (db.prepare('SELECT COUNT(*) as c FROM compatibility_reports').get() as { c: number }).c;
  const astrologersCount = (db.prepare('SELECT COUNT(*) as c FROM astrologers').get() as { c: number }).c;
  const articlesCount = (db.prepare('SELECT COUNT(*) as c FROM articles').get() as { c: number }).c;
  const feedbackCount = (db.prepare('SELECT COUNT(*) as c FROM feedback').get() as { c: number }).c;
  const consultationsCount = (db.prepare('SELECT COUNT(*) as c FROM consultations').get() as { c: number }).c;
  const pendingAstro = (db.prepare("SELECT COUNT(*) as c FROM astrologers WHERE approval_status = 'pending'").get() as { c: number }).c;
  res.json({
    metrics: {
      users: usersCount,
      kundliReports: kundliReportsCount,
      compatibilityReports: compatibilityReportsCount,
      astrologers: astrologersCount,
      pendingAstrologers: pendingAstro,
      articles: articlesCount,
      feedback: feedbackCount,
      consultations: consultationsCount,
    },
  });
});

app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const users = db.prepare('SELECT id, email, full_name, role, preferred_language, created_at FROM users ORDER BY created_at DESC LIMIT 100').all();
  res.json({ users });
});

app.patch('/api/admin/users/:id/role', requireAdmin, (req: AuthenticatedRequest, res) => {
  const role = req.body?.role;
  if (!['user', 'astrologer', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }
  const targetId = Number(req.params.id);
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);
  writeAuditLog(req.user!.id, 'ADMIN_ROLE_UPDATE', `user:${targetId}`, `Role -> ${role}`, req.ip || '');
  res.json({ ok: true });
});

app.get('/api/admin/astrologers', requireAdmin, (_req, res) => {
  const astrologers = db.prepare('SELECT * FROM astrologers ORDER BY created_at DESC').all();
  res.json({ astrologers });
});

app.patch('/api/admin/astrologers/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { approvalStatus, isAvailable } = req.body || {};
  const id = Number(req.params.id);
  if (approvalStatus && ['pending', 'approved', 'rejected'].includes(approvalStatus)) {
    db.prepare('UPDATE astrologers SET approval_status = ? WHERE id = ?').run(approvalStatus, id);
    if (approvalStatus === 'approved') {
      const row = db.prepare('SELECT user_id FROM astrologers WHERE id = ?').get(id) as { user_id: number } | undefined;
      if (row) db.prepare("UPDATE users SET role = 'astrologer' WHERE id = ? AND role != 'admin'").run(row.user_id);
    }
  }
  if (typeof isAvailable === 'boolean') {
    db.prepare('UPDATE astrologers SET is_available = ? WHERE id = ?').run(isAvailable ? 1 : 0, id);
  }
  writeAuditLog(req.user!.id, 'ADMIN_ASTROLOGER_UPDATE', `astrologer:${id}`, JSON.stringify(req.body), req.ip || '');
  res.json({ ok: true });
});

app.get('/api/admin/articles', requireAdmin, (_req, res) => {
  const articles = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
  res.json({ articles });
});

app.post('/api/admin/articles', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { title, hindiTitle, category, excerpt, body, status } = req.body || {};
  if (!title || !excerpt) {
    res.status(400).json({ error: 'Title and excerpt required.' });
    return;
  }
  const slug = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  const bodyArr = Array.isArray(body) ? body : String(body || excerpt).split('\n\n').filter(Boolean);
  db.prepare(
    `INSERT INTO articles (slug, title, hindi_title, category, author, excerpt, body_json, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    slug,
    String(title).slice(0, 180),
    String(hindiTitle || '').slice(0, 180),
    String(category || 'Kundli Guides'),
    req.user!.fullName,
    String(excerpt).slice(0, 400),
    JSON.stringify(bodyArr),
    ['published', 'draft', 'scheduled'].includes(status) ? status : 'published',
    new Date().toISOString().slice(0, 10)
  );
  writeAuditLog(req.user!.id, 'ADMIN_ARTICLE_CREATE', slug, 'Created article', req.ip || '');
  res.status(201).json({ ok: true, slug });
});

app.patch('/api/admin/articles/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { status } = req.body || {};
  if (['published', 'draft', 'scheduled'].includes(status)) {
    db.prepare('UPDATE articles SET status = ? WHERE id = ?').run(status, Number(req.params.id));
    writeAuditLog(req.user!.id, 'ADMIN_ARTICLE_STATUS', `article:${req.params.id}`, `Status -> ${status}`, req.ip || '');
  }
  res.json({ ok: true });
});

app.delete('/api/admin/articles/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(Number(req.params.id));
  writeAuditLog(req.user!.id, 'ADMIN_ARTICLE_DELETE', `article:${req.params.id}`, 'Deleted article', req.ip || '');
  res.json({ ok: true });
});

app.get('/api/admin/settings', requireAdmin, (_req, res) => {
  const settings = db.prepare('SELECT key, value, updated_at FROM website_settings').all();
  const ads = db.prepare('SELECT * FROM advertisements').all();
  const feedback = db.prepare('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50').all();
  const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 80').all();
  res.json({ settings, ads, feedback, auditLogs });
});

app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
  const updates = req.body?.settings;
  if (updates && typeof updates === 'object') {
    const stmt = db.prepare("INSERT OR REPLACE INTO website_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))");
    for (const [k, v] of Object.entries(updates)) {
      stmt.run(String(k).slice(0, 64), String(v).slice(0, 500));
    }
    writeAuditLog(req.user!.id, 'ADMIN_SETTINGS_UPDATE', 'website_settings', Object.keys(updates).join(','), req.ip || '');
  }
  res.json({ ok: true });
});

app.put('/api/admin/ads', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { placement, enabled, networkCode, adSlotId } = req.body || {};
  db.prepare('UPDATE advertisements SET enabled = ?, network_code = ?, ad_slot_id = ? WHERE placement = ?').run(
    enabled ? 1 : 0,
    String(networkCode || '').slice(0, 120),
    String(adSlotId || '').slice(0, 120),
    String(placement)
  );
  writeAuditLog(req.user!.id, 'ADMIN_ADS_UPDATE', String(placement), `enabled=${Boolean(enabled)}`, req.ip || '');
  res.json({ ok: true });
});

app.patch('/api/admin/feedback/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const status = req.body?.status === 'resolved' ? 'resolved' : 'open';
  db.prepare('UPDATE feedback SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  res.json({ ok: true });
});

app.get('/api/admin/export', requireAdmin, (req: AuthenticatedRequest, res) => {
  writeAuditLog(req.user!.id, 'ADMIN_DB_EXPORT', 'database', 'Full backup exported', req.ip || '');
  res.json({
    exportedAt: new Date().toISOString(),
    usersCount: (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c,
    articles: db.prepare('SELECT * FROM articles').all(),
    settings: db.prepare('SELECT * FROM website_settings').all(),
    astrologers: db.prepare('SELECT * FROM astrologers').all(),
    feedback: db.prepare('SELECT * FROM feedback').all(),
  });
});

// --- OPEN DATA AUTO SYNC & PUBLIC DATASET EXPLORER (Features 79-82, 99) ---
app.get('/api/sync/status', (_req, res) => {
  res.json(getSyncOverview());
});

app.get('/api/datasets/:key', (req, res) => {
  const ds = getPublicDatasetPayload(String(req.params.key));
  if (!ds) {
    res.status(404).json({ error: 'Dataset not found.' });
    return;
  }
  res.json(ds);
});

app.post('/api/admin/sync/run', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { datasetKey, simulateCorruptPayload } = req.body || {};
  const results = runDatasetSync({
    datasetKey: typeof datasetKey === 'string' && datasetKey ? datasetKey : undefined,
    simulateCorruptPayload: Boolean(simulateCorruptPayload),
  });
  writeAuditLog(
    req.user!.id,
    'ADMIN_SYNC_RUN',
    datasetKey || 'all_datasets',
    JSON.stringify(results.map((r) => `${r.datasetKey}:${r.status}`)),
    req.ip || ''
  );
  res.json({ ok: true, results, overview: getSyncOverview() });
});

app.post('/api/admin/sync/rollback', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { datasetKey } = req.body || {};
  if (typeof datasetKey !== 'string' || !datasetKey) {
    res.status(400).json({ error: 'datasetKey is required.' });
    return;
  }
  const outcome = rollbackDataset(datasetKey);
  if (!outcome.ok) {
    res.status(400).json({ error: outcome.message });
    return;
  }
  writeAuditLog(req.user!.id, 'ADMIN_SYNC_ROLLBACK', datasetKey, `Restored ${outcome.restoredVersion}`, req.ip || '');
  res.json({ ...outcome, overview: getSyncOverview() });
});

// --- FEATURE FLAGS (All 100 Advanced Features) ---
app.get('/api/features', (_req, res) => {
  const rows = db.prepare('SELECT feature_code, title, category, route, enabled FROM feature_flags ORDER BY feature_code ASC').all();
  res.json({ features: rows });
});

app.patch('/api/admin/features/:code', requireAdmin, (req: AuthenticatedRequest, res) => {
  const enabled = req.body?.enabled ? 1 : 0;
  db.prepare("UPDATE feature_flags SET enabled = ?, updated_at = datetime('now') WHERE feature_code = ?").run(
    enabled,
    String(req.params.code)
  );
  writeAuditLog(req.user!.id, 'ADMIN_FEATURE_TOGGLE', String(req.params.code), `enabled=${enabled}`, req.ip || '');
  res.json({ ok: true });
});

// --- WORKSPACE SUITE (Features 86-98: Notes, Journal, Cases, Annotations, Certifications, Widgets) ---
app.get('/api/workspace/state', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const uid = req.user ? req.user.id : null;
  const where = uid ? 'WHERE user_id = ?' : 'WHERE user_id IS NULL';
  const params = uid ? [uid] : [];
  const notes = db.prepare(`SELECT * FROM study_notes ${where} ORDER BY id DESC LIMIT 50`).all(...params);
  const journal = db.prepare(`SELECT * FROM journal_entries ${where} ORDER BY id DESC LIMIT 50`).all(...params);
  const cases = db.prepare(`SELECT * FROM research_cases ${where} ORDER BY id DESC LIMIT 50`).all(...params);
  const annotations = db.prepare(`SELECT * FROM chart_annotations ${where} ORDER BY id DESC LIMIT 50`).all(...params);
  const certifications = uid
    ? db.prepare('SELECT * FROM user_certifications WHERE user_id = ? ORDER BY id DESC').all(uid)
    : [];
  const layoutRow = uid
    ? (db.prepare('SELECT layout_json FROM widget_layouts WHERE user_id = ?').get(uid) as { layout_json: string } | undefined)
    : undefined;
  res.json({
    notes,
    journal,
    cases,
    annotations,
    certifications,
    widgetOrder: layoutRow ? JSON.parse(layoutRow.layout_json) : null,
  });
});

app.post('/api/workspace/notes', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const { title, topic, content, tags } = req.body || {};
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required.' });
    return;
  }
  const info = db
    .prepare('INSERT INTO study_notes (user_id, title, topic, content, tags) VALUES (?, ?, ?, ?, ?)')
    .run(req.user?.id ?? null, String(title).slice(0, 140), String(topic || 'Vedic Study').slice(0, 80), String(content).slice(0, 4000), String(tags || '').slice(0, 120));
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/workspace/notes/:id', attachUserOptional, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    db.prepare('DELETE FROM study_notes WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
  } else {
    db.prepare('DELETE FROM study_notes WHERE id = ? AND user_id IS NULL').run(Number(req.params.id));
  }
  res.json({ ok: true });
});

app.post('/api/workspace/journal', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const { entryDate, moonSign, dashaPeriod, reflection, transitNote } = req.body || {};
  if (!reflection) {
    res.status(400).json({ error: 'Journal reflection is required.' });
    return;
  }
  const info = db
    .prepare('INSERT INTO journal_entries (user_id, entry_date, moon_sign, dasha_period, reflection, transit_note) VALUES (?, ?, ?, ?, ?, ?)')
    .run(
      req.user?.id ?? null,
      String(entryDate || new Date().toISOString().slice(0, 10)),
      String(moonSign || '').slice(0, 40),
      String(dashaPeriod || '').slice(0, 80),
      String(reflection).slice(0, 3000),
      String(transitNote || '').slice(0, 400)
    );
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/workspace/journal/:id', attachUserOptional, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    db.prepare('DELETE FROM journal_entries WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
  } else {
    db.prepare('DELETE FROM journal_entries WHERE id = ? AND user_id IS NULL').run(Number(req.params.id));
  }
  res.json({ ok: true });
});

app.post('/api/workspace/cases', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const { title, category, subjectName, birthJson, hypothesis, findings } = req.body || {};
  if (!title || !subjectName || !hypothesis) {
    res.status(400).json({ error: 'Case title, subject, and hypothesis are required.' });
    return;
  }
  const info = db
    .prepare('INSERT INTO research_cases (user_id, title, category, subject_name, birth_json, hypothesis, findings) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(
      req.user?.id ?? null,
      String(title).slice(0, 140),
      String(category || 'Parashari Research').slice(0, 60),
      String(subjectName).slice(0, 80),
      JSON.stringify(birthJson || {}),
      String(hypothesis).slice(0, 1000),
      String(findings || '').slice(0, 2000)
    );
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/workspace/cases/:id', attachUserOptional, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    db.prepare('DELETE FROM research_cases WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
  } else {
    db.prepare('DELETE FROM research_cases WHERE id = ? AND user_id IS NULL').run(Number(req.params.id));
  }
  res.json({ ok: true });
});

app.post('/api/workspace/annotations', attachUserOptional, (req: AuthenticatedRequest, res) => {
  const { chartName, targetRef, note, tone } = req.body || {};
  if (!targetRef || !note) {
    res.status(400).json({ error: 'Target house/planet and note are required.' });
    return;
  }
  const info = db
    .prepare('INSERT INTO chart_annotations (user_id, chart_name, target_ref, note, tone) VALUES (?, ?, ?, ?, ?)')
    .run(req.user?.id ?? null, String(chartName || 'Primary D1').slice(0, 80), String(targetRef).slice(0, 60), String(note).slice(0, 600), String(tone || 'gold'));
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

app.delete('/api/workspace/annotations/:id', attachUserOptional, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    db.prepare('DELETE FROM chart_annotations WHERE id = ? AND user_id = ?').run(Number(req.params.id), req.user.id);
  } else {
    db.prepare('DELETE FROM chart_annotations WHERE id = ? AND user_id IS NULL').run(Number(req.params.id));
  }
  res.json({ ok: true });
});

app.put('/api/workspace/widgets', requireAuth, (req: AuthenticatedRequest, res) => {
  const order = req.body?.widgetOrder;
  if (!Array.isArray(order)) {
    res.status(400).json({ error: 'widgetOrder array required.' });
    return;
  }
  db.prepare("INSERT OR REPLACE INTO widget_layouts (user_id, layout_json, updated_at) VALUES (?, ?, datetime('now'))").run(
    req.user!.id,
    JSON.stringify(order.slice(0, 20))
  );
  res.json({ ok: true });
});

app.post('/api/workspace/certification', requireAuth, (req: AuthenticatedRequest, res) => {
  const { courseSlug, answers } = req.body || {};
  // Deterministic grading against Vedic astronomy answer key [1, 2, 0, 2, 1]
  const key = [1, 2, 0, 2, 1];
  const submitted = Array.isArray(answers) ? answers.map(Number) : [];
  let correct = 0;
  for (let i = 0; i < key.length; i++) {
    if (submitted[i] === key[i]) correct++;
  }
  const score = Math.round((correct / key.length) * 100);
  const passed = score >= 80;
  const certCode = passed ? `GOO-${String(courseSlug || 'VEDIC').toUpperCase().slice(0, 8)}-${req.user!.id}-${Date.now().toString(36).toUpperCase()}` : '';
  db.prepare('INSERT INTO user_certifications (user_id, course_slug, score, passed, certificate_code) VALUES (?, ?, ?, ?, ?)').run(
    req.user!.id,
    String(courseSlug || 'vedic-foundations'),
    score,
    passed ? 1 : 0,
    certCode
  );
  res.json({ score, passed, correct, total: key.length, certificateCode: certCode });
});

// --- DEVELOPER SDK & LOCAL CALCULATION API v1 (Feature 100 + Domain H Gazetteer) ---
app.get('/api/v1/locations/search', rateLimit(120, 60_000), (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  res.json({ apiVersion: 'v1', ...resolveIndiaLocation(q) });
});

app.get('/api/v1/locations/states', rateLimit(120, 60_000), (_req, res) => {
  res.json({
    apiVersion: 'v1',
    statesCount: INDIA_STATES_AND_UTS.filter((s) => s.type === 'State').length,
    unionTerritoriesCount: INDIA_STATES_AND_UTS.filter((s) => s.type === 'Union Territory').length,
    regions: INDIA_STATES_AND_UTS,
  });
});

app.post('/api/v1/calculate/kundli', rateLimit(60, 60_000), (req, res) => {
  const parsed = birthInputSchema.safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'date, latitude, and longitude are required.' });
    return;
  }
  try {
    res.json({ apiVersion: 'v1', license: 'MIT-Calculation-Engine', data: calculateKundli(parsed.data) });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' });
  }
});

app.get('/api/v1/calculate/panchang', rateLimit(60, 60_000), (req, res) => {
  const dateStr = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
    ? req.query.date
    : new Date().toISOString().slice(0, 10);
  const lat = Number(req.query.lat ?? 28.6139);
  const lon = Number(req.query.lon ?? 77.209);
  const tz = Number(req.query.tz ?? 330);
  const place = typeof req.query.place === 'string' ? req.query.place : 'New Delhi, India';
  res.json({ apiVersion: 'v1', data: calculatePanchang(dateStr, lat, lon, tz, place) });
});

app.post('/api/v1/calculate/matching', rateLimit(60, 60_000), (req, res) => {
  const parsed = z.object({ bride: birthInputSchema, groom: birthInputSchema }).safeParse(req.body || {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Valid bride and groom birth inputs required.' });
    return;
  }
  try {
    const b = calculateKundli(parsed.data.bride);
    const g = calculateKundli(parsed.data.groom);
    res.json({ apiVersion: 'v1', report: calculateAshtakoot(b, g) });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' });
  }
});

app.get('/api/v1/calculate/eclipses', rateLimit(60, 60_000), (req, res) => {
  const dateStr = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10);
  const lat = Number(req.query.lat ?? 28.6139);
  const lon = Number(req.query.lon ?? 77.209);
  res.json({ apiVersion: 'v1', data: getUpcomingEclipses(dateStr, lat, lon) });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOO ASTROLOGY server listening on http://localhost:${PORT}`);
  });
}

if (process.env.GOO_SKIP_LISTEN !== '1') {
  startServer();
}
