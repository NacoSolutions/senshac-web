export const DEFAULT_TYPOGRAPHY_PRESET = "senshac";

export const TYPOGRAPHY_PRESETS = Object.freeze({
	senshac: Object.freeze({ body: "Sinteca", display: "Jozsika" }),
	sinteca: Object.freeze({ body: "Sinteca", display: "Sinteca" }),
	editorial: Object.freeze({ body: "Jozsika", display: "Sinteca" }),
});

export const TYPOGRAPHY_PRESET_OPTIONS = Object.freeze([
	{ label: "Senshac — Sinteca body, Jozsika headings", value: "senshac" },
	{ label: "Sinteca — Sinteca throughout", value: "sinteca" },
	{ label: "Editorial — Jozsika body, Sinteca headings", value: "editorial" },
]);

export function resolveTypographyPreset(value) {
	return Object.hasOwn(TYPOGRAPHY_PRESETS, value)
		? value
		: DEFAULT_TYPOGRAPHY_PRESET;
}
