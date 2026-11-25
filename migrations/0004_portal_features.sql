-- Phase 4: Portal Expansion (Newsletter Subscribers & Prashna Devotional Journal)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  source_route TEXT NOT NULL DEFAULT '/',
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
