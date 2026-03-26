import "@/app/globals.css";
import "@/styles/fonts.css";
import "lenis/dist/lenis.css";
import { BackgroundMusic } from "@/components/background-music";
import { LenisProvider } from "@/components/lenis-provider";
import { PageTransitionProvider } from "@/components/page-transition";
import { VideoBackground } from "@/components/video-background";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "YTHWKND and the Giant at the Gate",
  description: "The city needs your help. The gate is shut. A giant stands in the way. Begin your training, assemble your party, take the gate.",
  keywords: ["YTHWKND", "YMFGAKL", "giant", "gate", "adventure", "2026", "high school event"],
  authors: [{ name: "YMFGAKL" }],
  creator: "YMFGAKL",
  publisher: "YMFGAKL",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ythwknd.ymfgakl.com"),
  openGraph: {
    title: "YTHWKND and the Giant at the Gate",
    description: "The city needs your help. The gate is shut. A giant stands in the way. Begin your training, assemble your party, take the gate.",
    url: "https://ythwknd.ymfgakl.com",
    siteName: "YTHWKND 2026",
    images: [
      {
        url: "/landing.png",
        width: 1200,
        height: 630,
        alt: "YTHWKND and the Giant at the Gate",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YTHWKND and the Giant at the Gate",
    description: "The city needs your help. The gate is shut. A giant stands in the way. Begin your training, assemble your party, take the gate.",
    images: ["/landing.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.png",
      },
    ],
  },
  manifest: "/manifest.json",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased text-[#F7EAD9] min-h-screen flex flex-col"
      >
        <VideoBackground />
        <PageTransitionProvider>
          <LenisProvider>
            <BackgroundMusic />
            {children}
          </LenisProvider>
        </PageTransitionProvider>
      </body>
      <GoogleAnalytics gaId="GTM-W5JTJM5Q" />
    </html>
  );
}
