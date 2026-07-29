import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@livekit/components-react',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Link',
            value: '<https://neuromeet.anasdev.shop/llms.txt>; rel="describedby"',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/mcp',
        destination: '/.well-known/mcp.json',
      },
    ];
  },
};

export default nextConfig;

