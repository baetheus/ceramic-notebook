/**
 * An Err is the minimum type to represent an error in most of my applications.
 */
export type Err<T extends string = string> = { readonly type: T };
