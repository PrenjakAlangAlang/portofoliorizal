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
  experimental: {
    ...(isWindows ? { cpus: 1 } : {}),
    serverActions: {
      bodySizeLimit: '100mb',
    },
    proxyClientMaxBodySize: '100mb',
  },
};

export default nextConfig;
