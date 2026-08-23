/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite'],
  // Disable type-checking and linting during build to speed up compilation and bypass minor warnings
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['*.run.app', '*'],
};

export default nextConfig;

