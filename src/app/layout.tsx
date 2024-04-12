import type { Metadata } from "next";
import { inter } from "../lib/ui/fonts";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "alino",
  description: "class and homework organizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div
          style={{
            position: "absolute",
            bottom: "0",
            height: "20px",
            width: "100vw",
            backgroundColor: "#1c1c1c",
            display: "flex",
            justifyContent: "start",
            alignItems: "center",
            paddingLeft: "20px",
          }}
        >
          <p style={{ color: "#fff", fontSize: "10px" }}>
            Alino testing version
          </p>
        </div>
        {children} <Toaster richColors />
      </body>
    </html>
  );
}
