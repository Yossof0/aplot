import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aPlot | Privacy-First B2B Messaging",
  description:
    "aPlot is a privacy-first B2B messaging platform for temporary, high-trust teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
