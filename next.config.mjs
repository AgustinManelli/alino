import withPWAInit from "@ducanh2912/next-pwa";
import path from "path";

const __dirname = new URL('.', import.meta.url).pathname;

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  scope: "/",
  // cacheStartUrl: true,
  // dynamicStartUrl: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
      },
    ],
  },
  webpack(config) {
    config.resolve.alias['@public'] = path.join(__dirname, 'public');
    return config;
  },
};

export default withPWA(nextConfig);


