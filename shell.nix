{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    esbuild
    nodejs
    vsce
  ];
  shellHook = ''
    npm install
  '';
}
