import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnalyticsProvider from "./providers/AnalyticsProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Synter - Unified Cross-Channel Ads Platform",
  description: "Run warehouse-centric, cross-platform ads & conversion tracking for Google, Meta, Reddit, X, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="tactical">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased synter-grid`}>
        <AnalyticsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AnalyticsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
