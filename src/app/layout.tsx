import type { Metadata } from "next";
import { Instrument_Serif, Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Festos - For the culture. On the chain.",
    template: "%s | Festos"
  },
  description: "Create fests that live forever. Discover and create blockchain-powered events.",
  keywords: ["blockchain", "events", "festivals", "web3", "crypto", "NFT", "POAP"],
  authors: [{ name: "Festos Team" }],
  creator: "Festos",
  publisher: "Festos",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Festos - For the culture. On the chain.",
    description: "Create fests that live forever. Discover and create blockchain-powered events.",
    siteName: "Festos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Festos - For the culture. On the chain.",
    description: "Create fests that live forever. Discover and create blockchain-powered events.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable} ${robotoMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ErrorBoundary>
          <Header />
          <main id="main-content" role="main">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
