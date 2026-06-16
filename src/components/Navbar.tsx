/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';

interface NavbarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
  onOpenAdmin: () => void;
}

export default function Navbar({ onNavigate, activeSection, onOpenAdmin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'why-us', label: 'Why Us' },
    { id: 'process', label: 'Our Process' },
    { id: 'faq', label: 'FAQs' }
  ];

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        id="app-navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black border-b border-neutral-900 shadow-md'
            : 'bg-[#0a0a0a] border-b border-neutral-900/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => handleNavClick('hero')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-none bg-white text-black font-black text-xs">
                W
              </div>
              <span className="text-xl font-black tracking-[-0.04em] text-white font-sans uppercase">
                WAVE.INC
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                      isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-white rounded-none"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Desktop CTA & Admin Portal Link */}
            <div className="hidden md:flex items-center space-x-2.5">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 hover:border-neutral-600 transition-all cursor-pointer"
              >
                <LucideIcon name="Settings" className="mr-1.5" size={12} />
                Admin Console
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-none text-xs font-extrabold uppercase tracking-widest text-[#0a0a0a] bg-white hover:bg-neutral-100 border border-white transition-all cursor-pointer"
              >
                Start a Project
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-none text-white hover:bg-neutral-900 focus:outline-none transition-colors"
              >
                <LucideIcon name={mobileMenuOpen ? 'X' : 'Menu'} size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu content */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-black border-b border-neutral-900 px-4 pt-2 pb-6 space-y-2"
            >
              <div className="py-2 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`block w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeSection === item.id
                        ? 'bg-neutral-900 text-white border-l-2 border-white pl-3'
                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 px-4 space-y-2">
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-none text-xs font-bold uppercase tracking-widest text-neutral-300 bg-neutral-950 border border-neutral-800 hover:text-white hover:border-neutral-600 transition-colors"
                  >
                    <LucideIcon name="Settings" className="mr-1.5" size={12} />
                    Admin Console
                  </button>
                  <button
                    onClick={() => handleNavClick('contact')}
                    className="w-full inline-flex items-center justify-center px-5 py-3 rounded-none text-xs font-extrabold uppercase tracking-widest text-black bg-white hover:bg-neutral-100 transition-colors"
                  >
                    Start a Project
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
