import type { These } from "fun/these";
import type { Spread } from "fun/kind";
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
  create(create: readonly [Create, ...Create[]]): These<Err, readonly Full[]>;
  find_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => These<Err, readonly Full[]>;
  update_by<K extends keyof Full, V extends keyof Update>(
    match_columns: K[],
    update_columns: V[],
  ): (match: Pick<Full, K>, value: Update) => These<Err, readonly Full[]>;
  delete_by<K extends keyof Full>(
    match_columns: K[],
  ): (match: Pick<Full, K>) => These<Err, readonly Full[]>;
  list(): These<Err, readonly Full[]>;
};

export type DataAccess<Err> = {
  // Base Tables
  elements: Table<
    Element,
    Spread<Omit<Element, "created_at" | "updated_at">>,
    Spread<Partial<Omit<Element, "atomic_number">>>,
    Err
  >;
  molecules: Table<
    Molecule,
    Spread<Pick<Molecule, "name" | "symbol" | "molar_mass">>,
    Spread<Partial<Pick<Molecule, "name" | "molar_mass">>>,
    Err
  >;
  molecule_elements: Table<
    MoleculeElement,
    MoleculeElement,
    Spread<Pick<MoleculeElement, "atom_count">>,
    Err
  >;
  materials: Table<
    Material,
    Spread<Pick<Material, "name" | "category" | "summary">>,
    Spread<Partial<Pick<Material, "name" | "category" | "summary">>>,
    Err
  >;
  material_analysis: Table<
    MaterialAnalysis,
    Spread<Pick<MaterialAnalysis, "material_id" | "notes">>,
    Spread<Partial<Pick<MaterialAnalysis, "material_id" | "notes">>>,
    Err
  >;
  material_analysis_molecules: Table<
    MaterialAnalysisMolecule,
    MaterialAnalysisMolecule,
    Spread<Pick<MaterialAnalysisMolecule, "percentage">>,
    Err
  >;
  recipes: Table<
    Recipe,
    Spread<Pick<Recipe, "name" | "category" | "summary">>,
    Spread<Partial<Pick<Recipe, "name" | "category" | "summary">>>,
    Err
  >;
  recipe_revisions: Table<
    RecipeRevision,
    Spread<Pick<RecipeRevision, "recipe_id" | "notes">>,
    Spread<Partial<Pick<RecipeRevision, "recipe_id" | "notes">>>,
    Err
  >;
  recipe_revision_materials: Table<
    RecipeRevisionMaterial,
    RecipeRevisionMaterial,
    Spread<Pick<RecipeRevisionMaterial, "parts">>,
    Err
  >;
};

export type CreateDataAccess<Env, Err> = (env: Env) => DataAccess<Err>;
