import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dukesenior.tools";

  // Static routes
  const staticRoutes = [
    "",
    "/posts",
    "/profile",
    "/login",
    "/account",
    "/suggestions",
    "/phasmotourney-series",
    "/phasmotourney2records",
    "/phasmoTourney3Group",
    "/phasmotourney2details",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Tournament routes (Tourney 4 - Current)
  const tourney4Routes = [
    "/phasmoTourney4Group/runs",
    "/phasmoTourney4Group/standings",
    "/phasmoTourney4Group/recordedRuns",
    "/phasmoTourney4Group/stats",
    "/phasmoTourney4Group/bracket",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...tourney4Routes];
}
