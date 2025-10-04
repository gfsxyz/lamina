import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Providers } from "@/components/Provider";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

const fontFamily = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lamina - Crypto Portfolio Tracker",
    template: "%s | Lamina",
  },
  description:
    "Track your crypto portfolio in real-time with Lamina. Analyze your holdings, view trends, and manage your assets effortlessly.",
  keywords: [
    "crypto portfolio",
    "crypto tracker",
    "crypto dashboard",
    "ethereum",
    "NFT",
    "DeFi",
    "Lamina",
  ],
  authors: [{ name: "Metker", url: "https://gustifaizal.com" }],
  creator: "Lamina Team",
  publisher: "Lamina",
  metadataBase: new URL("https://lamina.gustifaizal.com"), // replace with your domain
  alternates: {
    canonical: "https://lamina.gustifaizal.com",
    languages: {
      "en-US": "https://lamina.gustifaizal.com",
    },
  },
  openGraph: {
    title: "Lamina - Crypto Portfolio Tracker",
    description:
      "Track your crypto portfolio in real-time with Lamina. Analyze your holdings, view trends, and manage your assets effortlessly.",
    url: "https://lamina.gustifaizal.com",
    siteName: "Lamina",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lamina Crypto Portfolio Tracker",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lamina - Crypto Portfolio Tracker",
    description:
      "Track your crypto portfolio in real-time with Lamina. Analyze your holdings, view trends, and manage your assets effortlessly.",
    images: ["/og-image.jpg"],
    creator: "@laminaapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontFamily.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
