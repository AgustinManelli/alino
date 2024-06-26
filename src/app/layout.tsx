import type { Metadata } from "next";
import { inter } from "../lib/ui/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { seoData } from "@/config/root/seo";
import { getUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "alino | home",
  generator: seoData.author.name,
  description: seoData.description,
  referrer: "origin-when-cross-origin",
  keywords: seoData.keywords,
  authors: [
    {
      name: seoData.author.name,
    },
  ],
  creator: seoData.author.name,
  publisher: seoData.author.name,
  metadataBase: new URL(getUrl()),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      {
        url: "/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    // shortcut: ["/favicon-32x32.png"],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: seoData.title,
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children} <Toaster richColors />
      </body>
    </html>
  );
}
