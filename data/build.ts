import { Database } from "sqlite";

import * as Elements from "./read_elements.ts";

/**
 * Create Database
 */

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (DATABASE_URL === undefined) {
  throw new Error("DATABASE_URL environment variable must be set");
}
console.log(`DATABASE_URL=${DATABASE_URL}`);

const db = new Database(DATABASE_URL.split(":")[1]);

/**
 * Create Elements table and insert all elements
 */

const { elements } = await Elements.parseFromFile("./data/elements.json");

// Insert Elements
elements.forEach((e) => {
  db.sql`INSERT INTO elements VALUES(${e.number}, ${e.name}, ${e.symbol}, ${e.category}, ${e.source}, ${e.summary}, ${e.atomic_mass}, ${Date.now()}, ${Date.now()}, ${e.boil}, ${e.melt}, ${e.discovered_by}, ${e.named_by}) ON CONFLICT DO NOTHING;`;
});

const result = db.sql`select * from elements`;
console.log(result);
