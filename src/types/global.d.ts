// src/types/global.d.ts
// Global type declarations for client-side libraries

import type { Alpine as AlpineType } from "alpinejs";
import type htmxType from "htmx.org";

declare global {
	interface Window {
		Alpine: AlpineType;
		htmx: typeof htmxType;
	}
}
