import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cüzdanım",
  description: "Terzi Gelir Gider Takibi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cüzdanım",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Ekranın tamamını (çentik dahil) kullanır
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/10543/10543314.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}