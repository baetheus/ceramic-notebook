-- migrate:up
PRAGMA foreign_keys = ON;

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
  atomic_number INTEGER NOT NULL REFERENCES elements(atomic_number) ON DELETE CASCADE,
  atom_count INTEGER NOT NULL,
  PRIMARY KEY(molecule_id, atomic_number)
) STRICT;


-- migrate:down
DROP TABLE IF EXISTS molecules_elements;
DROP TABLE IF EXISTS molecules;
PRAGMA foreign_keys = OFF;
