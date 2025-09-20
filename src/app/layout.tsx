import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ReactQueryProvider } from "@/lib/react-query";
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SyncPlan - Modern Task Management",
  description: "Open-source task management application built with Next.js, TypeScript, and PostgreSQL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <ReactQueryProvider>
            <ServiceWorkerProvider>
              {children}
            </ServiceWorkerProvider>
          </ReactQueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
