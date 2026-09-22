import { cp, rm, rename } from "node:fs/promises";
import { access } from "node:fs/promises";

await access("dist/client");
await access("dist/server");

// Pages serves static files from dist/ and runs the Astro SSR worker from
// dist/_worker.js. Keep the generated Worker config out of Pages validation.
await cp("dist/client", "dist", { recursive: true, force: true });
await rm("dist/client", { recursive: true, force: true });
await rm("dist/server/wrangler.json", { force: true });
await rm("dist/server/.prerender", { recursive: true, force: true });
await rename("dist/server", "dist/_worker.js");
await rm(".wrangler", { recursive: true, force: true });

console.log("Pages output packaged: dist static assets + dist/_worker.js");
