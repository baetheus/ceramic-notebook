import type { Either } from "fun/either";
import type { Database, Table } from "./types.ts";

import * as sqlite from "sqlite";
import * as E from "fun/either";
import { pipe } from "fun/fn";

type Struct = Record<string, unknown>;

function all<R extends Struct>(
  statement: sqlite.Statement,
  parameters: sqlite.RestBindParameters,
): Either<Error, R[]> {
  try {
    const result = statement.all<R>(...parameters);
    return result
      ? E.right(result)
      : E.left(new Error("Failed to execute query."));
  } catch (error) {
    return error instanceof Error
      ? E.left(error)
      : E.left(new Error("Unknown Error"));
  }
}

function one<R extends Struct>(
  statement: sqlite.Statement,
  parameters: sqlite.RestBindParameters,
): Either<Error, R> {
  return pipe(
    all(statement, parameters),
    E.flatmap(([result]) =>
      result ? E.right(result as R) : E.left(new Error("Data does not exist"))
    ),
  );
}

const from_columns = <R>(
  columns: (keyof R)[],
  value: R,
): sqlite.RestBindParameters =>
  columns.map((c) => value[c]) as sqlite.RestBindParameters;

function create<Create, Full extends Struct>(
  db: sqlite.Database,
  table: string,
  columns: (keyof Create)[],
) {
  const statement = db.prepare(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${
      Array.from({ length: columns.length }).fill("?").join(", ")
    }) RETURNING *`,
  );
  return (value: Create) => one<Full>(statement, from_columns(columns, value));
}

function find_by<Full extends Struct, K extends keyof Full>(
  db: sqlite.Database,
  table: string,
  columns: K[],
) {
  const statement = db.prepare(
    `SELECT * FROM ${table} WHERE ${
      columns.map((c) => `${String(c)} = ?`).join(" AND ")
    }`,
  );
  return (value: Pick<Full, K>) =>
    all<Full>(statement, from_columns(columns, value));
}

function update_by<
  Full extends Struct,
  Update,
  K extends keyof Full,
  V extends keyof Update,
>(
  db: sqlite.Database,
  table: string,
  match_columns: K[],
  update_columns: V[],
) {
  const statement = db.prepare(
    `UPDATE ${table} SET ${
      update_columns.map((c) => `${String(c)} = COALESCE(?, ${String(c)})`)
        .join(
          ", ",
        )
    } WHERE ${
      match_columns.map((c) => `${String(c)} = ?`).join(" AND ")
    } RETURNING *`,
  );
  return (match: Pick<Full, K>, value: Update) =>
    all<Full>(statement, [
      ...from_columns(update_columns, value),
      ...from_columns(match_columns, match),
    ]);
}

function delete_by<Full extends Struct, K extends keyof Full>(
  db: sqlite.Database,
  table: string,
  match_columns: K[],
) {
  const statement = db.prepare(
    `DELETE FROM ${table} WHERE ${
      match_columns.map((c) => `${String(c)} = ?`).join(" AND ")
    } RETURNING *`,
  );
  return (match: Pick<Full, K>) =>
    all<Full>(statement, from_columns(match_columns, match));
}

function list<Full extends Struct>(db: sqlite.Database, table: string) {
  const statement = db.prepare(`SELECT * FROM ${table}`);
  return () => all<Full>(statement, []);
}

function table<Full extends Struct, Create, Update>(
  db: sqlite.Database,
  table: string,
  create_columns: (keyof Create)[],
): Table<Full, Create, Update, Error> {
  return {
    create: create(db, table, create_columns),
    find_by: (match_columns) => find_by(db, table, match_columns),
    update_by: (match_columns, update_columns) =>
      update_by(db, table, match_columns, update_columns),
    delete_by: (match_columns) => delete_by(db, table, match_columns),
    list: list(db, table),
  };
}

export const createDatabase: Database<sqlite.Database, Error> = (db) => {
  return {
    elements: table(db, "elements", [
      "atomic_number",
      "symbol",
      "name",
      "category",
      "source",
      "summary",
      "atomic_mass",
      "boil",
      "melt",
      "discovered_by",
      "named_by",
    ]),
    molecules: table(db, "molecules", [
      "symbol",
      "name",
      "molar_mass",
    ]),
    molecule_elements: table(db, "molecule_elements", [
      "molecule_id",
      "atom_count",
      "atomic_number",
    ]),
    materials: table(db, "materials", ["name", "category", "summary"]),
    material_analysis: table(db, "material_analysis", ["material_id", "notes"]),
    material_analysis_molecules: table(db, "material_analysis_molecules", [
      "percentage",
      "material_analysis_id",
      "molecule_id",
    ]),
    recipes: table(db, "recipes", ["name", "category", "summary"]),
    recipe_revisions: table(db, "recipe_revisions", ["recipe_id", "notes"]),
    recipe_revision_materials: table(db, "recipe_revision_materials", [
      "parts",
      "recipe_revision_id",
      "material_id",
    ]),
  };
};
