import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@silex/shared', '@silex/contracts', '@silex/validation'],
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  async rewrites() {
    // Sur Vercel, le routage /api/(.*) est géré au niveau racine par vercel.json
    if (process.env.VERCEL === '1' || process.env.VERCEL === 'true') {
      return [];
    }

    const apiTarget = (
      process.env.API_URL ||
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:4000'
    ).replace(/\/api\/?$/, '').replace(/\/$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
