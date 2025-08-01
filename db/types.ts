import type { Either } from "fun/either";
import {
  Element,
  Material,
  MaterialAnalysis,
  MaterialAnalysisMolecule,
  Molecule,
  MoleculeElement,
  Recipe,
  RecipeRevision,
  RecipeRevisionMaterial,
} from "../db/schema.ts";

export type Table<Full, Create, Update, Err> = {
  create(data: Create): Either<Err, Full>;
  find_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => Either<Err, Full[]>;
  update_by<K extends keyof Full, V extends keyof Update>(
    match_columns: K[],
    update_columns: V[],
  ): (match: Pick<Full, K>, value: Update) => Either<Err, Full[]>;
  delete_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => Either<Err, Full[]>;
  list(): Either<Err, Full[]>;
};

export type Database<Env, Err> = (env: Env) => {
  // Base Tables
  elements: Table<
    Element,
    Omit<Element, "created_at" | "updated_at">,
    Partial<Omit<Element, "atomic_number">>,
    Err
  >;
  molecules: Table<
    Molecule,
    Pick<Molecule, "name" | "symbol" | "molar_mass">,
    Partial<Pick<Molecule, "name" | "molar_mass">>,
    Err
  >;
  molecule_elements: Table<
    MoleculeElement,
    MoleculeElement,
    Pick<MoleculeElement, "atom_count">,
    Err
  >;
  materials: Table<
    Material,
    Pick<Material, "name" | "category" | "summary">,
    Partial<Pick<Material, "name" | "category" | "summary">>,
    Err
  >;
  material_analysis: Table<
    MaterialAnalysis,
    Pick<MaterialAnalysis, "material_id" | "notes">,
    Partial<Pick<MaterialAnalysis, "material_id" | "notes">>,
    Err
  >;
  material_analysis_molecules: Table<
    MaterialAnalysisMolecule,
    MaterialAnalysisMolecule,
    Pick<MaterialAnalysisMolecule, "percentage">,
    Err
  >;
  recipes: Table<
    Recipe,
    Pick<Recipe, "name" | "category" | "summary">,
    Partial<Pick<Recipe, "name" | "category" | "summary">>,
    Err
  >;
  recipe_revisions: Table<
    RecipeRevision,
    Pick<RecipeRevision, "recipe_id" | "notes">,
    Partial<Pick<RecipeRevision, "recipe_id" | "notes">>,
    Err
  >;
  recipe_revision_materials: Table<
    RecipeRevisionMaterial,
    RecipeRevisionMaterial,
    Pick<RecipeRevisionMaterial, "parts">,
    Err
  >;
};
