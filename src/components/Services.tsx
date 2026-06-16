/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppConfig } from '../AppContext';
import { Service } from '../types';
import LucideIcon from './LucideIcon';

interface ServicesProps {
  onSelectServiceForEstimate: (serviceId: string) => void;
  onNavigate: (sectionId: string) => void;
}

export default function Services({ onSelectServiceForEstimate, onNavigate }: ServicesProps) {
  const { config } = useAppConfig();
  const services = config.services;
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Defensive fallback if a service is deleted by the admin
  const activeId = services.some((s) => s.id === selectedServiceId)
    ? selectedServiceId
    : (services[0]?.id || '');

  const selectedService = services.find((s) => s.id === activeId) || services[0];

  const handleEstimateAction = (serviceId: string) => {
    onSelectServiceForEstimate(serviceId);
    onNavigate('contact');
  };

  if (!selectedService) {
    return null;
  }

  return (
    <section id="services" className="py-24 bg-white text-[#0a0a0a] relative border-b border-neutral-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        
        {/* Header content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-200 text-xs font-bold text-neutral-500 tracking-widest uppercase font-mono bg-white">
              <span className="font-serif italic font-medium text-neutral-400 lowercase">03 /</span>
              <span>{config.servicesHeader.badge}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-[#0a0a0a] font-sans">
              {config.servicesHeader.title}
            </h2>
            <p className="text-neutral-600 text-sm leading-relaxed font-sans">
              {config.servicesHeader.description}
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="self-start md:self-auto inline-flex items-center text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 cursor-pointer hover:opacity-75 transition-opacity"
          >
            Request Custom Quote
            <LucideIcon name="ArrowRight" className="ml-2" size={14} />
          </button>
        </div>

        {/* Tab & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Tab selectors */}
          <div className="lg:col-span-5 space-y-3">
            {services.map((service) => {
              const isActive = service.id === activeId;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`w-full text-left p-5 rounded-none border transition-all flex items-center space-x-4 cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-md'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 text-[#0a0a0a]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-none transition-all ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-[#0a0a0a]'
                    }`}
                  >
                    <LucideIcon name={service.iconName} size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`text-xs font-black uppercase tracking-wider font-sans ${isActive ? 'text-white' : 'text-[#0a0a0a]'}`}>
                      {service.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-normal font-sans line-clamp-1 ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {service.description}
                    </p>
                  </div>
                  <LucideIcon
                    name="ChevronRight"
                    className={`w-4 h-4 transition-transform hidden sm:block ${
                      isActive ? 'text-white' : 'text-neutral-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Tab view details card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedService.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0a0a0a] border border-neutral-900 text-white rounded-none p-6 sm:p-8 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Title & tags */}
                  <div className="space-y-3 text-left">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedService.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-[9px] font-mono text-neutral-350 font-bold uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-wider text-white">{selectedService.title}</h3>
                  </div>

                  {/* Descriptions */}
                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed text-left font-sans">
                    {selectedService.longDescription}
                  </p>

                  {/* Core deliverables */}
                  <div className="space-y-3.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 font-mono text-left">
                      Key Deliverables & Strengths
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedService.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-left">
                          <LucideIcon name="CheckCircle2" className="text-white mt-0.5 flex-shrink-0" size={14} />
                          <span className="text-xs text-neutral-300 leading-relaxed font-sans">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlight custom components included */}
                  <div className="pt-4 border-t border-neutral-900 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <LucideIcon name="Layers" className="text-neutral-500" size={16} />
                      <span className="text-xs text-neutral-500 font-mono">Includes matching core assets</span>
                    </div>
                  </div>
                </div>

                {/* Direct estimation button */}
                <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left font-sans">
                    <div className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">PROJECTED TIMELINE</div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider mt-1">1.5 - 4 Months Delivery</div>
                  </div>
                  <button
                    onClick={() => handleEstimateAction(selectedService.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-none text-xs font-bold uppercase tracking-widest text-black bg-white hover:bg-neutral-100 cursor-pointer transition-all border border-white"
                  >
                    Inquire About This Service
                    <LucideIcon name="ArrowRight" className="ml-2" size={14} />
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
