/**
 * This file contains all the error types we use in this application.
 */
import type { DecodeError } from "fun/decoder";

/**
 * An Err is the minimum type to represent an error in most of my applications.
 */
export type Err<T extends string = string> = {
  readonly type: T;
  readonly message: string;
  readonly context?: unknown;
};

/**
 * Generic StorageError type represents an error that occurred in the storage
 * layer of a collection.
 */
export type StorageError = Err<"StorageError">;

/**
 * Generic ParseError type represents an error that occurred wihle parsing the
 * response from the storage layer.
 */
export type ParseError = Err<"ParseError"> & {
  readonly decode_error: DecodeError;
};

/**
 * Generic CollectionError represents the errors that can occur while using a
 * Collection Implementation
 */
export type CollectionError = StorageError | ParseError;

/**
 * A constructor function for StorageError
 */
export function storage_error(
  message: string,
  context?: unknown,
): StorageError {
  return { type: "StorageError", message, context };
}

/**
 * A constructor function for ParseError
 */
export function parse_error(
  message: string,
  decode_error: DecodeError,
  context?: unknown,
): ParseError {
  return { type: "ParseError", message, decode_error, context };
}
