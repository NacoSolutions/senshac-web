import { experimental_createIslandRoute } from "@tinacms/astro/experimental";
import { createIslands } from "../../lib/tina-islands";

export const prerender = false;

// Tina's bridge only accepts its authenticated preview POST content type. The
// helper also carries request metadata into the render, which is required for
// live queries and works in the Cloudflare SSR adapter.
export const ALL = experimental_createIslandRoute(createIslands());
