import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import SocialProof from '@/components/SocialProof';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import BookDemoModal from '@/components/BookDemoModal';
import dashboardHero from '@/assets/dashboard-hero.png';
import analyticsScreenshot from '@/assets/analytics-screenshot.png';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Navigation onBookDemo={openModal} />
      <main>
        <Hero onBookDemo={openModal} dashboardImage={dashboardHero} />
        <Features screenshotImage={analyticsScreenshot} />
        <SocialProof />
        <Pricing onBookDemo={openModal} />
        <FAQ />
      </main>
      <Footer onBookDemo={openModal} />
      <BookDemoModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Index;
