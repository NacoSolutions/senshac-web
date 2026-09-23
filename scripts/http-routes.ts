import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Glob } from "bun";

const pagesDir = resolve(import.meta.dir, "../src/pages");
const methodPattern =
	/export\s+(?:const|async\s+function|function)\s+(GET|POST|PUT|DELETE|PATCH|ALL)/g;
const redirectDirective = "@route-contract redirect";
const pagespeedDirective = "@route-contract pagespeed";

export type HttpRoute = {
	method: string;
	pattern: string;
	handler: string;
	kind: "api" | "page";
	redirect: boolean;
	pagespeedAudit: boolean;
};

function routePattern(file: string) {
	let pattern = `/${file.replace(/\.(?:astro|ts)$/, "")}`;
	pattern = pattern.replace(/\/index$/, "") || "/";
	return pattern
		.replace(/\[\.\.\.([^\]]+)\]/g, ":$1")
		.replace(/\[([^\]]+)\]/g, ":$1");
}

export function extractHttpRoutes(): HttpRoute[] {
	const routes: HttpRoute[] = [];
	const glob = new Glob("**/*.{astro,ts}");

	for (const file of glob.scanSync({ cwd: pagesDir, onlyFiles: true })) {
		if (file.endsWith(".test.ts") || file.endsWith(".d.ts")) continue;

		const source = readFileSync(resolve(pagesDir, file), "utf8");
		const pattern = routePattern(file);

		if (file.endsWith(".astro")) {
			const redirect = source.includes(redirectDirective);
			const pagespeedAudit = source.includes(pagespeedDirective);
			if (redirect && pagespeedAudit) {
				throw new Error(
					`${file} cannot be both a redirect and a PageSpeed audit route`,
				);
			}
			routes.push({
				method: "GET",
				pattern,
				handler: file,
				kind: "page",
				redirect,
				pagespeedAudit,
			});
			continue;
		}

		for (const match of source.matchAll(methodPattern)) {
			const method = match[1];
			if (!method) continue;
			routes.push({
				method,
				pattern,
				handler: `${file}#${method}`,
				kind: "api",
				redirect: false,
				pagespeedAudit: false,
			});
		}
	}

	return routes.sort(
		(a, b) =>
			a.pattern.localeCompare(b.pattern) || a.method.localeCompare(b.method),
	);
}
