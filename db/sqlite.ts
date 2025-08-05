/**
 * Implementation of ./types.ts#CreateDataAccess against a sqlite database.
 *
 * The ./types.ts file defines a generic sync access layer for the data we will
 * be using in ceramic-notebook. Here we implement an actual access layer using
 * the node:sqlite module fitted with response parsing by fun/decoder.
 */

import type { These } from "fun/these";
import type { Decoder } from "fun/decoder";

import type { CreateDataAccess, Table } from "./types.ts";

import sqlite from "node:sqlite";
import * as A from "fun/array";
import * as E from "fun/these";
import * as D from "fun/decoder";
import { pipe } from "fun/fn";

import * as T from "./schema.ts";

/**
 * Errors
 *
 * These are the types of errors we expect from either the sqlite library
 * throwing or the values from sqlite not parsing correctly
 */

type SqliteError = { type: "SqliteError"; error: unknown };
const sqlite_error = (error: unknown): SqliteError => ({
  type: "SqliteError",
  error,
});

type ParseError = { type: "ParseError"; error: string };
const parse_error = (error: string): ParseError => ({
  type: "ParseError",
  error,
});

export type DbError = SqliteError | ParseError;

export type DbResponse<A> = These<readonly DbError[], A>;

/**
 * Sqlite Utilities
 *
 * Functions for building, wrapping, and handling errors during the
 * execution of prepared statements.
 */

function all<A>(
  statement: sqlite.StatementSync,
  parameters: sqlite.SupportedValueType[],
  decoder: Decoder<unknown, A>,
): DbResponse<A> {
  try {
    type AllArgs = Parameters<typeof statement.all>;
    return pipe(
      statement.all.apply(statement, parameters as unknown as AllArgs),
      decoder,
      E.mapSecond((error) => [parse_error(D.draw(error))]),
    );
  } catch (error) {
    return E.left([sqlite_error(error)]);
  }
}

const from_columns = <R>(
  columns: (keyof R)[],
  value: R,
): sqlite.SupportedValueType[] =>
  columns.map((c) => value[c]) as sqlite.SupportedValueType[];

function chunks(
  chunk_length: number,
): <A>(as: readonly A[]) => { chunks: A[][]; last: A[] } {
  const _chunk_length = Math.max(1, Math.floor(chunk_length));
  return <A>(as: readonly A[]): { chunks: A[][]; last: A[] } => {
    const chunks: A[][] = [];
    const length = as.length;
    let last: A[] = [];
    let index = -1;

    while (++index < length) {
      last.push(as[index]);
      if (last.length === _chunk_length) {
        chunks.push(last);
        last = [];
      }
    }

    return { chunks, last };
  };
}

export function join<Full>(
  results: readonly DbResponse<readonly Full[]>[],
): DbResponse<readonly Full[]> {
  const left: DbError[] = [];
  const right: Full[] = [];
  const length = results.length;
  let index = -1;
  while (++index < length) {
    pipe(
      results[index],
      E.match(
        (ls) => {
          left.push(...ls);
        },
        (rs) => {
          right.push(...rs);
        },
        (ls, rs) => {
          left.push(...ls);
          right.push(...rs);
        },
      ),
    );
  }
  return E.both(left, right);
}

/**
 * Table Constructor
 *
 * Constructs all of the methods and queries related to performing CRUD against
 * a sqlite table. All queries are prepared so we should get a bit of speed.
 */
function table<Full, Create, Update>(
  db: sqlite.DatabaseSync,
  table: string,
  create_columns: (keyof Create)[],
  full_decoder: Decoder<unknown, Full>,
  create_chunk_size = 500,
): Table<Full, Create, Update, readonly DbError[]> {
  const chunk_size = Math.max(1, Math.floor(create_chunk_size));

  // Prepare the decoders
  const many_decoder = D.array(full_decoder);

  // We can prepare a few statements early
  const joined_columns = `(${create_columns.join(", ")})`;
  const replace_columns = `(${create_columns.map(() => "?").join(", ")})`;
  const map_create = (create: Create) => from_columns(create_columns, create);
  const map_chunks = A.flatmap(map_create);
  const list_statement = db.prepare(`SELECT * FROM ${table}`);

  return {
    create: (values) => {
      try {
        const { chunks: chunked_values, last } = pipe(
          values,
          chunks(chunk_size),
        );
        console.log({ chunks: chunked_values.length, last: last.length });
        const chunk_params = pipe(chunked_values, A.map(map_chunks));
        const chunk_replace = new Array(chunk_size).fill(replace_columns).join(
          ", ",
        );
        const chunk_statement = db.prepare(
          `INSERT INTO ${table} ${joined_columns} VALUES ${chunk_replace} RETURNING *;`,
        );
        const chunk_results = pipe(
          chunk_params,
          A.map((params) =>
            all(
              chunk_statement,
              params as sqlite.SupportedValueType[],
              many_decoder,
            )
          ),
        );

        if (last.length > 0) {
          const last_params = map_chunks(last);
          const last_replace = new Array(last.length).fill(replace_columns)
            .join(
              ", ",
            );
          const last_statement = db.prepare(
            `INSERT INTO ${table} ${joined_columns} VALUES ${last_replace} RETURNING *;`,
          );
          const last_results = all(
            last_statement,
            last_params as sqlite.SupportedValueType[],
            many_decoder,
          );
          return join(chunk_results.concat([last_results]));
        }
        return join(chunk_results);
      } catch (error) {
        return E.left([sqlite_error(error)]);
      }
    },

    find_by: (match_columns) => {
      const statement = db.prepare(
        `SELECT * FROM ${table} WHERE ${
          match_columns.map((c) => `${String(c)} = ?`).join(" AND ")
        }`,
      );
      return (value) =>
        all(statement, from_columns(match_columns, value), many_decoder);
    },

    update_by: (match_columns, update_columns) => {
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
      return (match, value) =>
        all(statement, [
          ...from_columns(update_columns, value),
          ...from_columns(match_columns, match),
        ], many_decoder);
    },
    delete_by: (match_columns) => {
      const statement = db.prepare(
        `DELETE FROM ${table} WHERE ${
          match_columns.map((c) => `${String(c)} = ?`).join(" AND ")
        } RETURNING *`,
      );
      return (match) =>
        all(statement, from_columns(match_columns, match), many_decoder);
    },

    list: () => all(list_statement, [], many_decoder),
  };
}

export type SqliteEnv = {
  readonly db: sqlite.DatabaseSync;
  readonly create_chunk_size?: number;
};

export const createDatabase: CreateDataAccess<
  SqliteEnv,
  readonly DbError[]
> = ({ db, create_chunk_size = 10_000 }) => {
  return {
    elements: table(
      db,
      "elements",
      [
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
      ],
      T.DecoderElement,
      create_chunk_size,
    ),
    molecules: table(
      db,
      "molecules",
      [
        "symbol",
        "name",
        "molar_mass",
      ],
      T.DecoderMolecule,
      create_chunk_size,
    ),
    molecule_elements: table(
      db,
      "molecule_elements",
      [
        "molecule_id",
        "atom_count",
        "atomic_number",
      ],
      T.DecoderMoleculeElement,
      create_chunk_size,
    ),
    materials: table(
      db,
      "materials",
      ["name", "category", "summary"],
      T.DecoderMaterial,
      create_chunk_size,
    ),
    material_analysis: table(
      db,
      "material_analysis",
      ["material_id", "notes"],
      T.DecoderMaterialAnalysis,
      create_chunk_size,
    ),
    material_analysis_molecules: table(
      db,
      "material_analysis_molecules",
      [
        "percentage",
        "material_analysis_id",
        "molecule_id",
      ],
      T.DecoderMaterialAnalysisMolecule,
      create_chunk_size,
    ),
    recipes: table(
      db,
      "recipes",
      ["name", "category", "summary"],
      T.DecoderRecipe,
      create_chunk_size,
    ),
    recipe_revisions: table(
      db,
      "recipe_revisions",
      ["recipe_id", "notes"],
      T.DecoderRecipeRevision,
      create_chunk_size,
    ),
    recipe_revision_materials: table(
      db,
      "recipe_revision_materials",
      [
        "parts",
        "recipe_revision_id",
        "material_id",
      ],
      T.DecoderRecipeRevisionMaterial,
      create_chunk_size,
    ),
  };
};
