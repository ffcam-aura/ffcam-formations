import type { Metadata } from "next";
import { Source_Sans_3 } from 'next/font/google';  // Import de Source Sans 3
import "./globals.css";

// Configuration de Source Sans 3
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // Toutes les graisses disponibles
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
    <html lang="fr">
      <body
        className={`${sourceSans3.variable} font-sans antialiased bg-background`}
      >
        {children}
      </body>
    </html>
  );
}