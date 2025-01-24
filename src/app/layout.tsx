import type { Metadata, Viewport } from "next";
import { inter } from "../lib/ui/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { Loader } from "@/components/loader";

const APP_NAME = "Alino";
const APP_DEFAULT_TITLE = "Alino";
const APP_TITLE_TEMPLATE = "Alino | %s";
const APP_DESCRIPTION = "Alino, Tu organizador en linea";

export const metadata: Metadata = {
  // title: "Alino | Tu organizador en linea",
  // generator: seoData.author.name,
  // description: seoData.description,
  // referrer: "origin-when-cross-origin",
  // keywords: seoData.keywords,
  // authors: [
  //   {
  //     name: seoData.author.name,
  //   },
  // ],
  // creator: seoData.author.name,
  // publisher: seoData.author.name,
  // metadataBase: new URL(getUrl()),
  // alternates: {
  //   canonical: "/",
  // },
  // icons: {
  //   icon: [
  //     { url: "/favicon.ico", type: "image/x-icon" },
  //     { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
  //     { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
  //     {
  //       url: "/android-icon-192x192.png",
  //       sizes: "192x192",
  //       type: "image/png",
  //     },
  //   ],
  //   apple: [
  //     { url: "/apple-icon.png" },
  //     { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
  //   ],
  // },
  // appleWebApp: {
  //   capable: true,
  //   title: seoData.title,
  //   statusBarStyle: "default",
  // },
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
    startupImage: [
      "/apple-touch-startup-image-1024-768.png",
      {
        url: "/apple-touch-startup-image-1024-768.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ height: "100%" }} className={`${inter.className}`}>
        <Loader />
        <Toaster richColors />
        {children}
      </body>
    </html>
  );
}
