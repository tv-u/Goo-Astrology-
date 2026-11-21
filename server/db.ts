import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { INITIAL_ARTICLES } from '../src/data/articles';
import { TAROT_DECK } from '../src/engine/tarot';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'goo_astrology.db');
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  const schemaPath = path.resolve(process.cwd(), 'migrations', '0001_init.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schemaSql);

  // Seed default roles
  const insertRole = db.prepare('INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)');
  insertRole.run('user', 'Standard astrology platform member');
  insertRole.run('astrologer', 'Verified Vedic astrologer');
  insertRole.run('admin', 'Platform administrator');

  // Seed categories
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (slug, name) VALUES (?, ?)');
  const cats = [
    ['kundli-guides', 'Kundli Guides'],
    ['marriage-astrology', 'Marriage Astrology'],
    ['panchang-articles', 'Panchang Articles'],
    ['vastu-guides', 'Vastu Guides'],
    ['tarot-learning', 'Tarot Learning'],
    ['numerology-guides', 'Numerology Guides'],
  ];
  for (const [slug, name] of cats) {
    insertCategory.run(slug, name);
  }

  // Seed articles if empty
  const articleCount = (db.prepare('SELECT COUNT(*) as c FROM articles').get() as { c: number }).c;
  if (articleCount === 0) {
    const insArt = db.prepare(`
      INSERT INTO articles (slug, title, hindi_title, category, author, excerpt, body_json, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)
    `);
    for (const a of INITIAL_ARTICLES) {
      insArt.run(
        a.slug,
        a.title,
        a.hindiTitle,
        a.category,
        a.author,
        a.excerpt,
        JSON.stringify(a.body),
        a.publishedAt
      );
    }
  }

  // Seed tarot_cards reference table if empty
  const tarotCount = (db.prepare('SELECT COUNT(*) as c FROM tarot_cards').get() as { c: number }).c;
  if (tarotCount === 0) {
    const insTarot = db.prepare(`
      INSERT OR IGNORE INTO tarot_cards (id, name, arcana, upright_meaning, reversed_meaning)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const card of TAROT_DECK) {
      insTarot.run(card.id, card.name, card.arcana, card.uprightMeaning, card.reversedMeaning);
    }
  }

  // Seed default website settings
  const insSetting = db.prepare('INSERT OR IGNORE INTO website_settings (key, value) VALUES (?, ?)');
  const defaultSettings: [string, string][] = [
    ['site_name', 'GOO ASTROLOGY UNLIMITED FREE'],
    ['tagline', 'Discover Your Stars. Understand Your Life.'],
    ['default_ayanamsha', 'lahiri'],
    ['default_language', 'en'],
    ['maintenance_mode', 'false'],
    ['enable_ai_astrologer', 'true'],
    ['enable_consultations', 'true'],
    ['rtc_provider_configured', 'false'],
    ['google_search_console_meta', ''],
    ['indexnow_key', ''],
  ];
  for (const [k, v] of defaultSettings) {
    insSetting.run(k, v);
  }

  // Seed ad placements (all disabled by default — no fake ads)
  const insAd = db.prepare(
    'INSERT OR IGNORE INTO advertisements (placement, enabled, network_code, ad_slot_id) VALUES (?, 0, ?, ?)'
  );
  for (const p of ['header', 'homepage', 'sidebar', 'article', 'footer']) {
    insAd.run(p, '', '');
  }
}

export function writeAuditLog(
  actorUserId: number | null,
  action: string,
  target: string,
  details: string,
  ipAddress: string
) {
  db.prepare(
    'INSERT INTO audit_logs (actor_user_id, action, target, details, ip_address) VALUES (?, ?, ?, ?, ?)'
  ).run(actorUserId, action, target, details, ipAddress);
}
