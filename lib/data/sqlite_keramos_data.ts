import type { KeramosData } from "~/lib/models/keramos_data.ts";
import type { CollectionError } from "~/lib/err.ts";

import sqlite from "node:sqlite";

import * as S from "~/lib/models/schema.ts";
import { createCollection } from "~/lib/data/sqlite_collection.ts";

export type CreateKeramosDataParams = {
  readonly db: sqlite.DatabaseSync;
};

export function createKeramosData(
  { db }: CreateKeramosDataParams,
): KeramosData<CollectionError> {
  return {
    elements: createCollection({
      db,
      table: "elements",
      create_columns: [
        "atomic_number",
        "symbol",
        "name",
        "category",
        "source",
        "summary",
        "atomic_mass",
        "boil",
        "melt",
        "discovered_by",
        "named_by",
      ],
      full_decoder: S.DecoderElement,
    }),

    molecules: createCollection({
      db,
      table: "molecules",
      create_columns: [
        "symbol",
        "name",
        "molar_mass",
      ],
      full_decoder: S.DecoderMolecule,
    }),

    molecule_elements: createCollection({
      db,
      table: "molecule_elements",
      create_columns: [
        "molecule_id",
        "atom_count",
        "atomic_number",
      ],
      full_decoder: S.DecoderMoleculeElement,
    }),

    materials: createCollection({
      db,
      table: "materials",
      create_columns: ["name", "category", "summary"],
      full_decoder: S.DecoderMaterial,
    }),

    material_analysis: createCollection({
      db,
      table: "material_analysis",
      create_columns: ["material_id", "notes"],
      full_decoder: S.DecoderMaterialAnalysis,
    }),

    material_analysis_molecules: createCollection({
      db,
      table: "material_analysis_molecules",
      create_columns: [
        "percentage",
        "material_analysis_id",
        "molecule_id",
      ],
      full_decoder: S.DecoderMaterialAnalysisMolecule,
    }),

    recipes: createCollection({
      db,
      table: "recipes",
      create_columns: ["name", "category", "summary"],
      full_decoder: S.DecoderRecipe,
    }),

    recipe_revisions: createCollection({
      db,
      table: "recipe_revisions",
      create_columns: ["recipe_id", "notes"],
      full_decoder: S.DecoderRecipeRevision,
    }),

    recipe_revision_materials: createCollection({
      db,
      table: "recipe_revision_materials",
      create_columns: [
        "parts",
        "recipe_revision_id",
        "material_analysis_id",
      ],
      full_decoder: S.DecoderRecipeRevisionMaterial,
    }),
  };
}
