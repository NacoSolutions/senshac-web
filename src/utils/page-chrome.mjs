export function resolvePageChrome(globalChrome, pageChrome = {}) {
	return {
		header: { ...globalChrome?.header, ...pageChrome.header },
		footer: { ...globalChrome?.footer, ...pageChrome.footer },
	};
}
