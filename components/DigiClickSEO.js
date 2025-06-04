import React from 'react';
import Head from 'next/head';

export default function DigiClickSEO({ 
  title = 'DigiClick AI - Advanced AI Automation Solutions',
  description = 'Transform your business with DigiClick AI\'s cutting-edge artificial intelligence automation solutions. Custom AI development, machine learning, and intelligent automation services.',
  pathname = '',
  image = '/images/digiclick-ai-og.jpg',
  keywords = 'AI automation, artificial intelligence, machine learning, custom AI development, intelligent automation, business automation, AI solutions'
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.com';
  const fullUrl = `${siteUrl}${pathname}`;
  const fullTitle = title.includes('DigiClick AI') ? title : `${title} | DigiClick AI`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DigiClick AI",
    "description": description,
    "url": siteUrl,
    "logo": `${siteUrl}/images/digiclick-ai-logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-DIGICLICK",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://linkedin.com/company/digiclick-ai",
      "https://twitter.com/digiclick_ai",
      "https://github.com/digiclick-ai"
    ],
    "service": {
      "@type": "Service",
      "name": "AI Automation Solutions",
      "description": "Custom AI development and intelligent automation services",
      "provider": {
        "@type": "Organization",
        "name": "DigiClick AI"
      }
    }
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="DigiClick AI" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#121212" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="DigiClick AI" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${image}`} />
      <meta property="twitter:creator" content="@digiclick_ai" />
      <meta property="twitter:site" content="@digiclick_ai" />
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#121212" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Additional SEO optimizations */}
      <meta name="google-site-verification" content="your-google-verification-code" />
      <meta name="msvalidate.01" content="your-bing-verification-code" />
      
      {/* Performance hints */}
      <link rel="preload" href="/fonts/orbitron-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/poppins-variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </Head>
  );
}
