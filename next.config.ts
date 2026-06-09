import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/poolcalc',
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_BASE_PATH: '/poolcalc',
  },
};

export default nextConfig;
