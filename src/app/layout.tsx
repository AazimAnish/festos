import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Festos | Web3 Ticketing Platform",
  description: "Unforgettable experiences, one ticket at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-azeret-mono">
        {children}
      </body>
    </html>
  );
}
