-- GOO ASTROLOGY UNLIMITED FREE - Enterprise Ecosystem Schema Extension

CREATE TABLE IF NOT EXISTS sync_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  license TEXT NOT NULL,
  refresh_interval_hours INTEGER NOT NULL DEFAULT 24,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS datasets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_slug TEXT NOT NULL,
  dataset_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  version TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  integrity_status TEXT NOT NULL DEFAULT 'verified',
  payload_json TEXT NOT NULL,
  previous_version TEXT,
  previous_checksum TEXT,
  previous_payload_json TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sync_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_slug TEXT NOT NULL,
  dataset_key TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  version TEXT NOT NULL,
  checksum_sha256 TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS research_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  birth_json TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  findings TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS study_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  entry_date TEXT NOT NULL,
  moon_sign TEXT NOT NULL DEFAULT '',
  dasha_period TEXT NOT NULL DEFAULT '',
  reflection TEXT NOT NULL,
  transit_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chart_annotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  chart_name TEXT NOT NULL,
  target_ref TEXT NOT NULL,
  note TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'gold',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course_slug TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0,
  certificate_code TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS widget_layouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  layout_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feature_flags (
  feature_code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  route TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
