import React from 'react';
import Head from 'next/head';
import DigiClickLayout from '../components/DigiClickLayout';
import HeroSection from '../components/HeroSection';

export default function HomePage() {
  return (
    <DigiClickLayout
      title="DigiClick AI - Premium AI Web Design & Automation Solutions"
      description="Transform your business with DigiClick AI's cutting-edge automation solutions. Experience our enhanced cursor system, AI-powered websites, and intelligent business automation."
      keywords="DigiClick AI, AI automation, enhanced cursor system, AI web design, business automation, artificial intelligence, GSAP animations, cursor demo"
      showCursor={true}
      showParticles={true}
      showChatbot={false}
      cursorTheme="default"
    >
      <Head>
        <title>DigiClick AI - Premium AI Web Design & Automation Solutions</title>
        <meta name="description" content="Transform your business with DigiClick AI's cutting-edge automation solutions. Experience our enhanced cursor system, AI-powered websites, and intelligent business automation." />
        <meta name="keywords" content="DigiClick AI, AI automation, enhanced cursor system, AI web design, business automation, artificial intelligence, GSAP animations, cursor demo" />
      </Head>

      <HeroSection />
    </DigiClickLayout>
  );
}
