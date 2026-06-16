/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import Process from './components/Process';
import CaseStudies from './components/CaseStudies';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import LucideIcon from './components/LucideIcon';
import { AnimatePresence, motion } from 'motion/react';
import { useAppConfig } from './AppContext';

interface EstimateData {
  platform: string;
  design: string;
  features: string[];
  timeline: string;
  totalCost: number;
}

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [showAdmin, setShowAdmin] = useState(false);

  const { config } = useAppConfig();

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    
    const element = document.getElementById(sectionId);
    if (element) {
      // Find the navbar height (20rem / 80px is standard)
      const navbarElement = document.getElementById('app-navbar');
      const offset = navbarElement ? navbarElement.offsetHeight : 80;
      
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else if (sectionId === 'hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Connects Cost calculator prepopulation trigger down to Contact Form
  const handlePrepopulateEstimate = (data: EstimateData) => {
    setEstimateData(data);
    // Move layout focus down to contact section
    handleNavigate('contact');
  };

  const handleClearEstimate = () => {
    setEstimateData(null);
  };

  const handleSelectServiceForEstimate = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  // IntersectionObserver to auto-update active navbar tab as user scrolls
  useEffect(() => {
    const sections = ['hero', 'services', 'case-studies', 'why-us', 'process', 'faq', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -45% 0px', // focused center of screen
      threshold: 0
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white antialiased overflow-x-hidden relative">
      {/* Sticky header navigation */}
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} onOpenAdmin={() => setShowAdmin(true)} />

      {/* Main Single-View Structural Content */}
      <main>
        {/* Banner Section */}
        <Hero onNavigate={handleNavigate} />
        
        {/* Stats and Highlights */}
        <Stats />
        
        {/* Services Showcase */}
        <Services 
          onSelectServiceForEstimate={handleSelectServiceForEstimate} 
          onNavigate={handleNavigate} 
        />
        
        {/* Sprints Timeline Iterative Process */}
        <Process />
        
        {/* Interactive Case Studies Portfolio Grid */}
        <CaseStudies onNavigate={handleNavigate} />
        

        {/* Client endorsements Carousel */}
        <Testimonials />
        
        {/* Informational Questions */}
        <FAQ />
        
        {/* NDA-certified Proposal Request Form */}
        <ContactForm 
          prepopulatedEstimate={estimateData} 
          onClearEstimate={handleClearEstimate} 
          selectedServiceId={selectedServiceId}
          onClearServiceId={() => setSelectedServiceId('')}
        />
      </main>

      {/* Brand Footing */}
      <Footer onNavigate={handleNavigate} />

      {/* Discrete Admin Control Center Quick Toggle */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#0a0a0a] border border-neutral-850 hover:border-neutral-550 text-white p-3.5 shadow-xl transition-all hover:scale-105 active:scale-95 group focus:outline-none flex items-center space-x-1.5 cursor-pointer rounded-none animate-bounce"
        title="Admin Control Room"
      >
        <LucideIcon name="Settings" className="text-white group-hover:rotate-45 transition-transform" size={15} />
        <span className="text-[9px] font-bold uppercase tracking-wider pr-1 text-neutral-305">CMS Console</span>
      </button>

      {/* Fullscreen Sliding CMS Administrator Overlay panel */}
      <AnimatePresence>
        {showAdmin && (
          <AdminDashboard onClose={() => setShowAdmin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

