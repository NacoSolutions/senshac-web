import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface SeedRecord {
	id: string;
	title: string;
	status: string;
	type: string;
	priority: number;
	createdAt: string;
	updatedAt: string;
	closedAt?: string;
	blocks?: string[];
	blockedBy?: string[];
	[key: string]: unknown;
}

function newestRecord(records: SeedRecord[]): SeedRecord {
	return records.reduce((newest, candidate) =>
		candidate.updatedAt >= newest.updatedAt ? candidate : newest,
	);
}

export function analyzeSeeds(records: SeedRecord[]): string[] {
	const errors: string[] = [];
	const grouped = Map.groupBy(records, (record) => record.id);
	const authoritative = new Map(
		[...grouped].map(([id, matches]) => [id, newestRecord(matches)]),
	);

	for (const [id, matches] of grouped) {
		if (matches.length > 1) {
			errors.push(`duplicate ID ${id} appears ${matches.length} times`);
		}
	}

	for (const record of authoritative.values()) {
		if (record.status === "closed" && !record.closedAt) {
			errors.push(`closed issue ${record.id} is missing closedAt`);
		}

		for (const blockedId of record.blocks ?? []) {
			const blocked = authoritative.get(blockedId);
			if (!blocked) {
				errors.push(
					`${record.id}.blocks references missing issue ${blockedId}`,
				);
			} else if (!blocked.blockedBy?.includes(record.id)) {
				errors.push(
					`${record.id}.blocks has ${blockedId}, but ${blockedId}.blockedBy is missing ${record.id}`,
				);
			}
		}

		for (const blockerId of record.blockedBy ?? []) {
			const blocker = authoritative.get(blockerId);
			if (!blocker) {
				errors.push(
					`${record.id}.blockedBy references missing issue ${blockerId}`,
				);
			} else if (!blocker.blocks?.includes(record.id)) {
				errors.push(
					`${record.id}.blockedBy has ${blockerId}, but ${blockerId}.blocks is missing ${record.id}`,
				);
			}
		}
	}

	return errors;
}

export function canonicalizeSeeds(records: SeedRecord[]): SeedRecord[] {
	const order = [...new Set(records.map((record) => record.id))];
	const grouped = Map.groupBy(records, (record) => record.id);
	const canonical = new Map(
		order.map((id) => [
			id,
			structuredClone(newestRecord(grouped.get(id) ?? [])),
		]),
	);

	for (const record of canonical.values()) {
		if (record.status === "closed" && !record.closedAt) {
			record.closedAt = record.updatedAt;
		}

		for (const blockedId of record.blocks ?? []) {
			const blocked = canonical.get(blockedId);
			if (blocked) {
				blocked.blockedBy = [
					...new Set([...(blocked.blockedBy ?? []), record.id]),
				];
			}
		}

		for (const blockerId of record.blockedBy ?? []) {
			const blocker = canonical.get(blockerId);
			if (blocker) {
				blocker.blocks = [...new Set([...(blocker.blocks ?? []), record.id])];
			}
		}
	}

	return order.map((id) => canonical.get(id) as SeedRecord);
}

export function parseSeedsJsonl(contents: string): SeedRecord[] {
	return contents
		.split("\n")
		.filter((line) => line.trim())
		.map((line, index) => {
			try {
				return JSON.parse(line) as SeedRecord;
			} catch (error) {
				throw new Error(
					`invalid JSON on line ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		});
}

function run(): void {
	const path = resolve(process.argv[2] ?? ".seeds/issues.jsonl");
	const repair = process.argv.includes("--repair");
	const records = parseSeedsJsonl(readFileSync(path, "utf8"));

	if (repair) {
		const repaired = canonicalizeSeeds(records);
		const errors = analyzeSeeds(repaired);
		if (errors.length > 0) {
			throw new Error(`repair left integrity errors:\n${errors.join("\n")}`);
		}
		writeFileSync(
			path,
			`${repaired.map((record) => JSON.stringify(record)).join("\n")}\n`,
		);
		console.log(
			`Repaired ${path}: ${records.length} -> ${repaired.length} records`,
		);
		return;
	}

	const errors = analyzeSeeds(records);
	if (errors.length > 0) {
		console.error(`Seeds integrity failed:\n- ${errors.join("\n- ")}`);
		process.exit(1);
	}

	console.log(`Seeds integrity passed: ${records.length} unique records`);
}

if (import.meta.main) {
	run();
}
