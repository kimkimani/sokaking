/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  serverExternalPackages: ['@electric-sql/pglite'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['*.run.app', '*'],
};

export default nextConfig;

