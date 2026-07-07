import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { plexSans, plexSerif, plexMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "SerVault | Privacy-First B2B Messaging",
  description:
    "SerVault is a privacy-first B2B messaging platform for temporary, high-trust teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${plexSans.variable} ${plexSerif.variable} ${plexMono.variable}`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
