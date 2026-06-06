import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";
import path from "path";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve("."),
  },
};

export default withMDX(nextConfig);
