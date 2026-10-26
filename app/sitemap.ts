import type { MetadataRoute } from "next";
import { Constants } from "@utils/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: Constants.SITE_URL, lastModified: new Date() }];
}
