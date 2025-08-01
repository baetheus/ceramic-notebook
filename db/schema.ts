// Database schema types for glaze-tool
// Generated from schema.sql

export type SchemaMigration = {
  version: string;
};

export type Element = {
  atomic_number: number;
  name: string;
  symbol: string;
  category: string;
  source: string;
  summary: string;
  atomic_mass: number;
  boil?: number | null;
  melt?: number | null;
  discovered_by?: string | null;
  named_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type Molecule = {
  molecule_id: number;
  name: string;
  symbol: string;
  molar_mass: number;
  created_at: string;
  updated_at: string;
};

export type MoleculeElement = {
  molecule_id: number;
  atomic_number: number;
  atom_count: number;
};

export type Material = {
  material_id: number;
  name: string;
  category: string;
  summary: string;
  created_at: string;
  updated_at: string;
};

export type MaterialAnalysis = {
  material_analysis_id: number;
  material_id: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type MaterialAnalysisMolecule = {
  material_analysis_id: number;
  molecule_id: number;
  percentage: number;
};

export type Recipe = {
  recipe_id: number;
  name: string;
  category: string;
  summary: string;
  created_at: string;
  updated_at: string;
};

export type RecipeRevision = {
  recipe_revision_id: number;
  recipe_id: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type RecipeRevisionMaterial = {
  recipe_revision_id: number;
  material_id: number;
  parts: number;
};
