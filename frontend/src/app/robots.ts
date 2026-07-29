import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard-instructor/*",
          "/dashboard-student/*",
          "/dashboard-admin/*",
          "/meeting/*",
          "/livekit/*",
        ],
      },
      // Explicitly invite AI Search Agents (AIO)
      {
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "Google-Extended", "anthropic-ai", "PerplexityBot"],
        allow: ["/", "/llms.txt"],
        disallow: [
          "/dashboard-instructor/*",
          "/dashboard-student/*",
          "/dashboard-admin/*",
          "/meeting/*",
          "/livekit/*",
        ],
      }
    ],
    sitemap: "https://neuromeet.anasdev.shop/sitemap.xml",
  };
}
