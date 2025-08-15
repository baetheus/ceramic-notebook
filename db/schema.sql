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
  named_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
) STRICT;
CREATE TABLE molecules(
  molecule_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  molar_mass REAL NOT NULL,
  created_at TEXT NULL DEFAULT (datetime('now')),
  updated_at TEXT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE TABLE molecule_elements(
  molecule_id INTEGER NOT NULL REFERENCES molecules(molecule_id) ON DELETE CASCADE,
  atomic_number INTEGER NOT NULL REFERENCES elements(atomic_number) ON DELETE RESTRICT,
  atom_count INTEGER NOT NULL,
  PRIMARY KEY(molecule_id, atomic_number)
) STRICT;
CREATE TABLE materials(
  material_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NULL DEFAULT (datetime('now')),
  updated_at TEXT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE TABLE material_analysis(
  material_analysis_id INTEGER PRIMARY KEY,
  material_id INTEGER NOT NULL REFERENCES materials(material_id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TEXT NULL DEFAULT (datetime('now')),
  updated_at TEXT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE TABLE material_analysis_molecules(
  material_analysis_id INTEGER NOT NULL REFERENCES material_analysis(material_analysis_id) ON DELETE CASCADE,
  molecule_id INTEGER NOT NULL REFERENCES molecules(molecule_id) ON DELETE RESTRICT,
  percentage REAL NOT NULL,
  PRIMARY KEY(material_analysis_id, molecule_id)
) STRICT;
CREATE TABLE recipes(
  recipe_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NULL DEFAULT (datetime('now')),
  updated_at TEXT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE TABLE recipe_revisions(
  recipe_revision_id INTEGER PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TEXT NULL DEFAULT (datetime('now')),
  updated_at TEXT NULL DEFAULT (datetime('now'))
) STRICT;
CREATE TABLE recipe_revision_materials(
  recipe_revision_id INTEGER NOT NULL REFERENCES recipe_revisions(recipe_revision_id) ON DELETE CASCADE,
  material_analysis_id INTEGER NOT NULL REFERENCES material_analysis(material_analysis_id) ON DELETE RESTRICT,
  parts REAL NOT NULL,
  PRIMARY KEY(recipe_revision_id, material_analysis_id)
) STRICT;
-- Dbmate schema migrations
INSERT INTO "schema_migrations" (version) VALUES
  ('20250727173215'),
  ('20250727204620'),
  ('20250727213846'),
  ('20250727234025'),
  ('20250807063319');
