/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { useAppConfig } from '../AppContext';
import LucideIcon from './LucideIcon';

export default function Testimonials() {
  const { config } = useAppConfig();
  const testimonials = config.testimonials;

  return (
    <section className="py-24 bg-white border-b border-neutral-250 text-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-200 text-xs font-bold text-neutral-500 tracking-widest uppercase font-mono bg-white">
            <span className="font-serif italic font-medium text-neutral-400 lowercase">08 /</span>
            <span>{config.testimonialsHeader.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-[#0a0a0a] font-sans">
            {config.testimonialsHeader.title}
          </h2>
          <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl mx-auto font-sans">
            {config.testimonialsHeader.description}
          </p>
        </div>

        {/* Grid cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white border border-neutral-200 rounded-none p-6 hover:border-neutral-400 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Stars and rating block */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="inline-block">
                        <LucideIcon name="Star" className="text-black fill-black" size={13} />
                      </span>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">{testimonial.projectType}</span>
                </div>

                {/* Quote text */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed text-left font-sans italic">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Author profile */}
              <div className="flex items-center space-x-3.5 pt-6 border-t border-neutral-200 mt-6 md:mt-4">
                <img
                  src={testimonial.avatarUrl}
                  alt={testimonial.author}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-none object-cover border border-neutral-200"
                />
                <div className="text-left font-sans">
                  <h4 className="text-xs font-black uppercase text-black tracking-wider leading-none">{testimonial.author}</h4>
                  <p className="text-[10px] text-neutral-500 font-mono mt-1">
                    {testimonial.position} &bull; <span className="font-bold text-neutral-800">{testimonial.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
