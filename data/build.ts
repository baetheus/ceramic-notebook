import { DatabaseSync } from "node:sqlite";

import * as Elements from "./read_elements.ts";
import * as Glazy from "./read_glazy.ts";
import * as A from "fun/array";
import * as O from "fun/option";
import * as R from "fun/record";
import { pipe } from "fun/fn";

/**
 * CONSTANTS
 */

const DATABASE_URL = Deno.env.get("DATABASE_URL");
const ELEMENTS_JSON = Deno.env.get("ELEMENTS_JSON") ?? "./data/elements.json";
const GLAZY_JSON = Deno.env.get("ELEMENTS_JSON") ?? "./data/glazy.json";

/**
 * Setup Database
 */

if (DATABASE_URL === undefined) {
  throw new Error("DATABASE_URL environment variable must be set");
}

console.log(`Connecting to database at ${DATABASE_URL}`);

const db = new Database(DATABASE_URL.split(":")[1]);

/**
 * Create Elements table and insert all elements
 */

console.log(`Parsing elements json from ${ELEMENTS_JSON}.`);

const { elements } = await Elements.parseFromFile("./data/elements.json");

console.log(`Inserting ${elements.length} elements`);

elements.forEach((e) => {
  db.sql`INSERT INTO elements VALUES(${e.number}, ${e.name}, ${e.symbol}, ${e.category}, ${e.source}, ${e.summary}, ${e.atomic_mass}, ${Date.now()}, ${Date.now()}, ${e.boil}, ${e.melt}, ${e.discovered_by}, ${e.named_by}) ON CONFLICT DO NOTHING;`;
});

/**
 * Create Molecules
 */

console.log(`Parsing glazy data from ${GLAZY_JSON}.`);

const glazyData = await Glazy.parseFromFile(GLAZY_JSON);

const materials = pipe(glazyData, A.filter((d) => d.Type === "Material"));
const recipes = pipe(glazyData, A.filter((d) => d.Type === "Recipe"));
const analysis = pipe(glazyData, A.filter((d) => d.Type === "Analysis"));

console.log(
  `Found ${materials.length} materials, ${recipes.length} recipes, and ${analysis.length} analysis.`,
);

type Symbols = typeof Elements.SYMBOLS[number];
type Molecules = typeof Glazy.ANALYSIS[number];

type DissasembledMolecule = {
  molecule: Molecules;
  elements: Partial<Record<Symbols, number>>;
};

const disassemble_molecule = (molecule: Molecules): DissasembledMolecule => {
  const result: DissasembledMolecule = { molecule, elements: {} };

  if (molecule === "LOI") {
    return result;
  }

  const elementRegex = /([A-Z][a-z]?)(\d*)/g;
  let match;

  while ((match = elementRegex.exec(molecule)) !== null) {
    const elementSymbol = match[1] as Symbols;
    const count = match[2] ? parseInt(match[2], 10) : 1;
    result.elements[elementSymbol] = count;
  }

  return result;
};

type WithMolarMass = DissasembledMolecule & { molar_mass: number };

const calculate_molar_mass = (dmol: DissasembledMolecule): WithMolarMass =>
  pipe(
    dmol.elements,
    Object.entries,
    A.fold((total, [symbol, count]) => {
      const s = symbol as unknown as Symbols;
      const mass = pipe(
        elements,
        A.first((e) => e.symbol === s),
        O.map((e) => e.atomic_mass),
        O.getOrElse(() => 0),
      );
      return total + mass * count;
    }, 0),
    (molar_mass) => ({ ...dmol, molar_mass }),
  );

const molar_masses = pipe(
  Glazy.ANALYSIS,
  A.map(disassemble_molecule),
  A.map(calculate_molar_mass),
);

console.log(`Inserting ${molar_masses.length} molecules into molecules table.`);

molar_masses.forEach((m, n) => {
  const name = Glazy.ANALYSIS_NAMES[m.molecule];
  db.sql`INSERT INTO molecules VALUES(${n}, ${name}, ${m.molecule}, ${m.molar_mass}, ${Date.now()}, ${Date.now()}) ON CONFLICT DO NOTHING;`;

  const joins = pipe(
    Object.entries(m.elements),
    A.map(([symbol, count]) =>
      [pipe(elements, A.first((ee) => ee.symbol === symbol)), count] as const
    ),
  );

  console.log(
    `Inserting ${joins.length} joins into molecule_elements table for ${name}`,
  );

  joins.forEach(([oe, atom_count]) => {
    if (O.isNone(oe)) {
      return;
    }
    const element = oe.value;
    db.sql`INSERT INTO molecule_elements VALUES(${n}, ${element.number}, ${atom_count}) ON CONFLICT DO NOTHING;`;
  });
});

/**
 * Now to add materials
 */

console.log(
  `Inserting ${materials.length} materials into the materials table.`,
);

materials.forEach((m, n) => {
  db.sql`INSERT INTO materials VALUES(${n}, ${m.Name}, ${m.Subtype ?? "Raw"}, ${
    m.Description ?? ""
  }, ${Date.now()}, ${Date.now()}) ON CONFLICT DO NOTHING;`;

  const analysis = m["Percent Analysis"];
});
