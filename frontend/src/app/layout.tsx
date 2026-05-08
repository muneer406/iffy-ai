import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "iffy.ai — Explore the ripple effects of What If?",
  description:
    "An AI-powered interactive simulation platform that lets you explore hypothetical scenarios across technology, society, economics, governance, and culture through dynamic flowcharts, impact analysis, and multi-perspective debates.",
  keywords: ["what if", "AI simulation", "scenario planning", "systems thinking", "causal reasoning"],
  openGraph: {
    title: "iffy.ai",
    description: "Explore the ripple effects of What If?",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
