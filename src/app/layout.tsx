import "@/app/globals.css";
import "@/styles/fonts.css";
import "lenis/dist/lenis.css";
import { BackgroundMusic } from "@/components/background-music";
import { LenisProvider } from "@/components/lenis-provider";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "YTHWKND 2026: The Multiverse of Mystery",
  description: "When Eric Veed mysteriously vanishes, five classmates set out to investigate. Their search leads them to a strange beach where reality begins to unravel. Join the battle to save the multiverse.",
  keywords: ["YTHWKND", "YMFGAKL", "multiverse", "mystery", "sci-fi", "adventure", "2026", "high school event"],
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
    title: "YTHWKND 2026: The Multiverse of Mystery",
    description: "When Eric Veed mysteriously vanishes, five classmates set out to investigate. Their search leads them to a strange beach where reality begins to unravel. Join the battle to save the multiverse.",
    url: "https://ythwknd.ymfgakl.com",
    siteName: "YTHWKND 2026",
    images: [
      {
        url: "/landing.png",
        width: 1200,
        height: 630,
        alt: "YTHWKND 2026: The Multiverse of Mystery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YTHWKND 2026: The Multiverse of Mystery",
    description: "When Eric Veed mysteriously vanishes, five classmates set out to investigate. Their search leads them to a strange beach where reality begins to unravel. Join the battle to save the multiverse.",
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
        className="antialiased bg-black text-[#BABABA] min-h-screen flex flex-col"
      >
        <LenisProvider>
          <BackgroundMusic />
          {children}
        </LenisProvider>
      </body>
      <GoogleAnalytics gaId="GTM-W5JTJM5Q" />
    </html>
  );
}
