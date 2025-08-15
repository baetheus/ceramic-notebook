-- migrate:up
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

-- migrate:down
DROP TABLE IF EXISTS material_analysis_molecules;
DROP TABLE IF EXISTS material_analysis;
DROP TABLE IF EXISTS materials;
