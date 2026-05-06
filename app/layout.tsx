import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "@/globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "2kTunes - Global Reach. Local Cash.",
  description: "Distribution, Marketing, and Royalties for the next generation of global stars.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${syne.variable} bg-brand-primary text-white font-sans antialiased selection:bg-white selection:text-brand-primary`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
