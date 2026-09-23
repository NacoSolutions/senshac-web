#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const REPO_ROOT = resolve(import.meta.dir, "..");
const WORKER_DIR = resolve(REPO_ROOT, "dist/_worker.js");

// Cloudflare's Free plan accepts 3 MiB compressed Workers. Enforcing a smaller
// raw ceiling is conservative and independent of Wrangler's upload packaging.
export const MAX_WORKER_RAW_BYTES = 3_000_000;

export type WorkerMeasurement = {
	files: number;
	raw: number;
	gzip: number;
};

function walkFiles(directory: string): string[] {
	return readdirSync(directory).flatMap((entry) => {
		const path = join(directory, entry);
		return statSync(path).isDirectory() ? walkFiles(path) : [path];
	});
}

export function measureWorker(directory = WORKER_DIR): WorkerMeasurement {
	if (!existsSync(directory)) return { files: 0, raw: 0, gzip: 0 };

	const files = walkFiles(directory).sort();
	const buffers = files.map((file) => readFileSync(file));
	return {
		files: files.length,
		raw: buffers.reduce((total, buffer) => total + buffer.length, 0),
		gzip: gzipSync(Buffer.concat(buffers), { level: 9 }).length,
	};
}

function formatBytes(bytes: number): string {
	return `${(bytes / 1024 / 1024).toFixed(2)} MiB (${bytes} B)`;
}

function main(): void {
	if (!existsSync(WORKER_DIR)) {
		console.error(`Worker-size guard: ${WORKER_DIR} does not exist.`);
		console.error("Run `bun run build` first.");
		process.exit(1);
	}

	const measurement = measureWorker();
	console.log(
		`Worker bundle: ${measurement.files} files, raw ${formatBytes(measurement.raw)}, gzip ${formatBytes(measurement.gzip)}`,
	);

	if (measurement.raw > MAX_WORKER_RAW_BYTES) {
		console.error(
			`Worker-size guard failed: raw bundle exceeds ${formatBytes(MAX_WORKER_RAW_BYTES)}.`,
		);
		console.error(
			"Keep Tina/editor-only dependencies out of public Astro routes or move runtime features to a separate Worker.",
		);
		process.exit(1);
	}

	console.log("Worker-size guard ok.");
}

if (import.meta.main) main();
