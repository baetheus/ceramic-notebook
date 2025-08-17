/**
 * Implementation of ./types.ts#CreateDataAccess against a sqlite database.
 *
 * The ./types.ts file defines a generic sync access layer for the data we will
 * be using in ceramic-notebook. Here we implement an actual access layer using
 * the node:sqlite module fitted with response parsing by fun/decoder.
 */

import type { Decoder } from "fun/decoder";
import type { Either } from "fun/either";

import type { Collection } from "~/lib/models/collection.ts";
import type { CollectionError } from "~/lib/err.ts";

import sqlite from "node:sqlite";
import * as E from "fun/either";
import * as A from "fun/array";
import * as D from "fun/decoder";
import { flow, pipe } from "fun/fn";

import * as S from "~/lib/data/sqlite.ts";
import { parse_error } from "~/lib/err.ts";

/**
 * Take a sqlite statement, parameters, and a Decoder<A> and safely run
 * statement.all then parse the result with the Decoder. Returns an
 * Either<CollectionError, A>.
 */
function all<A>(
  statement: sqlite.StatementSync,
  parameters: readonly sqlite.SupportedValueType[],
  decoder: Decoder<unknown, A>,
): Either<CollectionError, A> {
  const parse_context =
    `Parsing result of sqlite statement.all with sql ${statement.sourceSQL} and ${parameters.length} parameter(s).`;

  const parser = flow(
    decoder,
    E.mapSecond((decode_error) => parse_error(parse_context, decode_error)),
  );

  return pipe(
    S.safe_run_statement(statement, parameters),
    E.flatmap(parser),
  );
}

/**
 * A helper function to turn an array of keys on the type R and an object of
 * type R into an array of sqlite.SupportedValueType. This is useful when using
 * a prepared statement.
 */
const from_columns = <R>(
  columns: (keyof R)[],
  value: R,
): sqlite.SupportedValueType[] =>
  columns.map((c) => value[c]) as sqlite.SupportedValueType[];

export type SqliteCollectionParams<Create, Full extends Create> = {
  db: sqlite.DatabaseSync;
  table: string;
  create_columns: (keyof Create)[];
  full_decoder: Decoder<unknown, Full>;
};

/**
 * Create a Collection using sqlite as the storage backend. This assumes that
 * the table for the collection has already been created.
 */
export function createCollection<
  Update,
  Create extends Update,
  Full extends Create,
>(
  { db, table, create_columns, full_decoder }: SqliteCollectionParams<
    Create,
    Full
  >,
): Collection<CollectionError, Update, Create, Full> {
  // Make a decoder for Full[]
  const many_decoder = D.array(full_decoder);

  // Cache column strings for create statements
  const joined_columns = `(${create_columns.join(", ")})`;
  const replace_columns = `(${create_columns.map(() => "?").join(", ")})`;

  // Map an array of create objects into sqlite parameters
  const map_create = (create: Create) => from_columns(create_columns, create);
  const map_chunks = A.flatmap(map_create);

  // Wrap db.prepare in a tryCatch but evaluate the prepare immediately, then
  // wrap it in an Either. This allows the actual caching of the prepared
  // statement but also lets us catch any thrown errors by db.prepare.
  const safe_prepare = S.create_safe_prepare(db);

  // List statement
  const list_statement = safe_prepare(
    `SELECT * from ${table} LIMIT ? OFFSET ?`,
  );

  return {
    create: (values) => {
      const value_params = map_chunks(values);
      const value_str = pipe(values, A.map(() => replace_columns)).join(", ");
      return pipe(
        safe_prepare(
          `INSERT INTO ${table} ${joined_columns} VALUES ${value_str} RETURNING *;`,
        ),
        E.flatmap((statement) => all(statement, value_params, many_decoder)),
      );
    },

    find_by: (match_columns) => {
      const safe_statement = safe_prepare(
        `SELECT * FROM ${table} WHERE ${
          match_columns.map((c) => `${String(c)} = ?`).join(" AND ")
        }`,
      );
      return (value) =>
        pipe(
          safe_statement,
          E.flatmap((statement) =>
            all(statement, from_columns(match_columns, value), many_decoder)
          ),
        );
    },

    update_by: (match_columns, update_columns) => {
      const safe_statement = safe_prepare(
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
        pipe(
          safe_statement,
          E.flatmap((statement) =>
            all(statement, [
              ...from_columns(update_columns, value),
              ...from_columns(match_columns, match),
            ], many_decoder)
          ),
        );
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

    list: (count, offset) =>
      pipe(
        list_statement,
        E.flatmap((statement) => all(statement, [count, offset], many_decoder)),
      ),
  };
}
