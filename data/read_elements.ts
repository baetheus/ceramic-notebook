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

export const SYMBOLS = [
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Sc",
  "Ti",
  "V",
  "Cr",
  "Mn",
  "Fe",
  "Co",
  "Ni",
  "Cu",
  "Zn",
  "Ga",
  "Ge",
  "As",
  "Se",
  "Br",
  "Kr",
  "Rb",
  "Sr",
  "Y",
  "Zr",
  "Nb",
  "Mo",
  "Tc",
  "Ru",
  "Rh",
  "Pd",
  "Ag",
  "Cd",
  "In",
  "Sn",
  "Sb",
  "Te",
  "I",
  "Xe",
  "Cs",
  "Ba",
  "La",
  "Ce",
  "Pr",
  "Nd",
  "Pm",
  "Sm",
  "Eu",
  "Gd",
  "Tb",
  "Dy",
  "Ho",
  "Er",
  "Tm",
  "Yb",
  "Lu",
  "Hf",
  "Ta",
  "W",
  "Re",
  "Os",
  "Ir",
  "Pt",
  "Au",
  "Hg",
  "Tl",
  "Pb",
  "Bi",
  "Po",
  "At",
  "Rn",
  "Fr",
  "Ra",
  "Ac",
  "Th",
  "Pa",
  "U",
  "Np",
  "Pu",
  "Am",
  "Cm",
  "Bk",
  "Cf",
  "Es",
  "Fm",
  "Md",
  "No",
  "Lr",
  "Rf",
  "Db",
  "Sg",
  "Bh",
  "Hs",
  "Mt",
  "Ds",
  "Rg",
  "Cn",
  "Nh",
  "Fl",
  "Mc",
  "Lv",
  "Ts",
  "Og",
  "Uue",
] as const;
