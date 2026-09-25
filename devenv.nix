{ pkgs, ... }:

{
  # Keep the local toolchain explicit and reproducible. Application dependencies
  # remain in bun.lock; these packages provide the tools used by repository
  # scripts and quality gates.
  packages = with pkgs; [
    bun
    nodejs_24
    git
    ripgrep
    gh
    biome
    betterleaks
    nodePackages.knip
  ];

  env.NODE_ENV = "development";

  enterShell = ''
    echo "senshac-web devenv: $(bun --version)"
  '';
};
