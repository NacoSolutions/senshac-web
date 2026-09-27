import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL;
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: baseURL || "http://127.0.0.1:4321",
		trace: "retain-on-failure",
		...devices["Desktop Chrome"],
		...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
	},
	webServer: baseURL
		? undefined
		: {
			command:
				"(test -d dist || bun run build) && bunx wrangler pages dev dist --ip 127.0.0.1 --port 4321",
			url: "http://127.0.0.1:4321/es/",
			reuseExistingServer: !process.env.CI,
			timeout: 180_000,
		},
});
