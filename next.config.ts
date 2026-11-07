import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/about",
        permanent: false,
      },
      {
        source: "/our-projects",
        destination: "/projects",
        permanent: false,
      },
      {
        source: "/our-projects/:slug",
        destination: "/projects/:slug",
        permanent: false,
      },
      {
        source: "/our-process",
        destination: "/process",
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
