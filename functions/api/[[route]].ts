// Cloudflare Pages Functions handler (compatible with Cloudflare D1 binding `DB`)
import { calculateKundli } from '../../src/engine/ephemeris';
import { calculatePanchang } from '../../src/engine/panchang';

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
    });
  }

  if (url.pathname === '/api/panchang') {
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const lat = Number(url.searchParams.get('lat') || 28.6139);
    const lon = Number(url.searchParams.get('lon') || 77.209);
    const tz = Number(url.searchParams.get('tz') || 330);
    const place = url.searchParams.get('place') || 'New Delhi, India';
    return Response.json(calculatePanchang(date, lat, lon, tz, place));
  }

  if (url.pathname === '/api/kundli' && context.request.method === 'POST') {
    const body = (await context.request.json()) as Parameters<typeof calculateKundli>[0];
    return Response.json(calculateKundli(body));
  }

  if (url.pathname === '/api/articles' && context.env.DB) {
    const { results } = await context.env.DB.prepare(
      "SELECT slug, title, hindi_title, category, author, excerpt, body_json, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC"
    ).all();
    return Response.json({ articles: results });
  }

  return Response.json({ error: 'Endpoint handled by Express in full-stack Node mode or configure D1 route.' }, { status: 404 });
}
