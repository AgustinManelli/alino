import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Toaster } from "sonner";

import { ThemeInitializer } from "@/components/useThemeInicializer";
import { MobileSizeListener } from "@/components/useMobileSizeListener";
import { WpaDownloadModal } from "@/components/ui/wpa-download-modal";
import { Loader } from "@/components/ui/loader";

import { inter } from "../lib/fonts";
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
  const cookie = cookies().get("theme-storage");
  const initialTheme = cookie?.value ?? undefined;
  return (
    <html lang="es" data-theme={initialTheme} suppressHydrationWarning>
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
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var storedTheme = document.cookie.match(/theme-storage=([^;]+)/)?.[1];
              var initialTheme = storedTheme === "system" 
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                : (storedTheme || "system");
              
              if (initialTheme === "system") {
                initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              }
              
              document.documentElement.setAttribute("data-theme", initialTheme);
            } catch (e) {}
          })();
        `,
          }}
        />
      </head>
      <body className={`${inter.className}`}>
        <ThemeInitializer />
        <MobileSizeListener />
        <Toaster />
        <Loader />

        <div id="modal-root">
          <WpaDownloadModal />
        </div>

        {children}

        <div id="portal-root" />
      </body>
    </html>
  );
}
