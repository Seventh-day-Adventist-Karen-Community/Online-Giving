import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This deployment is a dedicated giving site. Older links from the full
  // church website that pointed at giving pages land on the giving form.
  async redirects() {
    return [
      { source: "/give-now/mpesa", destination: "/", permanent: false },
      { source: "/give-now/mpesa/:code*", destination: "/", permanent: false },
      { source: "/giving/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
