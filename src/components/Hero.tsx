/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import LucideIcon from './LucideIcon';
import { useAppConfig } from '../AppContext';

interface HeroProps {
  onNavigate: (sectionId: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const { config } = useAppConfig();

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden bg-white text-neutral-900 border-b border-neutral-200"
    >
      {/* Background grid lines */}
      <div className="absolute inset-0 z-0 opacity-40">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-3 py-1.5 border border-neutral-200 bg-white"
            >
              <span className="font-serif italic text-xs text-neutral-500 font-medium">01</span>
              <span className="text-[10px] font-bold tracking-widest text-neutral-800 uppercase font-mono">
                {config.hero.badgeText}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] uppercase leading-[0.85] text-[#0a0a0a]"
            >
              {config.hero.titleLine1}<br />
              {config.hero.titleLine2}<br />
              <span className="font-serif italic font-medium lowercase text-neutral-500 tracking-normal block mt-4 text-3xl sm:text-4xl lg:text-5xl capitalize leading-tight">
                {config.hero.italicQuote}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-xl mx-auto lg:mx-0 text-base text-neutral-600 font-sans leading-relaxed text-left"
            >
              {config.hero.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => onNavigate('contact')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-none text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-800 transition-all cursor-pointer border border-black"
              >
                {config.hero.cta1Text}
                <LucideIcon name="ArrowRight" className="ml-2" size={15} />
              </button>

              <button
                onClick={() => onNavigate('case-studies')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-none text-xs font-bold uppercase tracking-widest text-[#0a0a0a] bg-white hover:bg-neutral-50 border border-neutral-300 transition-all cursor-pointer"
              >
                {config.hero.cta2Text}
              </button>
            </motion.div>

            {/* Micro proofs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 border-t border-neutral-200 flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4"
            >
              {config.hero.proofs.map((proof, idx) => (
                <div key={idx} className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono">
                  <span className="font-serif italic font-medium lowercase text-neutral-400 text-sm">{proof.letter}/</span>
                  <span>{proof.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Right Visual Showcase (Interactive mockups / Dashboard) */}
          <div className="lg:col-span-5 h-[400px] sm:h-[480px] lg:h-[500px] relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-none p-6 shadow-xl overflow-hidden flex flex-col justify-between h-full"
            >
              {/* Window Decorators */}
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-4">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-none bg-neutral-800" />
                  <div className="w-2.5 h-2.5 rounded-none bg-neutral-800" />
                  <div className="w-2.5 h-2.5 rounded-none bg-neutral-800" />
                </div>
                <div className="text-[10px] text-neutral-500 font-mono tracking-wider">WAVE_STATION.LOG</div>
                <div className="w-3" />
              </div>

              {/* Dynamic Content: Active Development Simulator */}
              <div className="flex-1 space-y-4 flex flex-col justify-center">
                {/* Visual Mobile App Mockup Layer */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-none p-4 space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-white/10 text-[95] text-white font-mono border-b border-l border-neutral-800">
                    MOBILE PIPELINE
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center">
                      <LucideIcon name="Smartphone" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">FitPulse Track Core</div>
                      <div className="text-[10px] text-neutral-400 font-mono">React Native iOS • ACTIVE</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                      <span>Build Compilation</span>
                      <span className="text-white font-bold">100% (Green)</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-1 rounded-none overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        className="bg-white h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* AI / RAG Model pipeline simulation */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-none p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-white/10 text-[9px] text-white font-mono border-b border-l border-neutral-800">
                    GEMINI ENGINE
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center">
                      <LucideIcon name="Brain" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">Predictive Logistics Node</div>
                      <div className="text-[10px] text-neutral-400 font-mono">LLM Multi-Agent Chain • STABLE</div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono p-2 bg-neutral-955 rounded-none border border-neutral-800 text-neutral-300 text-left truncate">
                    &gt;_ system_rag_search: indexing 41,200 shipping records...
                  </div>
                </div>

                {/* Game Rendering Frame Sim */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-none p-4 flex items-center justify-between relative overflow-hidden">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white text-black flex items-center justify-center">
                      <LucideIcon name="Gamepad2" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white">NeoRealm Game Loops</div>
                      <div className="text-[10px] text-neutral-400 font-mono">WebGL Engine Canvas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-mono px-2 py-0.5 border border-neutral-800 bg-neutral-950">60 FPS</span>
                  </div>
                </div>
              </div>

              {/* Console Footing */}
              <div className="mt-4 pt-4 border-t border-neutral-900 flex items-center justify-between text-neutral-500 text-[10px] font-mono">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-white mr-1.5" />
                  Systems Operational
                </span>
                <span>v1.2.0-Alpha</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
