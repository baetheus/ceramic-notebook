import type { Spread } from "fun/kind";

import type { Err } from "~/lib/models/err.ts";
import type { Collection } from "~/lib/models/collection.ts";
import type {
  Element,
  Material,
  MaterialAnalysis,
  MaterialAnalysisMolecule,
  Molecule,
  MoleculeElement,
  Recipe,
  RecipeRevision,
  RecipeRevisionMaterial,
} from "~/lib/models/schema.ts";

type Limit<
  Source,
  Omits extends keyof Source = never,
> = Spread<Omit<Source, Omits | "created_at" | "updated_at">>;

type Empty<Source> = Limit<Source, keyof Source>;

/**
 * The specific data access types for Keramos data. At the moment it is
 * primarily Collections over database tables. In the future, when more
 * complicated joined queries become needed, it will contain those as well.
 */
export type KeramosData<Error extends Err> = {
  readonly elements: Collection<
    Error,
    Limit<Element, "atomic_number">,
    Limit<Element>,
    Element
  >;
  readonly molecules: Collection<
    Error,
    Limit<Molecule, "molecule_id">,
    Limit<Molecule, "molecule_id">,
    Molecule
  >;
  readonly molecule_elements: Collection<
    Error,
    Empty<MoleculeElement>,
    MoleculeElement,
    MoleculeElement
  >;
  readonly materials: Collection<
    Error,
    Limit<Material, "material_id">,
    Limit<Material, "material_id">,
    Material
  >;
  readonly material_analysis: Collection<
    Error,
    Limit<MaterialAnalysis, "material_id" | "material_analysis_id">,
    Limit<MaterialAnalysis, "material_analysis_id">,
    MaterialAnalysis
  >;
  readonly material_analysis_molecules: Collection<
    Error,
    Limit<MaterialAnalysisMolecule, "material_analysis_id" | "molecule_id">,
    MaterialAnalysisMolecule,
    MaterialAnalysisMolecule
  >;
  readonly recipes: Collection<
    Error,
    Limit<Recipe, "recipe_id">,
    Limit<Recipe, "recipe_id">,
    Recipe
  >;
  readonly recipe_revisions: Collection<
    Error,
    Limit<RecipeRevision, "recipe_revision_id" | "recipe_id">,
    Limit<RecipeRevision, "recipe_revision_id">,
    RecipeRevision
  >;
  readonly recipe_revision_materials: Collection<
    Error,
    Limit<RecipeRevisionMaterial, "recipe_revision_id">,
    RecipeRevisionMaterial,
    RecipeRevisionMaterial
  >;
};
