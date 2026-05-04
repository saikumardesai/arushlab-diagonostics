import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
