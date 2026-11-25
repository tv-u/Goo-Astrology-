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
  assert.ok(xml.includes('/prashna-varshaphal'));
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

  // Admin Ad Manager rejects untrusted URL/XSS and accepts verified Monetag Zone ID + ads.txt
  const badAdRes = await fetch(`${baseUrl}/api/admin/ads`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAuth.token}` },
    body: JSON.stringify({
      placement: 'homepage',
      enabled: true,
      networkCode: 'monetag',
      adSlotId: 'https://untrusted-xss.example.org/ad.js',
    }),
  });
  assert.equal(badAdRes.status, 400);

  const goodAdRes = await fetch(`${baseUrl}/api/admin/ads`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAuth.token}` },
    body: JSON.stringify({
      placement: 'homepage',
      enabled: true,
      networkCode: 'monetag',
      adSlotId: '9123456',
    }),
  });
  assert.equal(goodAdRes.status, 200);

  const settingsRes = await fetch(`${baseUrl}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminAuth.token}` },
    body: JSON.stringify({
      settings: {
        monetag_verification_meta: 'monetagverifytoken9988',
        monetag_multitag_zone_id: '9123457',
        ads_txt_content: 'monetag.com, 987654, DIRECT',
      },
    }),
  });
  assert.equal(settingsRes.status, 200);

  const pubSettingsRes = await fetch(`${baseUrl}/api/settings/public`);
  assert.equal(pubSettingsRes.status, 200);
  const pubJson = (await pubSettingsRes.json()) as {
    settings: Record<string, string>;
    ads: Array<{ placement: string; enabled: number; network_code: string; ad_slot_id: string }>;
  };
  assert.equal(pubJson.settings.monetag_verification_meta, 'monetagverifytoken9988');
  assert.equal(pubJson.settings.monetag_multitag_zone_id, '9123457');
  const hpAd = pubJson.ads.find((a) => a.placement === 'homepage');
  assert.equal(hpAd?.enabled, 1);
  assert.equal(hpAd?.network_code, 'monetag');
  assert.equal(hpAd?.ad_slot_id, '9123456');

  const adsTxtRes = await fetch(`${baseUrl}/ads.txt`);
  assert.equal(adsTxtRes.status, 200);
  assert.ok((await adsTxtRes.text()).includes('monetag.com, 987654, DIRECT'));
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

  // Owner can delete their own birth profile cleanly
  const ownerDelProf = await fetch(`${baseUrl}/api/user/birth-profiles/${createdProf.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${loginA.token}` },
  });
  assert.equal(ownerDelProf.status, 200);
  const dashAfterDel = (await (await fetch(`${baseUrl}/api/user/dashboard`, {
    headers: { Authorization: `Bearer ${loginA.token}` },
  })).json()) as { birthProfiles: Array<{ id: number }> };
  assert.equal(dashAfterDel.birthProfiles.some((p) => p.id === createdProf.id), false);

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

test('60-Feature Growth APIs: Seeded Monetag Direct Link, RSS/News Sitemap, Analytics Tracking & Admin IndexNow', async () => {
  // Public settings must expose active user Monetag Direct Link https://uplcm.com/4/12282219
  const pubRes = await fetch(`${baseUrl}/api/settings/public`);
  assert.equal(pubRes.status, 200);
  const pubData = (await pubRes.json()) as { settings: Record<string, string> };
  assert.equal(pubData.settings.monetag_direct_link_url, 'https://uplcm.com/4/12282219');
  assert.equal(pubData.settings.monetag_direct_link_enabled, 'true');

  // RSS 2.0 & News Sitemap + expanded City Panchang Sitemap
  const rssRes = await fetch(`${baseUrl}/rss.xml`);
  assert.equal(rssRes.status, 200);
  assert.ok((await rssRes.text()).includes('<rss version="2.0">'));

  const newsRes = await fetch(`${baseUrl}/news-sitemap.xml`);
  assert.equal(newsRes.status, 200);
  assert.ok((await newsRes.text()).includes('sitemap-news'));

  const smRes = await fetch(`${baseUrl}/sitemap.xml`);
  const smXml = await smRes.text();
  assert.ok(smXml.includes('/vedic-suite'));
  assert.ok(smXml.includes('/panchang/new-delhi'));
  assert.ok(smXml.includes('/rahu-kaal/new-delhi'));

  // Anonymous analytics tracking
  const trk1 = await fetch(`${baseUrl}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: '/vedic-suite', featureKey: 'monetag_direct_global', eventType: 'ad_click' }),
  });
  assert.equal(trk1.status, 201);

  const trkBad = await fetch(`${baseUrl}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route: '/x', eventType: 'evil_event' }),
  });
  assert.equal(trkBad.status, 400);

  // Admin can view aggregated traffic stats & reject invalid Monetag direct link updates
  const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'AdminStrongPassword123!' }),
  });
  const adminToken = ((await adminLogin.json()) as { token: string }).token;

  const trafficRes = await fetch(`${baseUrl}/api/admin/analytics-traffic`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(trafficRes.status, 200);
  const trafficJson = (await trafficRes.json()) as { byType: Array<{ event_type: string; count: number }> };
  assert.ok(trafficJson.byType.some((r) => r.event_type === 'ad_click' && r.count >= 1));

  const badDirectRes = await fetch(`${baseUrl}/api/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ settings: { monetag_direct_link_url: 'https://malicious.example.org/phish' } }),
  });
  assert.equal(badDirectRes.status, 400);

  // IndexNow validates missing/invalid key with 400 cleanly
  const idxBad = await fetch(`${baseUrl}/api/admin/indexnow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ indexnowKey: 'short' }),
  });
  assert.equal(idxBad.status, 400);
});

test('Newsletter Subscription, Validated Feedback & New Portal Sitemap Routes', async () => {
  // Invalid email rejected
  const badSub = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  assert.equal(badSub.status, 400);

  // Valid subscription persisted
  const goodSub = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'Subscriber@Example.com', preferredLanguage: 'hi', sourceRoute: '/horoscope' }),
  });
  assert.equal(goodSub.status, 201);
  const subJson = (await goodSub.json()) as { ok: boolean; alreadySubscribed: boolean };
  assert.equal(subJson.ok, true);
  assert.equal(subJson.alreadySubscribed, false);

  // Duplicate email updates cleanly without 500 error
  const dupSub = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'subscriber@example.com', preferredLanguage: 'ta' }),
  });
  assert.equal(dupSub.status, 200);
  const dupJson = (await dupSub.json()) as { ok: boolean; alreadySubscribed: boolean };
  assert.equal(dupJson.alreadySubscribed, true);

  // Feedback email validation + persistence
  const badFb = await fetch(`${baseUrl}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'bad', message: 'Hello world' }),
  });
  assert.equal(badFb.status, 400);

  const goodFb = await fetch(`${baseUrl}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Aarav', email: 'aarav@example.com', subject: 'Praise', message: 'Great Tamil Porutham tool!' }),
  });
  assert.equal(goodFb.status, 201);

  // Sitemap includes all 4 new portals
  const smXml = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
  assert.ok(smXml.includes('/spiritual-tools'));
  assert.ok(smXml.includes('/healing-ayurveda'));
  assert.ok(smXml.includes('/tamil-porutham'));
  assert.ok(smXml.includes('/brihat-kundli'));
});

