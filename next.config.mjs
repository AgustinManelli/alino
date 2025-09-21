import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "sw.ts",
  swDest: "public/sw.js",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
      {
        protocol: "https",
        hostname: "dftjzbbvaucwuvgjjhbf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/app-updates/**",
      },
    ],
  },
};

export default withSerwist(nextConfig);
