import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";

import { MobileSizeListener } from "@/hooks/useMobileSizeListener";
import { WpaDownloadModal } from "@/components/ui/wpa-download-modal";
import { Loader } from "@/components/ui/loader";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Pwa from "@/components/providers/pwa";

import { inter, roboto, poppins, jetbrainsMono } from "../lib/fonts";
import "./globals.css";

const APP_NAME = "Alino";
const APP_DEFAULT_TITLE = "Alino";
const APP_TITLE_TEMPLATE = "Alino | %s";
const APP_DESCRIPTION = "Alino, Tu organizador en linea";

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_DEFAULT_TITLE,
    startupImage: [
      // iPhone 16 Pro Max, 15 Pro Max, 15 Plus, 14 Pro Max
      {
        url: "/splash/apple-splash-dark-1290-2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1290-2796.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone 16 Pro, 15 Pro, 15, 14 Pro
      {
        url: "/splash/apple-splash-dark-1179-2556.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1179-2556.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone 16 Plus, 14 Plus, 13 Pro Max, 12 Pro Max
      {
        url: "/splash/apple-splash-dark-1284-2778.png",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1284-2778.png",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone 14, 13 Pro, 13, 12 Pro, 12
      {
        url: "/splash/apple-splash-dark-1170-2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1170-2532.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone 11 Pro Max, XS Max
      {
        url: "/splash/apple-splash-dark-1242-2688.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1242-2688.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone 11, XR
      {
        url: "/splash/apple-splash-dark-828-1792.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-828-1792.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      // iPhone 13 mini, 12 mini, 11 Pro, XS, X
      {
        url: "/splash/apple-splash-dark-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1125-2436.png",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (prefers-color-scheme: light)",
      },
      // iPhone SE, 8, 7, 6s
      {
        url: "/splash/apple-splash-dark-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-750-1334.png",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      // iPad Pro 12.9"
      {
        url: "/splash/apple-splash-dark-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-2048-2732.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
      // iPad Pro 11", Air 10.9"
      {
        url: "/splash/apple-splash-dark-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: dark)",
      },
      {
        url: "/splash/apple-splash-light-1668-2388.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (prefers-color-scheme: light)",
      },
    ],
  },
  icons: {
    icon: [
      {
        rel: "icon",
        url: "/favicon.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        url: "/favicon.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resolvedCookie = cookies().get("theme-resolved");
  const initialTheme = resolvedCookie?.value === "dark" ? "dark" : "light";
  return (
    <html
      lang="es"
      dir="ltr"
      data-theme={initialTheme}
      suppressHydrationWarning
      className={`
        ${inter.variable}
        ${roboto.variable}
        ${poppins.variable}
        ${jetbrainsMono.variable}
      `}
    >
      <head>
        <meta
          name="theme-color"
          content="#F0F0F0"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#242629"
          media="(prefers-color-scheme: dark)"
        />
      </head>
      <body className={`${inter.className}`}>
        <ThemeProvider>
          <Pwa />
          <MobileSizeListener />
          <Toaster
            position="bottom-right"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: "!p-0 !bg-transparent !border-none !shadow-none",
              },
            }}
          />
          <Loader />

          <div id="modal-root">
            <WpaDownloadModal />
          </div>

          {children}

          <div id="portal-root" />
        </ThemeProvider>
      </body>
    </html>
  );
}
