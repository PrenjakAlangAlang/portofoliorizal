import type { NextConfig } from "next";

const isWindows = process.platform === 'win32';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  ...(isWindows
    ? {
        experimental: {
          cpus: 1,
        },
      }
    : {}),
};

export default nextConfig;
