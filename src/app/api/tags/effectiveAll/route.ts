// Back-compat endpoint aliasing /api/tags/effective
// Useful for clients expecting a distinct path for "batch" effective fetches.
export { GET } from "@/app/api/tags/effective/route";
