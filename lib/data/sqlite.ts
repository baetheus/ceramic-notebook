import sqlite from "node:sqlite";
import * as E from "fun/either";
import { flow } from "fun/fn";

import { storage_error } from "~/lib/err.ts";

// These are sane client PRAGMAS to use with sqlite
export const PRAGMAS = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
PRAGMA foreign_keys = ON;
PRAGMA mmap_size = 268435456;
`;

/**
 * Take a prepared statement and parameters and apply the parameters to the
 * statement using Function.apply. This is because passing large parameter
 * arrays into a function with the spread operator tends to hit the stack
 * overflow limit.
 *
 * This function can throw.
 */
function run_statement(
  statement: sqlite.StatementSync,
  parameters: readonly sqlite.SupportedValueType[],
): unknown[] {
  // deno-lint-ignore no-explicit-any
  return statement.all.apply(statement, parameters as any);
}

/**
 * Wrap the run_statement function in a tryCatch that returns an
 * AsyncEither<StorageError, unknown[]>
 */
export const safe_run_statement = E.tryCatch(
  run_statement,
  (err, [statement, params]) =>
    storage_error(
      `Running sqlite statement.all with sql ${statement.sourceSQL} and ${params.length} parameter(s).`,
      err,
    ),
);

/**
 * Take a DatabaseSync and return a safe db.prepare function that will wrap
 * thrown errors in an Either
 */
export const create_safe_prepare = (db: sqlite.DatabaseSync) =>
  E.tryCatch(
    db.prepare,
    (error, [sql]) =>
      storage_error("Error preparing sqlite sql statement", { error, sql }),
  );

/**
 * A sqlite DatabaseSync wrapped in a try catch block. Thrown errors are then
 * wrapped in a structured StorageError inside of an Either
 */
export const create_database = flow(E.tryCatch(
  (...params: ConstructorParameters<typeof sqlite.DatabaseSync>) =>
    new sqlite.DatabaseSync(...params),
  (error, params) =>
    storage_error("Could not create sqlite DatabaseSync", { error, params }),
));
