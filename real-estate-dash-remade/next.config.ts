import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3001",
    "http://localhost:8000",
    "http://172.19.128.1:3000",
    "http://172.19.128.1:8000",
  ],

  /* config options here */
};

export default nextConfig;
