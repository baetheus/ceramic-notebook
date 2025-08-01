-- migrate:up
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
  material_id INTEGER NOT NULL REFERENCES materials(material_id) ON DELETE CASCADE,
  parts REAL NOT NULL,
  PRIMARY KEY(recipe_revision_id, material_id)
) STRICT;

-- migrate:down
DROP TABLE IF EXISTS recipe_revision_materials;
DROP TABLE IF EXISTS recipe_revisions;
DROP TABLE IF EXISTS recipes;
