import type { Metadata, Viewport } from "next";
import { inter } from "../lib/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { Loader } from "@/components/ui/loader";
import { WpaDownloadModal } from "@/components/ui/wpa-download-modal";
import { MobileSizeListener } from "@/components/useMobileSizeListener";
import { cookies } from "next/headers";
import Pwa from "@/components/pwa";
import ThemeInitializer from "@/components/theme-inicializer";

const APP_NAME = "Alino";
const APP_DEFAULT_TITLE = "Alino";
const APP_TITLE_TEMPLATE = "Alino | %s";
const APP_DESCRIPTION = "Alino, Tu organizador en linea";

export const metadata: Metadata = {
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
  const cookie = cookies().get("theme-storage");
  const initialTheme = cookie?.value || "device";
  return (
    <html lang="en" data-theme={initialTheme} suppressHydrationWarning>
      <head>
        {/* {process.env.NODE_ENV === "development" && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )} */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            try {
              var storedTheme = document.cookie.match(/theme-storage=([^;]+)/)?.[1];
              var initialTheme = storedTheme === "device" 
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                : (storedTheme || "device");
              
              if (initialTheme === "device") {
                initialTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              }
              
              document.documentElement.setAttribute("data-theme", initialTheme);
            } catch (e) {}
          })();
        `,
          }}
        />
      </head>
      <body
        style={{ height: "100%", overflow: "hidden" }}
        className={`${inter.className}`}
      >
        <ThemeInitializer />
        <MobileSizeListener />
        <Loader />
        <Toaster />
        <div id="modal-root">
          <WpaDownloadModal />
        </div>
        {/* <Pwa /> */}
        {children}
      </body>
    </html>
  );
}
