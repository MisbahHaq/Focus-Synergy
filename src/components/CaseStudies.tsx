/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppConfig } from '../AppContext';
import { CaseStudy } from '../types';
import LucideIcon from './LucideIcon';

interface CaseStudiesProps {
  onNavigate: (sectionId: string) => void;
}

export default function CaseStudies({ onNavigate }: CaseStudiesProps) {
  const { config } = useAppConfig();
  const caseStudies = config.caseStudies;

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);

  // Auto-generate filters from unique categories present in case studies
  const categories = Array.from(new Set(caseStudies.map((cs) => cs.category)));
  const filters = ['All', ...categories];

  const filteredStudies = activeFilter === 'All'
    ? caseStudies
    : caseStudies.filter((cs) => cs.category === activeFilter);

  return (
    <section id="case-studies" className="py-24 bg-white text-[#0a0a0a] relative border-b border-neutral-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 font-sans">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-200 text-xs font-bold text-neutral-500 tracking-widest uppercase font-mono bg-white">
            <span className="font-serif italic font-medium text-neutral-400 lowercase">05 /</span>
            <span>{config.caseStudiesHeader.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-[#0a0a0a] font-sans">
            {config.caseStudiesHeader.title}
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl mx-auto">
            {config.caseStudiesHeader.description}
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-neutral-200 pb-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#0a0a0a] border border-black text-white shadow-sm'
                  : 'text-neutral-500 hover:text-black hover:bg-neutral-50 border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredStudies.map((study, idx) => (
              <motion.div
                key={study.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white border border-neutral-200 rounded-none overflow-hidden hover:border-neutral-400 transition-all flex flex-col justify-between h-full group"
              >
                {/* Visual Block */}
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  <div className="absolute inset-0 bg-neutral-950 opacity-10 z-10 group-hover:opacity-0 transition-opacity" />
                  <img
                    src={study.imageUrl}
                    alt={study.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-2.5 py-1 text-[9px] font-bold uppercase font-mono text-white bg-black border border-black rounded-none">
                      {study.category}
                    </span>
                  </div>
                </div>

                {/* Content Block */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="text-[10px] text-neutral-500 font-mono tracking-wider text-left uppercase">
                      Client: {study.clientName} ({study.clientIndustry})
                    </div>
                    <h3 className="text-base font-black uppercase text-left text-[#0a0a0a]">
                      {study.title}
                    </h3>
                    <p className="text-xs text-neutral-650 leading-relaxed text-left line-clamp-3 font-sans">
                      {study.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-none space-y-2">
                    <div className="flex justify-between items-center text-[9px] text-[#0a0a0a] font-mono uppercase font-bold">
                      <span>KEY OUTCOMES</span>
                      <span className="font-serif italic font-medium text-neutral-500 lowercase">verified</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {study.metrics.map((metric) => (
                        <div key={metric.label} className="text-center">
                          <div className="text-xs sm:text-sm font-black text-[#0a0a0a] font-mono">{metric.value}</div>
                          <div className="text-[8px] text-neutral-500 truncate uppercase tracking-tight">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="px-6 pb-6 pt-2 border-t border-neutral-200/50">
                  <button
                    onClick={() => setSelectedStudy(study)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 rounded-none text-xs font-bold uppercase tracking-widest text-white bg-[#0a0a0a] hover:bg-neutral-850 cursor-pointer transition-all border border-transparent"
                  >
                    View Project Case Study
                    <LucideIcon name="Sparkles" className="ml-2 text-white" size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal display for selected case study */}
        <AnimatePresence>
          {selectedStudy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedStudy(null)}
                className="absolute inset-0 bg-neutral-950/70"
              />

              {/* Case Study Core Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 w-full max-w-2xl bg-white border border-neutral-200 rounded-none overflow-hidden shadow-xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedStudy(null)}
                  className="absolute top-4 right-4 p-2 rounded-none bg-neutral-50 border border-neutral-200 text-neutral-700 hover:text-black transition-colors cursor-pointer"
                >
                  <LucideIcon name="X" size={15} />
                </button>

                <div className="space-y-6">
                  {/* Category branding */}
                  <div className="space-y-2 text-left">
                    <span className="px-2.5 py-1 text-[9px] font-bold font-mono text-white bg-black border border-black rounded-none">
                      {selectedStudy.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#0a0a0a] pt-2">{selectedStudy.title}</h3>
                    <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider pt-1">
                      Client: {selectedStudy.clientName} &bull; Sector: {selectedStudy.clientIndustry}
                    </p>
                  </div>

                  {/* Core description block */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-none space-y-1">
                    <div className="text-[9px] text-[#0a0a0a] font-mono uppercase tracking-wider font-bold">The Mission</div>
                    <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-sans italic">
                      "{selectedStudy.tagline}"
                    </p>
                  </div>

                  {/* Case study objectives details */}
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-left font-sans">
                    {selectedStudy.description}
                  </p>

                  {/* Measurable outcomes list */}
                  <div className="space-y-3.5 pt-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0a0a0a] font-mono text-left">
                      Verified Business Sprints & Metrics
                    </h4>
                    <div className="space-y-3">
                      {selectedStudy.results.map((result, idx) => (
                        <div key={idx} className="flex items-start space-x-3 text-left font-sans">
                          <div className="flex h-5 w-5 bg-[#0a0a0a] text-white items-center justify-center rounded-none flex-shrink-0 text-[10px] font-bold font-mono">
                            {idx + 1}
                          </div>
                          <span className="text-xs sm:text-sm text-neutral-700 leading-relaxed">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <div className="pt-6 border-t border-neutral-205 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left font-mono">
                      <div className="text-[9px] text-neutral-500 uppercase tracking-wider">PROJECT CATEGORY</div>
                      <div className="text-xs text-[#0a0a0a] uppercase font-bold">{selectedStudy.category}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedStudy(null);
                        onNavigate('contact');
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-none text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-800 cursor-pointer transition-all border border-transparent"
                    >
                      Book Milestone Exploration
                      <LucideIcon name="ArrowRight" className="ml-2" size={14} />
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
