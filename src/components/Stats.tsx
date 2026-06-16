/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import LucideIcon from './LucideIcon';
import { useAppConfig } from '../AppContext';

export default function Stats() {
  const { config } = useAppConfig();
  const stats = config.stats;

  return (
    <section id="why-us" className="py-24 bg-[#0a0a0a] border-t border-b border-neutral-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-800 text-xs font-bold text-neutral-400 tracking-widest uppercase font-mono">
            <span className="font-serif italic font-medium text-neutral-600 lowercase">02 /</span>
            <span>{config.statsHeader.badge}</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-white font-sans">
            {config.statsHeader.title}
          </h2>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mx-auto">
            {config.statsHeader.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-neutral-950 border border-neutral-900 rounded-none p-6 hover:bg-neutral-900/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-white">
                    <LucideIcon name={stat.icon} size={20} />
                  </div>
                  <span className="text-[10px] text-neutral-600 font-mono">WAVE_ST_0{idx + 1}</span>
                </div>
                <div>
                  <h3 className="text-4xl sm:text-5xl font-black text-white tracking-[-0.04em] leading-none mb-2 font-sans">
                    {stat.value}
                  </h3>
                  <div className="text-xs font-bold text-white tracking-widest uppercase font-mono mb-2">
                    {stat.label}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    {stat.description}
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
