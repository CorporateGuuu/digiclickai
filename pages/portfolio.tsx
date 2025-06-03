import React from 'react';
import DigiClickLayout from '../components/DigiClickLayout';
import PortfolioHero from '../components/PortfolioHero';

export default function Portfolio() {
  return (
    <DigiClickLayout showCursor={true} cursorTheme="default">
      <PortfolioHero />
    </DigiClickLayout>
  );
}
