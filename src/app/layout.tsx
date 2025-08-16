import type { Metadata } from "next";
import { Instrument_Serif, Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RainbowKitProviderWrapper } from "@/components/providers/rainbowkit-provider";
import { Toaster } from "@/components/ui/sonner";
import { SplashScreenProvider } from "@/components/splash-screen-provider";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true,
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

// Safely construct metadata base URL
const getMetadataBase = () => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      return new URL(siteUrl);
    }
    return new URL("http://localhost:3000");
  } catch {
    console.warn("Invalid NEXT_PUBLIC_SITE_URL, falling back to localhost");
    return new URL("http://localhost:3000");
  }
};

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
  metadataBase: getMetadataBase(),
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
  other: {
    "theme-color": "#000000",
    "color-scheme": "dark light",
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
        <meta name="color-scheme" content="dark light" />
        {/* Preload critical resources */}
        <link rel="preload" href="/avalanche.webp" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ErrorBoundary>
          <RainbowKitProviderWrapper>
            <SplashScreenProvider>
              <Header />
              <main id="main-content" role="main">
                {children}
              </main>
              <Footer />
              <Toaster />
            </SplashScreenProvider>
          </RainbowKitProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}
