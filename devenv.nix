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
  ];

  env.NODE_ENV = "development";
  env.PLAYWRIGHT_CHROMIUM_PATH = "/nix/store/klvpwn5lf7fgclqkkm89g86f38b9djak-playwright-chromium-headless-shell/chrome-headless-shell-linux64/chrome-headless-shell";

  enterShell = ''
    echo "senshac-web devenv: $(bun --version)"
  '';
}
