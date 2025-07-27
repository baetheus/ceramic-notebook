CREATE TABLE IF NOT EXISTS "schema_migrations" (version varchar(128) primary key);
CREATE TABLE elements(
  atomic_number INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT NOT NULL,
  atomic_mass REAL NOT NULL,
  boil REAL,
  melt REAL,
  discovered_by TEXT,
  named_by TEXT
);
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20250727173215');
