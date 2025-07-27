import { Database } from "sqlite";

import * as Glazy from "./read_glazy.ts";
import * as Elements from "./read_elements.ts";

/**
 * Create Database
 */

const db = new Database("test.db");

/**
 * Create Elements table and insert all elements
 */

const { elements } = await Elements.parseFromFile("./data/elements.json");

// Create Table
db.exec(
  `CREATE TABLE IF NOT EXISTS elements (number INTEGER PRIMARY KEY ASC, name NOT NULL, symbol NOT NULL, category NOT NULL, source NOT NULL, summary NOT NULL, atomic_mass NOT NULL, boil, melt, discovered_by, named_by);`,
);

// Insert Elements
elements.forEach((e) => {
  db.sql`INSERT INTO elements VALUES(${e.number}, ${e.name}, ${e.symbol}, ${e.category}, ${e.source}, ${e.summary}, ${e.atomic_mass}, ${e.boil}, ${e.melt}, ${e.discovered_by}, ${e.named_by}) ON CONFLICT DO NOTHING;`;
});

const result = db.sql`select * from elements`;
console.log(result);

/**
 * Create Materials table and insert all elements
 */

const materials = await Glazy.parseFromFile();
