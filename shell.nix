{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = [
    pkgs.deno
    (pkgs.python3.withPackages (py: [
      py.jupyter
      py.pandas
      py.numpy
      py.scipy
      py.seaborn
      py.matplotlib
    ]))
  ];
}
