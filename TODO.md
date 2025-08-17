# TODO

Following are some of the design decisions and considerations that need to be
implemented, along with their rough order.

## Server

[X] Clean up the Collection type. This represents a unique "struct" that we have a
  collection of and will CRUD. The underlying storage is parameterized. No query
plans for now, just a good set of primitives.
[X] Implement Collections over sqlite with response parsing using fun/decoder.
[ ] Outline the general structure of the server, data first
    [X] fn: Read from raw elements data
    [X] fn: Initialize elements collection
    [ ] fn: Chemical formula -> Molecules + MoleculeElements
    [ ] fn: Read from glazy data
    [ ] fn: Glazy data -> Materials + Material Analysis
    [ ] fn: Material + Material Analysis -> Molecules + Molecule Elements
    [ ] fn: Glazy data -> Recipes + Recipe Revisions + Recipe Revision Materials
    [ ] fn: Initialize all non-elements collections
[ ] Import api
    [ ] POST /import/elements parses and inputs elements collection
    [ ] POST /import/glazy parses and inputs glazy json
[ ] Elements and molecules api
    [ ] GET  /elements
    [ ] GET  /molecules
[ ] Materials api
    [ ] GET  /materials 
    [ ] GET  /materials/:material_id
    [ ] POST /materials
    [ ] PUT  /materials/:material_id
    [ ] DEL  /materials/:material_id
    [ ] GET  /materials/:material_id/analysis
    [ ] GET  /materials/:material_id/analysis/:analysis_id
    [ ] POST /materials/:material_id/analysis
    [ ] PUT  /materials/:material_id/analysis/:analysis_id
    [ ] DEL  /materials/:material_id/analysis/:analysis_id
[ ] Recipes api
    [ ] GET  /recipes 
    [ ] GET  /recipes/:recipe_id
    [ ] POST /recipes
    [ ] PUT  /recipes/:recipe_id
    [ ] DEL  /recipes/:recipe_id
    [ ] GET  /recipes/:recipe_id/revision
    [ ] GET  /recipes/:recipe_id/revision/:revision_id
    [ ] POST /recipes/:recipe_id/revision
    [ ] PUT  /recipes/:recipe_id/revision/:revision_id
    [ ] DEL  /recipes/:recipe_id/revision/:revision_id
[ ] Figure out how to handle the oidc auth flow.
[ ] Implement user authorization against existing apis (see: hasura v1)
[ ] Start spec of journal data
[ ] Finish the linear algebra solvers

## Client

[ ] Spec out the page structure of the client spa.
[ ] Use semantic html for initial layout with no css.
[ ] Implement unauthed display of various structs.
[ ] Implement authed CRUD of structs.
[ ] Make it pretty by playing with css over the semantic html.


## Other

[X] .gitignore the db
[X] Rename ceramic-notebook
[ ] Publish on radicle.xyz and try their workflow (low)
