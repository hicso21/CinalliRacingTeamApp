import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";
import "./globals.css";
import { StorageProvider } from "@/context/storage-context";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Cinalli Racing Team - Lubricentro",
  description: "Sistema de gestión para lubricentro Cinalli Racing Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <StorageProvider>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </StorageProvider>
      </body>
    </html>
  );
}