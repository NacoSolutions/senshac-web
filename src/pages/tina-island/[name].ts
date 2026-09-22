import type { APIRoute } from "astro";

export const prerender = false;

export const ALL: APIRoute = () =>
	new Response("Not Found", {
		status: 404,
		headers: { "Cache-Control": "no-store" },
	});
