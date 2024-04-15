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
        {children} <Toaster richColors />
      </body>
    </html>
  );
}
