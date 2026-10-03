export function resolvePageChrome(globalChrome, pageChrome = {}) {
	return {
		header: { ...globalChrome?.header, ...pageChrome.header },
		footer: { ...globalChrome?.footer, ...pageChrome.footer },
	};
}

export function resolvePageChromeFieldTarget(pageData, chromePath, part) {
	if (!pageData || !chromePath || !["header", "footer"].includes(part)) return null;

	const path = chromePath.split(".");
	const field = path.pop();
	const owner = path.reduce((value, key) => value?.[key], pageData);
	const chrome = owner?.[field];

	return chrome
		? { data: chrome, field: part }
		: { data: owner, field };
}
