import type { NextConfig } from "next";

// Polyfill localStorage for SSR — needed because some dev tools (e.g. Antigravity)
// inject a broken --localstorage-file Node flag that creates a non-functional global.localStorage
if (typeof global !== 'undefined' && (!global.localStorage || typeof (global as any).localStorage.getItem !== 'function')) {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}

// IMPORTANT: Replace this with your actual Chrome extension ID from the Chrome Web Store
// or chrome://extensions (Developer mode). Format: chrome-extension://abcdefghijklmnopqrstuvwxyzabcdef
const CHROME_EXTENSION_ORIGIN = process.env.CHROME_EXTENSION_ORIGIN || "";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: [],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Only add CORS header if extension origin is configured
      ...(CHROME_EXTENSION_ORIGIN
        ? [
            {
              source: "/api/:path*",
              headers: [
                { key: "Access-Control-Allow-Credentials", value: "true" },
                { key: "Access-Control-Allow-Origin", value: CHROME_EXTENSION_ORIGIN },
                { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                {
                  key: "Access-Control-Allow-Headers",
                  value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
