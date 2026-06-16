/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppConfig } from '../AppContext';
import LucideIcon from './LucideIcon';

export default function FAQ() {
  const { config } = useAppConfig();
  const faqs = config.faqs;

  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-24 bg-[#0a0a0a] border-b border-neutral-900 text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-850 text-xs font-bold text-neutral-400 tracking-widest uppercase font-mono bg-transparent">
            <span className="font-serif italic font-medium text-neutral-600 lowercase">07 /</span>
            <span>{config.faqHeader.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-white font-sans">
            {config.faqHeader.title}
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mx-auto font-sans">
            {config.faqHeader.description}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`border rounded-none transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-neutral-950 border-white'
                    : 'bg-neutral-950 border-neutral-900 hover:border-neutral-700'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="text-sm font-black uppercase tracking-wider text-white">
                    {item.question}
                  </span>
                  <div
                    className={`p-1.5 rounded-none bg-neutral-900 border border-neutral-800 text-neutral-200 transition-transform ${
                      isOpen ? 'rotate-180 bg-white text-black border-white' : ''
                    }`}
                  >
                    <LucideIcon name="ChevronDown" size={13} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-neutral-300 text-xs sm:text-sm leading-relaxed border-t border-neutral-900 font-sans text-left">
                        {item.answer}
                        <div className="mt-4 flex items-center space-x-2">
                          <span className="text-[10px] bg-neutral-900 px-2.0 py-1 border border-neutral-850 font-mono text-neutral-450 uppercase font-bold">
                            Category: {item.category}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
