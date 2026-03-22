import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/store/provider";
import AuthProvider from "@/components/AuthProvider";
import AppLayout from "@/components/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Creator",
  description: "Create and manage AI-generated exam papers dynamically",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#EEEEEE] text-text-primary h-[100dvh] overflow-hidden`}>
        <Providers>
          <AuthProvider>
            <ErrorBoundary>
              <AppLayout>{children}</AppLayout>
            </ErrorBoundary>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

