-- GOO ASTROLOGY UNLIMITED FREE
-- Shared SQLite / Cloudflare D1 Schema (26 Enterprise Tables)

CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id INTEGER NOT NULL,
  permission_key TEXT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'astrologer' | 'admin'
  email_verified INTEGER NOT NULL DEFAULT 0,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY,
  phone TEXT,
  city TEXT,
  bio TEXT,
  privacy_public_chart INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS birth_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  birth_time TEXT NOT NULL,
  place_name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timezone_offset_minutes INTEGER NOT NULL DEFAULT 330,
  timezone_name TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  ayanamsha TEXT NOT NULL DEFAULT 'lahiri',
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kundli_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  birth_profile_id INTEGER,
  subject_name TEXT NOT NULL,
  input_json TEXT NOT NULL,
  summary_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS compatibility_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  total_score REAL NOT NULL,
  report_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS saved_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reading_type TEXT NOT NULL, -- 'kundli' | 'matching' | 'tarot' | 'numerology'
  title TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS astrologers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  specializations TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  languages TEXT NOT NULL DEFAULT 'Hindi, English',
  bio TEXT NOT NULL,
  consultation_rate_inr INTEGER NOT NULL DEFAULT 0,
  approval_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  is_available INTEGER NOT NULL DEFAULT 0,
  rating_avg REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS astrologer_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  astrologer_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (astrologer_id) REFERENCES astrologers(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  astrologer_id INTEGER NOT NULL,
  mode TEXT NOT NULL, -- 'chat' | 'voice' | 'video' | 'async_query'
  scheduled_for TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'requested', -- 'requested' | 'confirmed' | 'completed' | 'cancelled'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (astrologer_id) REFERENCES astrologers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_key TEXT NOT NULL,
  messages_json TEXT NOT NULL,
  engine_used TEXT NOT NULL DEFAULT 'local-vedic-kb',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tarot_cards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  arcana TEXT NOT NULL,
  upright_meaning TEXT NOT NULL,
  reversed_meaning TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tarot_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  spread_type TEXT NOT NULL,
  question TEXT,
  cards_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS numerology_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  full_name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  life_path INTEGER NOT NULL,
  destiny_number INTEGER NOT NULL,
  report_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS horoscope_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sign_index INTEGER NOT NULL,
  period TEXT NOT NULL, -- 'daily' | 'weekly' | 'monthly' | 'yearly'
  published_date TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_hi TEXT
);

CREATE TABLE IF NOT EXISTS panchang_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_str TEXT NOT NULL,
  city_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  UNIQUE(date_str, city_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  hindi_title TEXT,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published', -- 'draft' | 'published' | 'scheduled'
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS website_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS seo_settings (
  route_path TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT,
  noindex INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS advertisements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placement TEXT NOT NULL UNIQUE, -- 'header' | 'homepage' | 'sidebar' | 'article' | 'footer'
  enabled INTEGER NOT NULL DEFAULT 0,
  network_code TEXT DEFAULT '',
  ad_slot_id TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER,
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
