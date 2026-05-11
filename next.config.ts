import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "livekit-server-sdk"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" }
    ],
  },
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['192.168.56.1'],
};

export default nextConfig;
