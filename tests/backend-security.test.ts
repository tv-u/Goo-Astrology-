import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';

const TMP_DB = path.join(os.tmpdir(), `goo_astrology_api_test_${process.pid}_${Date.now()}.db`);
process.env.GOO_DB_PATH = TMP_DB;
process.env.GOO_SKIP_LISTEN = '1';
process.env.SESSION_SECRET = 'test-session-secret-key-minimum-32-chars';

const { app } = await import('../server');
const { clearRateLimitBuckets } = await import('../server/auth');

let server: Server;
let baseUrl = '';

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${TMP_DB}${suffix}`;
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
});

test('Public API health, Kundli defaults, Location Gazetteer, Sitemap & 350 feature flags', async () => {
  const healthRes = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthRes.status, 200);
  const health = (await healthRes.json()) as { ok: boolean; rtcConfigured: boolean; d1BindingName: string };
  assert.equal(health.ok, true);
  assert.equal(health.rtcConfigured, false);
  assert.equal(health.d1BindingName, 'u-tv');

  // /api/v1/calculate/kundli must accept minimal inputs with clean defaults
  const kundliRes = await fetch(`${baseUrl}/api/v1/calculate/kundli`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: '1995-08-15',
      time: '14:30',
      latitude: 28.6139,
      longitude: 77.209,
    }),
  });
  assert.equal(kundliRes.status, 200);
  const kundliJson = (await kundliRes.json()) as { apiVersion: string; data: { planets: unknown[] } };
  assert.equal(kundliJson.apiVersion, 'v1');
  assert.equal(kundliJson.data.planets.length, 9);

  // Invalid date must return 400 cleanly
  const badKundliRes = await fetch(`${baseUrl}/api/v1/calculate/kundli`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: '2026-99-99',
      latitude: 28.6139,
      longitude: 77.209,
    }),
  });
  assert.equal(badKundliRes.status, 400);

  // Location search (alias Kashi -> Varanasi) & 28 States + 8 UTs endpoint
  const locRes = await fetch(`${baseUrl}/api/v1/locations/search?q=kashi`);
  assert.equal(locRes.status, 200);
  const locJson = (await locRes.json()) as { resolvedByAlias: boolean; matches: Array<{ city: string }> };
  assert.equal(locJson.resolvedByAlias, true);
  assert.equal(locJson.matches[0]?.city, 'Varanasi');

  const statesRes = await fetch(`${baseUrl}/api/v1/locations/states`);
  assert.equal(statesRes.status, 200);
  const statesJson = (await statesRes.json()) as { statesCount: number; unionTerritoriesCount: number };
  assert.equal(statesJson.statesCount, 28);
  assert.equal(statesJson.unionTerritoriesCount, 8);

  // Dynamic multilingual XML sitemap includes new hubs + 12 hreflangs
  const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(sitemapRes.status, 200);
  const xml = await sitemapRes.text();
  assert.ok(xml.includes('/india-locations'));
  assert.ok(xml.includes('/academy'));
  assert.ok(xml.includes('hreflang="sa-IN"'));
  assert.ok(xml.includes('hreflang="ta-IN"'));

  // All 350 modules seeded into feature_flags with honest enabled states
  const featRes = await fetch(`${baseUrl}/api/features`);
  assert.equal(featRes.status, 200);
  const featJson = (await featRes.json()) as { features: Array<{ feature_code: string; enabled: number }> };
  assert.equal(featJson.features.length, 350);
  const core24 = featJson.features.find((f) => f.feature_code === 'CORE-24');
  assert.equal(core24?.enabled, 0);
});

test('Authentication, JWT integrity, 12-Language Registration & Single-Use Admin Bootstrap + RBAC', async () => {
  clearRateLimitBuckets();

  // Weak password rejected
  const weakRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'short@example.com', password: '123', preferredLanguage: 'hi' }),
  });
  assert.equal(weakRes.status, 400);

  // Register User A with Tamil language preference
  const regARes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'usera@example.com',
      password: 'StrongPassword123!',
      fullName: 'User A',
      preferredLanguage: 'ta',
    }),
  });
  assert.equal(regARes.status, 201);
  const regA = (await regARes.json()) as { token: string; user: { preferredLanguage: string } };
  assert.equal(regA.user.preferredLanguage, 'ta');

  // Duplicate email rejected with 409
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usera@example.com', password: 'StrongPassword123!' }),
  });
  assert.equal(dupRes.status, 409);

  // Wrong password rejected with 401
  const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usera@example.com', password: 'WrongPassword!' }),
  });
  assert.equal(badLogin.status, 401);

  // Tampered token rejected with 401
  const tamperedRes = await fetch(`${baseUrl}/api/user/dashboard`, {
    headers: { Authorization: `Bearer ${regA.token}tampered` },
  });
  assert.equal(tamperedRes.status, 401);

  // Unauthenticated admin access rejected with 401
  const unauthAdmin = await fetch(`${baseUrl}/api/admin/overview`);
  assert.equal(unauthAdmin.status, 401);

  // Standard user admin access rejected with 403
  const forbiddenAdmin = await fetch(`${baseUrl}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${regA.token}` },
  });
  assert.equal(forbiddenAdmin.status, 403);

  // First-Admin secure bootstrap succeeds once, then locks out
  const boot1 = await fetch(`${baseUrl}/api/admin/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'AdminStrongPassword123!',
      fullName: 'Chief Astro Admin',
    }),
  });
  assert.equal(boot1.status, 201);
  const adminAuth = (await boot1.json()) as { token: string; user: { role: string } };
  assert.equal(adminAuth.user.role, 'admin');

  const boot2 = await fetch(`${baseUrl}/api/admin/bootstrap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'attacker@example.com',
      password: 'AttackerPassword123!',
    }),
  });
  assert.equal(boot2.status, 403);

  // Admin can access overview & trigger sync + corrupt recovery rollback
  const overviewRes = await fetch(`${baseUrl}/api/admin/overview`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  assert.equal(overviewRes.status, 200);
  const overview = (await overviewRes.json()) as { metrics: { users: number } };
  assert.ok(overview.metrics.users >= 2);

  const corruptSyncRes = await fetch(`${baseUrl}/api/admin/sync/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`,
    },
    body: JSON.stringify({ datasetKey: 'indian_cities_coordinates', simulateCorruptPayload: true }),
  });
  assert.equal(corruptSyncRes.status, 200);
  const syncJson = (await corruptSyncRes.json()) as { results: Array<{ status: string }> };
  assert.equal(syncJson.results[0]?.status, 'recovered_fallback');
});

test('User Data Isolation, Safe Profile Upsert, AI Multilingual Fallback & Self-Delete', async () => {
  clearRateLimitBuckets();

  const loginARes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'usera@example.com', password: 'StrongPassword123!' }),
  });
  const loginA = (await loginARes.json()) as { token: string };

  // Register User B
  const regBRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'userb@example.com',
      password: 'StrongPassword456!',
      fullName: 'User B',
      preferredLanguage: 'hi',
    }),
  });
  assert.equal(regBRes.status, 201);
  const regB = (await regBRes.json()) as { token: string };

  // User A creates a birth profile
  const createProfRes = await fetch(`${baseUrl}/api/user/birth-profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginA.token}` },
    body: JSON.stringify({
      fullName: 'Private Family Chart',
      birthDate: '1995-08-15',
      birthTime: '14:30',
      placeName: 'Varanasi',
      latitude: 25.3176,
      longitude: 82.9739,
    }),
  });
  assert.equal(createProfRes.status, 201);
  const createdProf = (await createProfRes.json()) as { id: number };

  // User B attempts to delete User A's birth profile -> must NOT delete User A's record
  await fetch(`${baseUrl}/api/user/birth-profiles/${createdProf.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${regB.token}` },
  });

  const dashARes = await fetch(`${baseUrl}/api/user/dashboard`, {
    headers: { Authorization: `Bearer ${loginA.token}` },
  });
  const dashA = (await dashARes.json()) as { birthProfiles: Array<{ id: number }> };
  assert.equal(dashA.birthProfiles.some((p) => p.id === createdProf.id), true);

  // Profile update preserves privacy_public_chart via ON CONFLICT upsert
  const putProf = await fetch(`${baseUrl}/api/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loginA.token}` },
    body: JSON.stringify({
      fullName: 'User A Updated',
      city: 'Chennai',
      preferredLanguage: 'ta',
      privacyPublicChart: true,
    }),
  });
  assert.equal(putProf.status, 200);

  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${loginA.token}` },
  });
  const meJson = (await meRes.json()) as { profile: { privacy_public_chart: number; city: string } };
  assert.equal(meJson.profile.privacy_public_chart, 1);
  assert.equal(meJson.profile.city, 'Chennai');

  // Local AI Astrologer endpoint works without any GEMINI_API_KEY
  const aiRes = await fetch(`${baseUrl}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Explain Manglik cancellation rules', language: 'hi' }),
  });
  assert.equal(aiRes.status, 200);
  const aiJson = (await aiRes.json()) as { engine: string; reply: string };
  assert.equal(aiJson.engine, 'local-vedic-kb');
  assert.ok(aiJson.reply.length > 20);

  // User A exports data and self-deletes account
  const exportRes = await fetch(`${baseUrl}/api/user/export`, {
    headers: { Authorization: `Bearer ${loginA.token}` },
  });
  assert.equal(exportRes.status, 200);
  const delRes = await fetch(`${baseUrl}/api/user/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${loginA.token}` },
  });
  assert.equal(delRes.status, 200);
});
