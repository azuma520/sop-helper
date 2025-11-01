import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["zh-Hant", "en"],
    defaultLocale: "zh-Hant",
    localeDetection: false,
  },
};

export default nextConfig;
