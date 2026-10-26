const sintecaPrefix =
	"sinteca/f0d31aad8d62d053c99b97190a47e2d246ae227e9e99c6a5d5cff09ac4bf19cd";
const spaceMonoPrefix =
	"space-mono/d9ee25f2cfb7fbc32e3f42ab807e7fca3ab4ff351dcbbb8b66996f940613f7e6";

export function getFontAssets(mediaBaseUrl) {
	const fontUrl = (path) => `${mediaBaseUrl.replace(/\/$/, "")}/fonts/${path}`;

	return {
		jozsikaLight: fontUrl("jozsika-light-cb357743.woff2"),
		sintecaRegular: fontUrl(`${sintecaPrefix}/sinteca-regular.woff2`),
		sintecaMedium: fontUrl(`${sintecaPrefix}/sinteca-medium.woff2`),
		sintecaSemibold: fontUrl(`${sintecaPrefix}/sinteca-semibold.woff2`),
		spaceMonoRegular: fontUrl(`${spaceMonoPrefix}/SpaceMono-Regular.woff2`),
	};
}

export function getBrandFontFaceCss(fonts) {
	return `
@font-face{font-family:'Sinteca';src:url('${fonts.sintecaSemibold}') format('woff2');font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:'Space Mono';src:url('${fonts.spaceMonoRegular}') format('woff2');font-weight:400;font-style:normal;font-display:swap}
`;
}
