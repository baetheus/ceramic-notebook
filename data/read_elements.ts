import * as S from "fun/schemable";
import * as D from "fun/decoder";
import * as E from "fun/either";

const Element = S.schema((s) =>
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

export const Elements = S.schema((s) => s.array(Element(s)));

const ElementsFile = S.schema((s) => s.struct({ elements: Elements(s) }));

export type ElementsFile = S.TypeOf<typeof ElementsFile>;

const DecoderElementsFile = D.json(ElementsFile(D.SchemableDecoder));

export const parseFromFile = async (
  file_path: string = "./elements.json",
): Promise<ElementsFile> => {
  const file_raw = await Deno.readFile(file_path);
  const decoder = new TextDecoder();
  const file = decoder.decode(file_raw);
  const parsed = DecoderElementsFile(file);
  if (E.isLeft(parsed)) {
    console.error(D.draw(parsed.left));
    throw new Error(`Unable to parse ${file_path}.`);
  }
  return parsed.right;
};
