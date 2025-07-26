import * as S from "fun/schemable";
import * as D from "fun/decoder";

const Element = S.schema((s) =>
  s.struct({
    // Description
    name: s.string(),
    symbol: s.string(),
    category: s.string(),
    source: s.string(),
    summary: s.string(),
    // Date
    atomic_mass: s.number(),
    number: s.number(),
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

const Elements = S.schema((s) => s.array(Element(s)));

const ElementsFile = S.schema((s) => s.struct({ elements: Elements(s) }));

type ElementsFile = S.TypeOf<typeof ElementsFile>;

const DecoderElementsFile = D.json(ElementsFile(D.SchemableDecoder));

export const parseFromFile = async (
  file_path: string = "./elements.json",
): Promise<D.Decoded<ElementsFile>> => {
  const file_raw = await Deno.readFile(file_path);
  const decoder = new TextDecoder();
  const file = decoder.decode(file_raw);
  const parsed = DecoderElementsFile(file);
  return parsed;
};
