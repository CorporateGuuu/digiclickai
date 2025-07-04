import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "DigiClick AI - Transform Your Business with AI Solutions",
  description: "Leverage AI-driven web design and automation to create seamless, futuristic digital experiences that drive results and innovation.",
  keywords: "AI automation, artificial intelligence, web development, digital transformation, business automation",
  authors: [{ name: "DigiClick AI" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "DigiClick AI - Transform Your Business with AI",
    description: "Leverage AI-driven web design and automation to create seamless, futuristic digital experiences that drive results and innovation.",
    url: "https://digiclickai.com",
    siteName: "DigiClick AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DigiClick AI - Transform Your Business with AI",
    description: "Leverage AI-driven web design and automation to create seamless, futuristic digital experiences that drive results and innovation.",
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
        {children}
      </body>
    </html>
  );
}
