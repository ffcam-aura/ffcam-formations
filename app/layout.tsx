import { Analytics } from "@vercel/analytics/react";
import {
  ClerkProvider
} from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import type { Metadata } from "next";
import { Source_Sans_3 } from 'next/font/google';
import "./globals.css";
import Navbar from '@/components/features/layout/Navbar';
import Footer from '@/components/features/layout/Footer';
import { Toaster } from '@/components/ui/toaster';

// Configuration de Source Sans 3
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-source-sans',
});

export const metadata: Metadata = {
  title: "Formations FFCAM",
  description: "Formations du Club Alpin Français",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <body
          className={`${sourceSans3.variable} font-sans antialiased bg-background`}
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {children}
            <Analytics />
            <Footer />
            <Toaster />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}