/**
 * Implementation of ./types.ts#CreateDataAccess against a sqlite database.
 *
 * The ./types.ts file defines a generic sync access layer for the data we will
 * be using in ceramic-notebook. Here we implement an actual access layer using
 * the node:sqlite module fitted with response parsing by fun/decoder.
 */

import type { Decoder } from "fun/decoder";
import type { AsyncEither } from "fun/async_either";

import type { Collection, CollectionError } from "~/lib/models/collection.ts";

import sqlite from "node:sqlite";
import * as AE from "fun/async_either";
import * as E from "fun/either";
import * as A from "fun/array";
import * as D from "fun/decoder";
import { flow, pipe } from "fun/fn";

import * as C from "~/lib/models/collection.ts";

/**
 * Take a prepared statement and parameters and apply the parameters to the
 * statement using Function.apply. This is because passing large parameter
 * arrays into a function with the spread operator tends to hit the stack
 * overflow limit.
 */
function run_statement(
  statement: sqlite.StatementSync,
  parameters: readonly sqlite.SupportedValueType[],
) {
  // deno-lint-ignore no-explicit-any
  return statement.all.apply(statement, parameters as any);
}

/**
 * Wrap the run_statement function in a tryCatch that returns an
 * AsyncEither<StorageError, unknown[]>
 */
const safe_run_statement = AE.tryCatch(
  run_statement,
  (err, [statement, params]) =>
    C.storage_error(
      `Running sqlite statement.all with sql ${statement.sourceSQL} and ${params.length} parameter(s).`,
      err,
    ),
);

/**
 * Take a sqlite statement, parameters, and a Decoder<A> and safely run
 * statement.all then parse the result with the Decoder. Returns an
 * AsyncEither<CollectionError, A>.
 */
function all<A>(
  statement: sqlite.StatementSync,
  parameters: readonly sqlite.SupportedValueType[],
  decoder: Decoder<unknown, A>,
): AsyncEither<CollectionError, A> {
  const parse_context =
    `Parsing result of sqlite statement.all with sql ${statement.sourceSQL} and ${parameters.length} parameter(s).`;

  const parser = flow(
    decoder,
    E.mapSecond(flow(
      D.draw,
      (error) => C.parse_error(parse_context, error),
    )),
    AE.fromEither,
  );

  return pipe(
    safe_run_statement(statement, parameters),
    AE.flatmap(parser),
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
  // wrap it in an AsyncEither. This allows the actual caching of the prepared
  // statement but also lets us catch any thrown errors by db.prepare.
  const safe_prepare = flow(
    E.tryCatch(
      db.prepare,
      (error, [sql]) =>
        C.storage_error("Error preparing sqlite sql statement", { error, sql }),
    ),
    AE.fromEither,
  );

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
        AE.flatmap((statement) => all(statement, value_params, many_decoder)),
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
          AE.flatmap((statement) =>
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
          AE.flatmap((statement) =>
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
        AE.flatmap((statement) =>
          all(statement, [count, offset], many_decoder)
        ),
      ),
  };
}
