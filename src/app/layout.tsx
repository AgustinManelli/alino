import type { Metadata, Viewport } from "next";
import { inter } from "../lib/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import { Loader } from "@/components/ui/loader";
import { WpaDownloadModal } from "@/components/ui/wpa-download-modal";
import { MobileSizeListener } from "@/components/useMobileSizeListener";

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
      <head>
        {process.env.NODE_ENV === "development" && (
          <script
            crossOrigin="anonymous"
            src="//unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body style={{ height: "100%" }} className={`${inter.className}`}>
        <MobileSizeListener />
        <Loader />
        <Toaster richColors />
        <div id="modal-root">
          <WpaDownloadModal />
        </div>
        {children}
      </body>
    </html>
  );
}
