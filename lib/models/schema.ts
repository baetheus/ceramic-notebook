/**
 * These are the TypeScript Schemables, Types, and Decoders for data in our
 * storage layer.
 */

import * as S from "fun/schemable";
import { SchemableDecoder } from "fun/decoder";

export const Element = S.schema((s) =>
  s.struct({
    atomic_number: s.number(),
    name: s.string(),
    symbol: s.string(),
    category: s.string(),
    source: s.string(),
    summary: s.string(),
    atomic_mass: s.number(),
    boil: s.nullable(s.number()),
    melt: s.nullable(s.number()),
    discovered_by: s.nullable(s.string()),
    named_by: s.nullable(s.string()),
    created_at: s.string(),
    updated_at: s.string(),
  })
);
export type Element = S.TypeOf<typeof Element>;
export const DecoderElement = Element(SchemableDecoder);

export const Molecule = S.schema((s) =>
  s.struct({
    molecule_id: s.number(),
    name: s.string(),
    symbol: s.string(),
    molar_mass: s.number(),
    created_at: s.string(),
    updated_at: s.string(),
  })
);
export type Molecule = S.TypeOf<typeof Molecule>;
export const DecoderMolecule = Molecule(SchemableDecoder);

export const MoleculeElement = S.schema((s) =>
  s.struct({
    molecule_id: s.number(),
    atomic_number: s.number(),
    atom_count: s.number(),
  })
);
export type MoleculeElement = S.TypeOf<typeof MoleculeElement>;
export const DecoderMoleculeElement = MoleculeElement(SchemableDecoder);

export const Material = S.schema((s) =>
  s.struct({
    material_id: s.number(),
    name: s.string(),
    category: s.string(),
    summary: s.string(),
    created_at: s.string(),
    updated_at: s.string(),
  })
);
export type Material = S.TypeOf<typeof Material>;
export const DecoderMaterial = Material(SchemableDecoder);

export const MaterialAnalysis = S.schema((s) =>
  s.struct({
    material_analysis_id: s.number(),
    material_id: s.number(),
    notes: s.string(),
    created_at: s.string(),
    updated_at: s.string(),
  })
);
export type MaterialAnalysis = S.TypeOf<typeof MaterialAnalysis>;
export const DecoderMaterialAnalysis = MaterialAnalysis(SchemableDecoder);

export const MaterialAnalysisMolecule = S.schema((s) =>
  s.struct({
    material_analysis_id: s.number(),
    molecule_id: s.number(),
    percentage: s.number(),
  })
);
export type MaterialAnalysisMolecule = S.TypeOf<
  typeof MaterialAnalysisMolecule
>;
export const DecoderMaterialAnalysisMolecule = MaterialAnalysisMolecule(
  SchemableDecoder,
);

export const Recipe = S.schema((s) =>
  s.struct({
    recipe_id: s.number(),
    name: s.string(),
    category: s.string(),
    summary: s.string(),
    created_at: s.string(),
    updated_at: s.string(),
  })
);
export type Recipe = S.TypeOf<typeof Recipe>;
export const DecoderRecipe = Recipe(SchemableDecoder);

export const RecipeRevision = S.schema((s) =>
  s.struct({
    recipe_revision_id: s.number(),
    recipe_id: s.number(),
    notes: s.string(),
    created_at: s.string(),
    updated_at: s.string(),
  })
);
export type RecipeRevision = S.TypeOf<typeof RecipeRevision>;
export const DecoderRecipeRevision = RecipeRevision(SchemableDecoder);

export const RecipeRevisionMaterial = S.schema((s) =>
  s.struct({
    recipe_revision_id: s.number(),
    material_analysis_id: s.number(),
    parts: s.number(),
  })
);
export type RecipeRevisionMaterial = S.TypeOf<typeof RecipeRevisionMaterial>;
export const DecoderRecipeRevisionMaterial = RecipeRevisionMaterial(
  SchemableDecoder,
);
