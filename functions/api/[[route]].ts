// Cloudflare Pages Functions handler (compatible with Cloudflare D1 binding `DB` named `u-tv`)
import { calculateKundli } from '../../src/engine/ephemeris';
import { calculatePanchang } from '../../src/engine/panchang';
import { calculateAshtakoot } from '../../src/engine/ashtakoot';
import { getUpcomingEclipses } from '../../src/engine/planetaryIntelligence';

interface Env {
  DB?: {
    prepare: (sql: string) => {
      bind: (...args: unknown[]) => { all: () => Promise<{ results: unknown[] }> };
      all: () => Promise<{ results: unknown[] }>;
    };
  };
}

export async function onRequest(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  if (url.pathname === '/api/health') {
    return Response.json({
      ok: true,
      runtime: 'cloudflare-pages-functions',
      d1Bound: Boolean(context.env.DB),
      databaseName: 'u-tv',
    });
  }

  if (url.pathname === '/api/panchang' || url.pathname === '/api/v1/calculate/panchang') {
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const lat = Number(url.searchParams.get('lat') || 28.6139);
    const lon = Number(url.searchParams.get('lon') || 77.209);
    const tz = Number(url.searchParams.get('tz') || 330);
    const place = url.searchParams.get('place') || 'New Delhi, India';
    return Response.json(calculatePanchang(date, lat, lon, tz, place));
  }

  if ((url.pathname === '/api/kundli' || url.pathname === '/api/v1/calculate/kundli') && context.request.method === 'POST') {
    const body = (await context.request.json()) as Parameters<typeof calculateKundli>[0];
    return Response.json(calculateKundli(body));
  }

  if ((url.pathname === '/api/matching' || url.pathname === '/api/v1/calculate/matching') && context.request.method === 'POST') {
    const body = (await context.request.json()) as {
      bride: Parameters<typeof calculateKundli>[0];
      groom: Parameters<typeof calculateKundli>[0];
    };
    const brideKundli = calculateKundli(body.bride);
    const groomKundli = calculateKundli(body.groom);
    return Response.json({ brideKundli, groomKundli, report: calculateAshtakoot(brideKundli, groomKundli) });
  }

  if (url.pathname === '/api/v1/calculate/eclipses') {
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const lat = Number(url.searchParams.get('lat') || 28.6139);
    const lon = Number(url.searchParams.get('lon') || 77.209);
    return Response.json(getUpcomingEclipses(date, lat, lon));
  }

  if (url.pathname === '/api/articles' && context.env.DB) {
    const { results } = await context.env.DB.prepare(
      "SELECT slug, title, hindi_title, category, author, excerpt, body_json, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC"
    ).all();
    return Response.json({ articles: results });
  }

  return Response.json({ error: 'Endpoint handled by Express in full-stack Node mode or configure D1 route.' }, { status: 404 });
}
