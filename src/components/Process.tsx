/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LucideIcon from './LucideIcon';
import { useAppConfig } from '../AppContext';

interface Step {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  deliverables: string[];
}

export default function Process() {
  const { config } = useAppConfig();
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const steps = config.processSteps;

  // Defensive array fallback
  const activeIdx = activeStepIdx < steps.length ? activeStepIdx : 0;
  const activeStep = steps[activeIdx];

  if (!activeStep) {
    return null;
  }

  return (
    <section id="process" className="py-24 bg-[#0a0a0a] border-t border-neutral-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title block */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-800 text-xs font-bold text-neutral-400 tracking-widest uppercase font-mono bg-transparent">
            <span className="font-serif italic font-medium text-neutral-600 lowercase">04 /</span>
            <span>{config.processHeader.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-white font-sans">
            {config.processHeader.title}
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {config.processHeader.description}
          </p>
        </div>

        {/* Stepper split views */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Stepper Left Timeline selectors */}
          <div className="lg:col-span-5 relative">
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-neutral-900" />
            
            <div className="space-y-6">
              {steps.map((step, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={step.number}
                    onClick={() => setActiveStepIdx(idx)}
                    className="w-full text-left flex items-start space-x-6 relative py-2 group cursor-pointer animate-none bg-transparent border-none outline-none"
                  >
                    {/* Circle Node -> Editorial Square */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-none border transition-all ${
                        isActive
                          ? 'bg-white border-white text-black scale-105'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 group-hover:border-neutral-700 group-hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-bold font-mono">{step.number}</span>
                    </div>

                    <div className="flex-1 pt-1">
                      <h3
                        className={`text-xs font-black uppercase tracking-wider transition-colors ${
                          isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-[11px] transition-colors line-clamp-1 mt-1 font-sans ${
                          isActive ? 'text-neutral-300' : 'text-neutral-500 group-hover:text-neutral-400'
                        }`}
                      >
                        {step.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Right Detailed Display */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIdx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className="bg-neutral-950 border border-neutral-900 rounded-none p-6 sm:p-10 shadow-lg relative overflow-hidden"
              >
                {/* Visual Step Indicator (Serif Watermark) */}
                <div className="absolute top-6 right-6 text-7xl font-serif italic text-neutral-850/10 select-none font-medium tracking-tighter">
                  {activeStep.number}
                </div>

                <div className="space-y-6">
                  {/* Icon & title bar */}
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-neutral-900 rounded-none border border-neutral-800 text-white">
                      <LucideIcon name={activeStep.icon} size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wider text-white font-sans">{activeStep.title}</h3>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mt-1">{activeStep.subtitle}</p>
                    </div>
                  </div>

                  {/* Body description */}
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed text-left font-sans animate-none bg-transparent">
                    {activeStep.description}
                  </p>

                  {/* Deliverables checklist */}
                  <div className="space-y-3 pt-4 border-t border-neutral-900">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono text-left">
                      Expected Deliverables
                    </h4>
                    <div className="space-y-2.5">
                      {activeStep.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-left">
                          <LucideIcon name="CheckCircle2" className="text-white flex-shrink-0" size={14} />
                          <span className="text-xs text-neutral-300 font-sans">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
