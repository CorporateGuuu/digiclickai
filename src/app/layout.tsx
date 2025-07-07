import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "DigiClick AI - Advanced Digital Solutions",
  description: "Transform your digital presence with DigiClick AI. We provide cutting-edge web development, AI integration, and digital marketing solutions.",
  keywords: "DigiClick AI, web development, AI integration, digital marketing, custom cursor, GSAP animations",
  authors: [{ name: "DigiClick AI Team" }],
  creator: "DigiClick AI",
  publisher: "DigiClick AI",
  openGraph: {
    title: "DigiClick AI - Advanced Digital Solutions",
    description: "Transform your digital presence with DigiClick AI. We provide cutting-edge web development, AI integration, and digital marketing solutions.",
    url: "https://digiclickai.com",
    siteName: "DigiClick AI",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DigiClick AI - Advanced Digital Solutions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiClick AI - Advanced Digital Solutions",
    description: "Transform your digital presence with DigiClick AI. We provide cutting-edge web development, AI integration, and digital marketing solutions.",
    images: ["/images/og-image.jpg"],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.variable}>
        <div id="custom-cursor" className="custom-cursor"></div>
        {children}
      </body>
    </html>
  );
}
