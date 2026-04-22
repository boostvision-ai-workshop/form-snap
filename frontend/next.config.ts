import path from "path";
import type { NextConfig } from "next";

const isDemo = process.env.NEXT_DEMO === '1';

const nextConfig: NextConfig = isDemo
  ? {
      // GitHub Pages static export
      output: 'export',
      basePath: '/form-snap',
      assetPrefix: '/form-snap/',
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
    }
  : {
      // Docker / standalone (default)
      output: 'standalone',
      turbopack: {
        root: path.resolve(__dirname, '..'),
      },
    };

export default nextConfig;
