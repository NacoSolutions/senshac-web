import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL;
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const ci = process.env.CI === "true";
const contentPath = process.env.TINA_LOCAL_CONTENT_PATH;
if (!ci && !baseURL && !contentPath) {
	throw new Error("Local E2E requires TINA_LOCAL_CONTENT_PATH; set it to a senshac-content checkout, or provide BASE_URL for an existing preview.");
}

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: ci,
	retries: ci ? 2 : 0,
	reporter: ci ? "github" : "list",
	use: {
		baseURL: baseURL || "http://127.0.0.1:4321",
		trace: "retain-on-failure",
		...devices["Desktop Chrome"],
		...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
	},
	webServer: baseURL
		? undefined
		: {
			command: `${contentPath ? `TINA_LOCAL_CONTENT_PATH="${contentPath}" ` : ""}bun run build && bunx wrangler pages dev dist --ip 127.0.0.1 --port 4321`,
			url: "http://127.0.0.1:4321/es/",
			reuseExistingServer: !ci,
			timeout: 180_000,
		},
});
