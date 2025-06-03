import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="application-name" content="DigiClick AI" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="DigiClick AI" />
          <meta name="description" content="Digital solutions for your business" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#0070f3" />

          {/* Preconnect and DNS prefetch */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://cdn.jsdelivr.net" />
          <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
          <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
          <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />

          {/* Preload critical resources */}
          <link rel="preload" href="/styles/Home.module.css" as="style" />
          <link rel="preload" href="/styles/visual-effects.css" as="style" />
          <link rel="preload" href="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" as="script" />
          <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.10.4/gsap.min.js" as="script" />

          {/* Google Fonts */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />

          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />

          {/* Try to load manifest if it exists */}
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Skip to main content for accessibility */}
          <div id="skip-link" style={{ position: 'absolute', top: '-9999px' }}>
            <a href="#main-content">Skip to main content</a>
          </div>
        </body>
      </Html>
    )
  }
}

export default MyDocument
