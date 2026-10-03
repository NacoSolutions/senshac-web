export function resolveContactRecipient(value) {
	return typeof value === "string" ? value.trim() : "";
}
