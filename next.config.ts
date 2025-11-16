import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pioneer-alpha-website-django-s3-bucket-new-2.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'todo-app.pioneeralpha.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
