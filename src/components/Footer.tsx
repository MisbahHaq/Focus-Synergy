/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LucideIcon from './LucideIcon';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-neutral-900 text-neutral-450 py-16 text-left font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Footer brand info */}
          <div className="md:col-span-5 space-y-5">
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => onNavigate('hero')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-none bg-white text-black font-black text-xs">
                AW
              </div>
              <span className="text-lg font-black tracking-tight text-white uppercase font-sans">
                APPWAVE<span className="text-neutral-500">_</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              AppWave Inc represents rigorous software craftsmanship. We engineer custom mobile apps, immersive games, and production-ready intelligence systems, built USA-side, one single milestone at a time.
            </p>
            <div className="text-[10px] text-neutral-500 font-mono flex items-center space-x-1.5 pt-1.5 uppercase">
              <LucideIcon name="Shield" className="text-white" size={12} />
              <span>100% Client Intellectual Property ownership guaranteed.</span>
            </div>
          </div>

          {/* Quick navigations columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">Operations Domains</h4>
            <ul className="space-y-2 text-[11px] uppercase tracking-wide">
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Mobile Application Sprints
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                  WebGL & Console Games
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Custom LLM & Agent Pipelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer text-left">
                  SaaS Platforms & Dashboards
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">Company</h4>
            <ul className="space-y-2 text-[11px] uppercase tracking-wide">
              <li>
                <button onClick={() => onNavigate('why-us')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Why AppWave
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('case-studies')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Product Successes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('process')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Our Sprints Process
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors cursor-pointer text-left">
                  Inquiries FAQ
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">Contact Details</h4>
            <div className="space-y-3 text-[11px] leading-relaxed uppercase tracking-wide font-sans">
              <p className="text-neutral-400">
                Palo Alto HQ &bull;<br />
                San Francisco, CA 94301
              </p>
              <p className="text-[10px] text-neutral-500 font-mono">
                Corporate: hello@appwaveinc.com
              </p>
            </div>
          </div>

        </div>

        {/* Brand foot labels */}
        <div className="pt-12 mt-12 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 font-mono uppercase tracking-widest gap-4">
          <div>
            &copy; {year} AppWave Inc. All Rights Transferred & Protected.
          </div>
          <div className="flex space-x-6">
            <span>Corporate NDA Locked</span>
            <span>USA Engineering Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
