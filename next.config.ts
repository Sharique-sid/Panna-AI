import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Increase header size limit to handle large localStorage data
  serverExternalPackages: [],
  // Add custom server configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  // Increase request size limit
  serverRuntimeConfig: {
    maxRequestSize: '10mb',
  },
  /* config options here */
};

export default nextConfig;
