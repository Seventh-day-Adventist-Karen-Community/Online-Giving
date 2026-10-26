import type { MetadataRoute } from "next";
import { Constants } from "@utils/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/give-now/"] },
    sitemap: `${Constants.SITE_URL}/sitemap.xml`,
  };
}
