import type { Element } from "~/lib/models/schema.ts";
import type { KeramosData } from "~/lib/models/keramos_data.ts";
import type { CollectionError } from "~/lib/err.ts";

import * as A from "fun/array";
import * as S from "fun/schemable";
import * as D from "fun/decoder";
import * as E from "fun/either";
import { pipe } from "fun/fn";

import { parse_error } from "~/lib/err.ts";

/**
 * The Schema of the expected 
 */
export const RawElement = S.schema((s) =>
  s.struct({
    // Description
    number: s.number(),
    name: s.string(),
    symbol: s.string(),
    category: s.string(),
    source: s.string(),
    summary: s.string(),
    // Data
    atomic_mass: s.number(),
    period: s.number(),
    group: s.number(),
    phase: s.string(),
    // Not sure if useful
    boil: s.nullable(s.number()),
    melt: s.nullable(s.number()),
    discovered_by: s.nullable(s.string()),
    named_by: s.nullable(s.string()),
  })
);
export type RawElement = S.TypeOf<typeof RawElement>;
export const DecoderRawElement = RawElement(D.SchemableDecoder);

export const RawElements = S.schema((s) => s.array(RawElement(s)));
export type RawElements = S.TypeOf<typeof RawElements>;
export const DecoderRawElements = RawElements(D.SchemableDecoder);

export const viewRawElement = (
  {
    number,
    name,
    symbol,
    category,
    source,
    summary,
    atomic_mass,
    boil,
    melt,
    discovered_by,
    named_by,
  }: RawElement,
) => ({
  atomic_number: number,
  name,
  symbol,
  category,
  source,
  summary,
  atomic_mass,
  boil,
  melt,
  discovered_by,
  named_by,
});

export function store_elements(
  elements: unknown,
  data: KeramosData,
): E.Either<CollectionError, readonly Element[]> {
  return pipe(
    DecoderRawElements(elements),
    E.mapSecond((decode_error) =>
      parse_error("Unable to parse CreateElements.", decode_error)
    ),
    E.map(A.map(viewRawElement)),
    E.flatmap((els) =>
      A.isNonEmpty(els) ? data.elements.create(els) : E.right([])
    ),
  );
}
