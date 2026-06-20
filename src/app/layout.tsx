import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ClientShell from "@/components/layout/ClientShell";
import { I18nProvider } from "@/lib/i18n/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Terra Forest — Digital MRV Platform",
  description: "Digital Measurement, Reporting, and Verification Platform for Vietnam Forestry. Monitoring, carbon accounting, ranger operations, and REDD+ compliance.",
  keywords: ["Terra Forest", "MRV", "REDD+", "forestry", "Vietnam", "carbon", "NDVI", "ranger operations"],
  authors: [{ name: "Terra Forest Team" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <I18nProvider>
          <AuthProvider>
            <ClientShell>
              {children}
            </ClientShell>
          </AuthProvider>
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
