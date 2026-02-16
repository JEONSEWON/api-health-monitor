import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CheckAPI - API Health Monitor | 24/7 Uptime Tracking",
  description: "Monitor your APIs and websites with real-time alerts. Get instant notifications via Email, Slack, Telegram, Discord when your services go down. Simple setup, powerful monitoring.",
  keywords: ["API monitoring", "uptime monitoring", "website monitoring", "health check", "API alerts", "downtime alerts"],
  authors: [{ name: "CheckAPI Team" }],
  creator: "CheckAPI",
  publisher: "CheckAPI",
  metadataBase: new URL("https://checkapi.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://checkapi.io",
    title: "CheckAPI - API Health Monitor | 24/7 Uptime Tracking",
    description: "Monitor your APIs and websites with real-time alerts. Get instant notifications when your services go down.",
    siteName: "CheckAPI",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "CheckAPI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheckAPI - API Health Monitor | 24/7 Uptime Tracking",
    description: "Monitor your APIs and websites with real-time alerts. Get instant notifications when your services go down.",
    images: ["/android-chrome-512x512.png"],
    creator: "@checkapi_io",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
