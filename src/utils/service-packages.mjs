export const SERVICE_PACKAGE_IDS = ["consultation", "decorative", "integral"];

export function findServicePackage(blocks, lang, packageId) {
	if (!SERVICE_PACKAGE_IDS.includes(packageId)) return null;
	for (const block of blocks ?? []) {
		for (const item of block.items ?? []) {
			if (item.href === `/${lang}/contact?package=${packageId}`) {
				return { id: packageId, title: item.title };
			}
		}
	}
	return null;
}

export function scenarioContactHref(lang, path, packageId) {
	const query = new URLSearchParams({ path });
	if (SERVICE_PACKAGE_IDS.includes(packageId)) query.set("package", packageId);
	return `/${lang}/contact?${query}`;
}
