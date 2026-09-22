type ContactOption = {
	label?: string | null;
	value?: string | null;
};

export type ContactFormTranslations = Record<string, unknown> & {
	projectTypes?: Array<ContactOption | null> | null;
	serviceTypes?: Array<ContactOption | null> | null;
};

function populatedOptions(
	options: ContactFormTranslations["projectTypes"],
): options is ContactOption[] {
	return Array.isArray(options) && options.length > 0;
}

export function mergeContactFormTranslations(
	tina: ContactFormTranslations | null | undefined,
	local: ContactFormTranslations | null | undefined,
): ContactFormTranslations {
	const fallback = local ?? {};
	const remote = tina ?? {};
	const definedRemote = Object.fromEntries(
		Object.entries(remote).filter(([, value]) => value != null),
	);

	return {
		...fallback,
		...definedRemote,
		projectTypes: populatedOptions(remote.projectTypes)
			? remote.projectTypes
			: fallback.projectTypes,
		serviceTypes: populatedOptions(remote.serviceTypes)
			? remote.serviceTypes
			: fallback.serviceTypes,
	};
}
