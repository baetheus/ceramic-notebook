{
  description = "A Glaze and Clay Tool";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/release-25.05";
  inputs.utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs { inherit system; };

      shell = with pkgs; mkShell {
        packages = [
          # Insert Packages Here
          deno
          dbmate
        ];

        shellHook = ''
          export DATABASE_URL="sqlite:db/database.sqlite3"
        '';
      };
    in {
      devShells.default = shell;
    });
}

