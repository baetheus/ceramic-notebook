import type { NonEmptyArray } from "fun/array";
import type { Either } from "fun/either";
import type { Err } from "~/lib/err.ts";

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
    create: NonEmptyArray<Create>,
  ): Either<Error, readonly Full[]>;

  /**
   * find_by takes an array of columns that correspond to keys of Full and
   * returns a function that takes a match object that is a partial of Full with
   * only the match_columns specified. This function does a storage lookup where
   * all values match exactly the match columns specified.
   */
  find_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => Either<Error, readonly Full[]>;

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
  ) => Either<Err, readonly Full[]>;

  /**
   * delete_by takes an array of match columns that correspond to keys of Full
   * and returns a function that takes a struct of values for those keys. The
   * storage backend is expected to delete any objects that exactly match the
   * values for all of those keys and to return the Full objects that were
   * deleted.
   */
  delete_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => Either<Err, readonly Full[]>;

  /**
   * The list function takes optional count and offset values and returns a list
   * of count rows (defaulting to all) from offset.
   */
  list(count: number, offset: number): Either<Err, readonly Full[]>;
};
