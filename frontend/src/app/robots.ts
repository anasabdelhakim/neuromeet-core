import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
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
    sitemap: "https://neuromeet.anasdev.shop/sitemap.xml",
  };
}
