{
  description = "Ceramic Notebook";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/release-25.05";
  inputs.utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs { inherit system; };
      mkScript = pkgs.writeShellScriptBin;

      shell = with pkgs; mkShell {
        packages = [
          # Insert packages here
          deno
          dbmate

          # Insert shell aliases here
          (mkScript "start" ''deno run -A --env-file ./main.ts'')
        ];

        shellHook = ''
          export DATABASE_URL="sqlite:./db/database.sqlite3"
        '';
      };
    in {
      devShells.default = shell;
    });
}

