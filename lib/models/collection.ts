import type { AsyncEither } from "fun/async_either";
import type { Err } from "~/lib/models/err.ts";

/**
 * A collection is effectively a CRUD interface for a "Full" struct over a
 * generic storage backend. The expectation of Collection is that the storage
 * backed implements and enforces data constraints during writes and the
 * Collection implementation parses the storage backend responses. This implies
 * that the Err type is generally a union of a StorageError and a ParseError.
 *
 * The intention of a Collection is to be as simple as possible for data storage
 * against simple storage backends. The first implementation is likely to be
 * against sqlite.
 */
export type Collection<
  Error extends Err,
  Update,
  Create extends Update,
  Full extends Create,
> = {
  /**
   * create takes a non-empty array of Create objects, stores them in the
   * storage back end, and returns an array of Full objects that correspond to
   * the Create objects that were stored. Generally, fields like created_at and
   * id are chosen by the storage backed.
   */
  create(
    create: readonly [Create, ...Create[]],
  ): AsyncEither<Error, readonly Full[]>;

  /**
   * find_by takes an array of columns that correspond to keys of Full and
   * returns a function that takes a match object that is a partial of Full with
   * only the match_columns specified. This function does a storage lookup where
   * all values match exactly the match columns specified.
   */
  find_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => AsyncEither<Error, readonly Full[]>;

  /**
   * update_by takes an array of match_columns that correspond to columns to
   * perform object lookup by, as well as an array of update columns,
   * corresponding to the columns to be changed. It then returns a function that
   * takes a struct with the fields to match on, like in find_by, and a struct
   * of the values to update on the found matches.
   */
  update_by<K extends keyof Full, V extends keyof Update>(
    match_columns: K[],
    update_columns: V[],
  ): (
    match: Pick<Full, K>,
    value: Pick<Update, V>,
  ) => AsyncEither<Err, readonly Full[]>;

  /**
   * delete_by takes an array of match columns that correspond to keys of Full
   * and returns a function that takes a struct of values for those keys. The
   * storage backend is expected to delete any objects that exactly match the
   * values for all of those keys and to return the Full objects that were
   * deleted.
   */
  delete_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => AsyncEither<Err, readonly Full[]>;

  /**
   * The list function takes optional count and offset values and returns a list
   * of count rows (defaulting to all) from offset.
   */
  list(count: number, offset: number): AsyncEither<Err, readonly Full[]>;
};

/**
 * Generic StorageError type represents an error that occurred in the storage
 * layer of a collection.
 */
export type StorageError = Err<"StorageError"> & {
  error: string;
  context?: unknown;
};

/**
 * Generic ParseError type represents an error that occurred wihle parsing the
 * response from the storage layer.
 */
export type ParseError = Err<"ParseError"> & {
  error: string;
  context?: unknown;
};

/**
 * Generic CollectionError represents the errors that can occur while using a
 * Collection Implementation
 */
export type CollectionError = StorageError | ParseError;

/**
 * A constructor function for StorageError
 */
export function storage_error(error: string, context?: unknown): StorageError {
  return { type: "StorageError", error, context };
}

/**
 * A constructor function for ParseError
 */
export function parse_error(error: string, context?: unknown): ParseError {
  return { type: "ParseError", error, context };
}
