-- Migration 0003: Privacy-first Route, Calculator & Ad-Slot Analytics Counters + Tarot Mood Log
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route TEXT NOT NULL,
  feature_key TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL CHECK(event_type IN ('page_view', 'calculator_run', 'ad_impression', 'ad_click')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_route ON analytics_events(route);
CREATE INDEX IF NOT EXISTS idx_analytics_type_created ON analytics_events(event_type, created_at);
