import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 샌드박스 등 .next를 지울 수 없는 환경에서 빌드 출력 경로 변경용
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pdpcvosydbxgzfactjty.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
