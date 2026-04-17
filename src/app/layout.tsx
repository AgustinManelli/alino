import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";

import { MobileSizeListener } from "@/hooks/useMobileSizeListener";
import { WpaDownloadModal } from "@/components/ui/wpa-download-modal";
import { Loader } from "@/components/ui/loader";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
    // startUpImage: [],
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
