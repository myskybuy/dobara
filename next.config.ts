import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Listing photos are uploaded through a route handler (/api/listings), so no large Server Action bodies are needed.
  poweredByHeader: false,
};

export default nextConfig;
