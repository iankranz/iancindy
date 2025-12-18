import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  webpack: (config, { isServer }) => {
    // Handle face-api.js and TensorFlow.js for client-side only
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  // Turbopack configuration to match webpack fallbacks for face-api.js
  experimental: {
    turbo: {
      resolveAlias: {
        // Map Node.js built-in modules to false for client-side builds
        // This matches the webpack fallback configuration above
        fs: false,
        path: false,
        crypto: false,
      },
    },
  },
};

export default nextConfig;
