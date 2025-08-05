import type { Either } from "fun/either";

export type Collection<Full, Create, Update, Err> = {
  create(create: readonly [Create, ...Create[]]): Either<Err, readonly Full[]>;
  find_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => Either<Err, readonly Full[]>;
  update_by<K extends keyof Full, V extends keyof Update>(
    match_columns: K[],
    update_columns: V[],
  ): (match: Pick<Full, K>, value: Update) => Either<Err, readonly Full[]>;
  delete_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => Either<Err, readonly Full[]>;
  list(): Either<Err, readonly Full[]>;
};
