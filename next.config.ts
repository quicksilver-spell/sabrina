import type { NextConfig } from "next";

const repoName = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: repoName,
  assetPrefix: repoName ? `${repoName}/` : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
