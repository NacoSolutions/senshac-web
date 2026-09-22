import { access, rename } from "node:fs/promises";
import { spawn } from "node:child_process";

const generatedAdmin = "public/admin";
const hiddenAdmin = ".tina-admin-typecheck";
let moved = false;

try {
	await access(generatedAdmin);
	await rename(generatedAdmin, hiddenAdmin);
	moved = true;
} catch (error) {
	if (error.code !== "ENOENT") throw error;
}

try {
	const command = process.platform === "win32" ? "astro.cmd" : "astro";
	const result = await new Promise((resolve, reject) => {
		const child = spawn(command, ["check"], { stdio: "inherit" });
		child.once("error", reject);
		child.once("exit", (code, signal) => resolve({ code, signal }));
	});
	if (result.signal) process.kill(process.pid, result.signal);
	process.exitCode = result.code ?? 1;
} finally {
	if (moved) await rename(hiddenAdmin, generatedAdmin);
}
