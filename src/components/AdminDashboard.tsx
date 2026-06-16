/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppConfig, AppConfig } from '../AppContext';
import { CaseStudy, Testimonial, FAQItem, Service } from '../types';
import LucideIcon from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

const AVAILABLE_ICONS = [
  'Smartphone', 'Gamepad2', 'Brain', 'Sparkles', 'Globe', 'Share2', 
  'UserCheck', 'CreditCard', 'MessageSquare', 'WifiOff', 'Star', 
  'Award', 'Shield', 'HelpCircle', 'TrendingUp', 'Layers', 'Clock', 'ChevronDown'
];

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { config, isAdmin, setIsAdmin, updateConfig, resetConfig } = useAppConfig();
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'services' | 'process' | 'case-studies' | 'testimonials' | 'faqs'>('hero');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Local editing states for complex list items
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Authentication gate handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === 'admin' || password === 'appwave2026') {
      setIsAdmin(true);
      setAuthError('');
      showToast('Successfully authenticated as administrator');
    } else {
      setAuthError('INVALID ADMINISTRATIVE KEY CODES');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setPassword('');
    showToast('Administrator sessions terminated safely');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Helper to handle text updates
  const handleUpdateHeroField = (field: keyof AppConfig['hero'], value: any) => {
    updateConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
    showToast('Hero section synchronized');
  };

  const handleDeepUpdateField = <T extends keyof AppConfig>(
    section: T,
    field: keyof AppConfig[T],
    value: any
  ) => {
    updateConfig((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
    showToast(`${String(section)} titles synchronized`);
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 font-mono">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-850 p-8 space-y-6 text-left relative overflow-hidden"
        >
          {/* Subtle line decorations */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white" />
          
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center">
              <span className="w-2 h-2 bg-white mr-2 animate-ping" />
              ADMIN SECURE INGRESS
            </span>
            <button 
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <LucideIcon name="X" size={16} />
            </button>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-sm font-black text-white tracking-widest uppercase">
              ADMINISTRATIVE KEY MANDATORY
            </h2>
            <p className="text-[11px] text-neutral-400">
              Passcode key defaults to <span className="text-white select-all font-bold">"admin"</span> for sandboxed testing.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                ENTER KEY CREDENTIALS
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-neutral-800 hover:border-neutral-700 focus:border-white text-white px-4 py-3 outline-none text-sm font-mono text-center tracking-widest"
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-red-500 text-[10px] uppercase tracking-wider text-center font-bold">
                ⚠️ {authError}
              </p>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-neutral-800 hover:border-neutral-500 text-neutral-400 hover:text-white transition-colors text-xs py-3 uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-white hover:bg-neutral-200 text-black font-black text-xs py-3 uppercase tracking-widest transition-all cursor-pointer"
              >
                Authenticate
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070707] text-neutral-300 font-sans flex flex-col overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-55 bg-white text-black text-xs font-mono px-4 py-2.5 shadow-xl uppercase font-bold tracking-widest border border-white flex items-center space-x-2"
          >
            <LucideIcon name="CheckCircle2" size={12} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Header */}
      <header className="bg-neutral-950 border-b border-neutral-900 p-4 md:px-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white text-black font-black text-xs flex items-center justify-center">
            AW
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest font-mono">
              SYSTEM CONTROL PANEL
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              REAL-TIME CONTENT MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={resetConfig}
            className="px-3 py-1.5 border border-neutral-900 hover:border-red-800 text-[10px] text-neutral-400 hover:text-red-400 font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-500 text-[10px] text-neutral-400 hover:text-white font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer"
          >
            Lock Session
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-widest transition-colors flex items-center cursor-pointer"
          >
            Exit Control Room
            <LucideIcon name="ArrowRight" className="ml-1.5" size={12} />
          </button>
        </div>
      </header>

      {/* Main Panel Content Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Rail */}
        <aside className="w-20 md:w-56 bg-neutral-950 border-r border-neutral-900 overflow-y-auto font-mono text-left">
          <div className="p-3 border-b border-neutral-900 hidden md:block">
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">
              CUSTOMIZATION BLOCKS
            </span>
          </div>

          <nav className="p-2 space-y-1">
            {[
              { id: 'hero', label: '1. HERO COPY', icon: 'Sparkles' },
              { id: 'stats', label: '2. HIGHLIGHT STATS', icon: 'TrendingUp' },
              { id: 'services', label: '3. SERVICES OFFERED', icon: 'Smartphone' },
              { id: 'process', label: '4. SPRINTS PIPELINE', icon: 'Layers' },
              { id: 'case-studies', label: '5. CASE PORTFOLIO', icon: 'Award' },
              { id: 'testimonials', label: '6. CLIENT ENDORSE', icon: 'Star' },
              { id: 'faqs', label: '7. SYSTEM FAQS', icon: 'HelpCircle' }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setEditingIndex(null);
                    setShowAddForm(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 text-xs tracking-wider transition-all cursor-pointer ${
                    active 
                      ? 'bg-neutral-900 text-white font-bold border-l-2 border-white' 
                      : 'text-neutral-400 hover:bg-neutral-900/40 hover:text-white'
                  }`}
                >
                  <LucideIcon name={tab.icon} size={14} className={active ? 'text-white' : 'text-neutral-500'} />
                  <span className="hidden md:inline uppercase text-[10px]">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content board */}
        <main className="flex-1 bg-[#090909] p-6 md:p-10 overflow-y-auto text-left space-y-8 font-mono">
          
          {/* TAB 1: HERO */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  HERO HEADER CUSTOMIZER
                </h2>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                  Modify copy, taglines, and call-to-actions in the primary banner viewport.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Campaign Badge Label
                  </label>
                  <input
                    type="text"
                    value={config.hero.badgeText}
                    onChange={(e) => handleUpdateHeroField('badgeText', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Italic Accent Tagline
                  </label>
                  <input
                    type="text"
                    value={config.hero.italicQuote}
                    onChange={(e) => handleUpdateHeroField('italicQuote', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Main Title Segment 1
                  </label>
                  <input
                    type="text"
                    value={config.hero.titleLine1}
                    onChange={(e) => handleUpdateHeroField('titleLine1', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Main Title Segment 2
                  </label>
                  <input
                    type="text"
                    value={config.hero.titleLine2}
                    onChange={(e) => handleUpdateHeroField('titleLine2', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Core Description Text
                  </label>
                  <textarea
                    value={config.hero.description}
                    onChange={(e) => handleUpdateHeroField('description', e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-850 p-4 text-xs text-white outline-none focus:border-neutral-500 leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Button Action Text 1 (Estimator)
                  </label>
                  <input
                    type="text"
                    value={config.hero.cta1Text}
                    onChange={(e) => handleUpdateHeroField('cta1Text', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Button Action Text 2 (Portfolio)
                  </label>
                  <input
                    type="text"
                    value={config.hero.cta2Text}
                    onChange={(e) => handleUpdateHeroField('cta2Text', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Dynamic list editable */}
              <div className="space-y-3 pt-4 border-t border-neutral-900">
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                  Hero Proof Pillars (Footer Row)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.hero.proofs.map((proof, idx) => (
                    <div key={idx} className="flex space-x-2">
                      <div className="w-10 bg-neutral-900 border border-neutral-800 text-[#888] flex items-center justify-center text-xs font-bold uppercase font-serif italic select-none">
                        {proof.letter}/
                      </div>
                      <input
                        type="text"
                        value={proof.text}
                        onChange={(e) => {
                          const newProofs = [...config.hero.proofs];
                          newProofs[idx].text = e.target.value;
                          handleUpdateHeroField('proofs', newProofs);
                        }}
                        className="flex-1 bg-neutral-950 border border-neutral-850 px-3 py-2 text-xs text-white outline-none focus:border-neutral-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  TRACK RECORD HEADERS & NUMBERS
                </h2>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                  Upkeep high-impact digital statistics, percentages, and milestone metrics.
                </p>
              </div>

              {/* Stat Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950/40 border border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Status Badge
                  </label>
                  <input
                    type="text"
                    value={config.statsHeader.badge}
                    onChange={(e) => handleDeepUpdateField('statsHeader', 'badge', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2.5 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Main Title
                  </label>
                  <input
                    type="text"
                    value={config.statsHeader.title}
                    onChange={(e) => handleDeepUpdateField('statsHeader', 'title', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2.5 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Introduction Text
                  </label>
                  <textarea
                    value={config.statsHeader.description}
                    onChange={(e) => handleDeepUpdateField('statsHeader', 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Map list of stats */}
              <div className="space-y-4">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                  METRIC CARDS (MAX 4)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.stats.map((stat, idx) => (
                    <div key={stat.id} className="bg-neutral-950 border border-neutral-900 p-5 space-y-4 text-left">
                      <div className="flex justify-between items-center bg-neutral-900/50 p-2 border-b border-neutral-850">
                        <span className="text-[9px] font-black uppercase text-white">
                          CARD #{idx + 1} ({stat.id})
                        </span>
                        <div className="flex items-center space-x-2">
                          <label className="text-[8px] text-neutral-500 uppercase font-black">ICON:</label>
                          <select
                            value={stat.icon}
                            onChange={(e) => {
                              const newStats = [...config.stats];
                              newStats[idx].icon = e.target.value;
                              updateConfig(prev => ({ ...prev, stats: newStats }));
                              showToast('Metric card icon configured');
                            }}
                            className="bg-black border border-neutral-800 text-[9px] text-white px-2 py-1 outline-none"
                          >
                            {AVAILABLE_ICONS.map(ic => (
                              <option key={ic} value={ic}>{ic}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-500 uppercase font-bold">DIGITAL VALUE</label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...config.stats];
                              newStats[idx].value = e.target.value;
                              updateConfig(prev => ({ ...prev, stats: newStats }));
                            }}
                            className="w-full bg-black border border-neutral-850 px-2 py-1.5 text-xs text-white outline-none font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-500 uppercase font-bold">LABEL CAPTION</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...config.stats];
                              newStats[idx].label = e.target.value;
                              updateConfig(prev => ({ ...prev, stats: newStats }));
                            }}
                            className="w-full bg-black border border-neutral-850 px-2 py-1.5 text-xs text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1 col-span-2">
                          <label className="text-[9px] text-neutral-500 uppercase font-bold">DESCRIPTION EXPLANATION</label>
                          <input
                            type="text"
                            value={stat.description}
                            onChange={(e) => {
                              const newStats = [...config.stats];
                              newStats[idx].description = e.target.value;
                              updateConfig(prev => ({ ...prev, stats: newStats }));
                            }}
                            className="w-full bg-black border border-neutral-850 px-2 py-1.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    SERVICES & ENGINEERING DEPARTMENTS
                  </h2>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                    Administer technical expertise nodes, structural copy, features, and target benefits.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  + Add Service
                </button>
              </div>

              {/* Section Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950/40 border border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Status Badge
                  </label>
                  <input
                    type="text"
                    value={config.servicesHeader.badge}
                    onChange={(e) => handleDeepUpdateField('servicesHeader', 'badge', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Banner Title
                  </label>
                  <input
                    type="text"
                    value={config.servicesHeader.title}
                    onChange={(e) => handleDeepUpdateField('servicesHeader', 'title', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Summary Paragraph
                  </label>
                  <textarea
                    value={config.servicesHeader.description}
                    onChange={(e) => handleDeepUpdateField('servicesHeader', 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Grid lists of services */}
              <div className="space-y-4">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                  ACTIVE SPECIALTIES ({config.services.length})
                </span>

                <div className="space-y-3">
                  {config.services.map((srv, idx) => (
                    <div 
                      key={srv.id}
                      className="bg-neutral-950 border border-neutral-900 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-3 text-left">
                        <div className="p-2.5 bg-neutral-900 text-white border border-neutral-800">
                          <LucideIcon name={srv.iconName} size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{srv.title}</h4>
                          <p className="text-[10px] text-neutral-500 mt-0.5 max-w-xl truncate">{srv.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                        <button
                          onClick={() => {
                            setEditingIndex(idx);
                            setShowAddForm(false);
                          }}
                          className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-500 text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Modify details
                        </button>
                        <button
                          onClick={() => {
                            if (config.services.length <= 1) {
                              alert('You must leave at least one service offering.');
                              return;
                            }
                            if (window.confirm(`Delete service: "${srv.title}"?`)) {
                              const newSrvs = config.services.filter((_, i) => i !== idx);
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                              showToast('Service deleted');
                            }
                          }}
                          className="px-2 py-1.5 border border-neutral-900 hover:border-red-900 text-[10px] font-bold text-neutral-600 hover:text-red-400 uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nested interactive Service Sub-Editor */}
              {(editingIndex !== null || showAddForm) && (
                <div className="p-6 bg-neutral-900 border border-white mt-6 space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-xs font-black uppercase text-white tracking-widest">
                      {showAddForm ? 'ADD NEW DEPT SERVICE PROFILE' : `EDIT SERVICE OFFERING: "${config.services[editingIndex!].title}"`}
                    </span>
                    <button 
                      onClick={() => {
                        setEditingIndex(null);
                        setShowAddForm(false);
                      }}
                      className="text-neutral-500 hover:text-white uppercase text-[10px] tracking-wider"
                    >
                      [ Close Subform ]
                    </button>
                  </div>

                  {/* Edit actual fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Service ID Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. mobile-ios"
                        disabled={!showAddForm}
                        value={showAddForm ? '' : config.services[editingIndex!].id}
                        onChange={(e) => {
                          if (showAddForm) return;
                          const newSrvs = [...config.services];
                          newSrvs[editingIndex!].id = e.target.value.toLowerCase().trim().replace(/\s+/g, '-');
                          updateConfig(prev => ({ ...prev, services: newSrvs }));
                        }}
                        className={`w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white ${!showAddForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Service Display Title</label>
                      <input
                        type="text"
                        id="srv-title-input"
                        placeholder="e.g. iOS Development"
                        value={showAddForm ? '' : config.services[editingIndex!].title}
                        onChange={(e) => {
                          if (showAddForm) {
                            const newSrv = {
                              id: e.target.value.toLowerCase().trim().replace(/\s+/g, '-'),
                              title: e.target.value,
                              description: 'Brief description summary here.',
                              longDescription: 'Extended capabilities breakdown...',
                              iconName: 'Smartphone',
                              benefits: ['Expert native engineers', 'Offline sync modes'],
                              features: ['Push alerts', 'Stripe payments'],
                              tags: ['iOS', 'Swift'],
                              themeColor: 'from-cyan-500 to-blue-600'
                            };
                            updateConfig(prev => ({ ...prev, services: [...prev.services, newSrv] }));
                            setEditingIndex(config.services.length);
                            setShowAddForm(false);
                            showToast('Constructed brand new service node structure');
                          } else {
                            const newSrvs = [...config.services];
                            newSrvs[editingIndex!].title = e.target.value;
                            updateConfig(prev => ({ ...prev, services: newSrvs }));
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                      />
                    </div>

                    {!showAddForm && editingIndex !== null && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Choose Lucide SVG Icon</label>
                          <select
                            value={config.services[editingIndex].iconName}
                            onChange={(e) => {
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].iconName = e.target.value;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          >
                            {AVAILABLE_ICONS.map(ic => (
                              <option key={ic} value={ic}>{ic}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Theme Gradient Color</label>
                          <select
                            value={config.services[editingIndex].themeColor}
                            onChange={(e) => {
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].themeColor = e.target.value;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white font-mono"
                          >
                            <option value="from-cyan-500 to-blue-600">Cyan to Blue (Modern Teal)</option>
                            <option value="from-amber-500 to-rose-600">Amber to Rose (Searing Fire)</option>
                            <option value="from-indigo-500 to-violet-600">Indigo to Violet (Royal Purple)</option>
                            <option value="from-pink-500 to-purple-600">Pink to Purple (Cosmic Neon)</option>
                            <option value="from-emerald-500 to-teal-600">Emerald to Teal (Tactical Green)</option>
                          </select>
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Teaser Short Description (Grid View)</label>
                          <input
                            type="text"
                            value={config.services[editingIndex].description}
                            onChange={(e) => {
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].description = e.target.value;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Detailed Long Description (Sprit Modal Drawer)</label>
                          <textarea
                            value={config.services[editingIndex].longDescription}
                            onChange={(e) => {
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].longDescription = e.target.value;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            rows={3}
                            className="w-full bg-neutral-950 border border-neutral-800 p-3 outline-none text-white"
                          />
                        </div>

                        <div className="space-y-2 col-span-2 pt-2 border-t border-neutral-800">
                          <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                            Pill Tags (Comma Separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Swift, iOS, Native"
                            value={config.services[editingIndex].tags.join(', ')}
                            onChange={(e) => {
                              const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].tags = arr;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          />
                        </div>

                        {/* List items for features and benefits */}
                        <div className="space-y-2 pt-2 border-t border-neutral-800">
                          <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                            Department Benefits (One Per Line)
                          </label>
                          <textarea
                            value={config.services[editingIndex].benefits.join('\n')}
                            onChange={(e) => {
                              const arr = e.target.value.split('\n').filter(Boolean);
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].benefits = arr;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            rows={3}
                            placeholder="Benefit item 1&#10;Benefit item 2"
                            className="w-full bg-neutral-950 border border-neutral-800 p-3 outline-none text-white leading-relaxed"
                          />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-neutral-800">
                          <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                            Core Features (One Per Line)
                          </label>
                          <textarea
                            value={config.services[editingIndex].features.join('\n')}
                            onChange={(e) => {
                              const arr = e.target.value.split('\n').filter(Boolean);
                              const newSrvs = [...config.services];
                              newSrvs[editingIndex].features = arr;
                              updateConfig(prev => ({ ...prev, services: newSrvs }));
                            }}
                            rows={3}
                            placeholder="Feature item 1&#10;Feature item 2"
                            className="w-full bg-neutral-950 border border-neutral-800 p-3 outline-none text-white leading-relaxed"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setShowAddForm(false);
                        showToast('Service edits stored in local buffer');
                      }}
                      className="px-4 py-2 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      Store & Sync Offerings
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SPRINTS PROCESS */}
          {activeTab === 'process' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">
                  SPRINTS PROCESS & INTERACTIVE STEPS
                </h2>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                  Reconfigure linear agile blueprints, milestones, deliverables, and timeline summaries.
                </p>
              </div>

              {/* Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950/40 border border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Status Badge
                  </label>
                  <input
                    type="text"
                    value={config.processHeader.badge}
                    onChange={(e) => handleDeepUpdateField('processHeader', 'badge', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Banner Title
                  </label>
                  <input
                    type="text"
                    value={config.processHeader.title}
                    onChange={(e) => handleDeepUpdateField('processHeader', 'title', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Summary Paragraph
                  </label>
                  <textarea
                    value={config.processHeader.description}
                    onChange={(e) => handleDeepUpdateField('processHeader', 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Sprints items */}
              <div className="space-y-6">
                {config.processSteps.map((step, idx) => (
                  <div key={idx} className="bg-neutral-950 border border-neutral-900 p-5 space-y-4 text-left">
                    <div className="flex justify-between items-center bg-neutral-900 pb-3 border-b border-neutral-850">
                      <span className="text-xs font-black text-white font-mono flex items-center">
                        <span className="px-2 py-0.5 bg-white text-black font-extrabold mr-2">STEP {step.number}</span>
                        {step.title}
                      </span>

                      <div className="flex items-center space-x-2">
                        <label className="text-[9px] text-neutral-500 uppercase tracking-wider font-bold">ICON:</label>
                        <select
                          value={step.icon}
                          onChange={(e) => {
                            const newSteps = [...config.processSteps];
                            newSteps[idx].icon = e.target.value;
                            updateConfig(prev => ({ ...prev, processSteps: newSteps }));
                            showToast('Sprint step icon set');
                          }}
                          className="bg-black border border-neutral-800 text-[10px] text-white px-2 py-1 outline-none"
                        >
                          {AVAILABLE_ICONS.map(ic => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Sprint Step Headline</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...config.processSteps];
                            newSteps[idx].title = e.target.value;
                            updateConfig(prev => ({ ...prev, processSteps: newSteps }));
                          }}
                          className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2 outline-none text-white font-sans"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Step Subtitle Tagline</label>
                        <input
                          type="text"
                          value={step.subtitle}
                          onChange={(e) => {
                            const newSteps = [...config.processSteps];
                            newSteps[idx].subtitle = e.target.value;
                            updateConfig(prev => ({ ...prev, processSteps: newSteps }));
                          }}
                          className="w-full bg-neutral-950 border border-neutral-850 px-3 py-2 outline-none text-white font-sans"
                        />
                      </div>

                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Step Descriptive Scope</label>
                        <textarea
                          value={step.description}
                          onChange={(e) => {
                            const newSteps = [...config.processSteps];
                            newSteps[idx].description = e.target.value;
                            updateConfig(prev => ({ ...prev, processSteps: newSteps }));
                          }}
                          rows={2}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 outline-none text-white leading-relaxed font-sans"
                        />
                      </div>

                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                          Key Deliverables (One Per Line)
                        </label>
                        <textarea
                          value={step.deliverables.join('\n')}
                          onChange={(e) => {
                            const arr = e.target.value.split('\n').filter(Boolean);
                            const newSteps = [...config.processSteps];
                            newSteps[idx].deliverables = arr;
                            updateConfig(prev => ({ ...prev, processSteps: newSteps }));
                          }}
                          rows={3}
                          className="w-full bg-neutral-950 border border-neutral-850 p-3 outline-none text-white font-sans leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CASE STUDIES */}
          {activeTab === 'case-studies' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    CASE PORTFOLIO & CLIENT PRODUCTS
                  </h2>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                    Administer active portfolios, results checklists, metrics, and cover imagery.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  + Add Portfolio Item
                </button>
              </div>

              {/* Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950/40 border border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Status Badge
                  </label>
                  <input
                    type="text"
                    value={config.caseStudiesHeader.badge}
                    onChange={(e) => handleDeepUpdateField('caseStudiesHeader', 'badge', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Banner Title
                  </label>
                  <input
                    type="text"
                    value={config.caseStudiesHeader.title}
                    onChange={(e) => handleDeepUpdateField('caseStudiesHeader', 'title', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Summary Paragraph
                  </label>
                  <textarea
                    value={config.caseStudiesHeader.description}
                    onChange={(e) => handleDeepUpdateField('caseStudiesHeader', 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Portfolios list mapping */}
              <div className="space-y-3">
                {config.caseStudies.map((cs, idx) => (
                  <div key={cs.id} className="bg-neutral-950 border border-neutral-900 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 text-left">
                      <img src={cs.imageUrl} alt={cs.title} className="w-12 h-12 object-cover border border-neutral-850" />
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cs.title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{cs.category} &bull; Sponsor: {cs.clientName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 justify-end">
                      <button
                        onClick={() => {
                          setEditingIndex(idx);
                          setShowAddForm(false);
                        }}
                        className="px-3 py-1.5 border border-neutral-800 hover:border-neutral-500 text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Modify Details
                      </button>
                      <button
                        onClick={() => {
                          if (config.caseStudies.length <= 1) {
                            alert('Leave at least one case study.');
                            return;
                          }
                          if (window.confirm(`Delete portfolio case: "${cs.title}"?`)) {
                            const filtered = config.caseStudies.filter((_, i) => i !== idx);
                            updateConfig(prev => ({ ...prev, caseStudies: filtered }));
                            showToast('Case study deleted successfully');
                          }
                        }}
                        className="px-2 py-1.5 border border-neutral-900 hover:border-red-950 text-[10px] text-neutral-600 hover:text-red-400 uppercase tracking-widest cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Portfolios sub-form */}
              {(editingIndex !== null || showAddForm) && (
                <div className="p-6 bg-neutral-900 border border-white mt-6 space-y-6 text-left">
                  <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                    <span className="text-xs font-black uppercase text-white tracking-widest">
                      {showAddForm ? 'ADD NEW DEPLOYED CASE STUDY' : `EDIT PORTFOLIO CASE: "${config.caseStudies[editingIndex!].title}"`}
                    </span>
                    <button 
                      onClick={() => {
                        setEditingIndex(null);
                        setShowAddForm(false);
                      }}
                      className="text-neutral-500 hover:text-white uppercase text-[10px] tracking-wider"
                    >
                      [ Close Subform ]
                    </button>
                  </div>

                  {/* Fields editing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Case ID Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. mobile-pipeline"
                        disabled={!showAddForm}
                        value={showAddForm ? '' : config.caseStudies[editingIndex!].id}
                        onChange={(e) => {
                          if (!showAddForm) return;
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Case Display Title</label>
                      <input
                        type="text"
                        placeholder="e.g. NeoRealm Graphics Sprints"
                        value={showAddForm ? '' : config.caseStudies[editingIndex!].title}
                        onChange={(e) => {
                          if (showAddForm) {
                            const newCase: CaseStudy = {
                              id: 'cs-' + Math.floor(Math.random() * 100),
                              title: e.target.value,
                              category: 'App Strategy',
                              clientName: 'Partner Enterprise',
                              clientIndustry: 'Logistics',
                              description: 'Case description profile here.',
                              results: ['Saved 100 hours', 'Active 10k users'],
                              metrics: [
                                { label: 'User Savings', value: '4.9⭐' },
                                { label: 'Latency Drop', value: '-80%' }
                              ],
                              tagline: 'Translating legacy code lines into optimized routes.',
                              imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
                              accentColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
                            };
                            updateConfig(prev => ({ ...prev, caseStudies: [...prev.caseStudies, newCase] }));
                            setEditingIndex(config.caseStudies.length);
                            setShowAddForm(false);
                            showToast('Added portfolio case outline');
                          } else {
                            const newArr = [...config.caseStudies];
                            newArr[editingIndex!].title = e.target.value;
                            updateConfig(prev => ({ ...prev, caseStudies: newArr }));
                          }
                        }}
                        className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                      />
                    </div>

                    {!showAddForm && editingIndex !== null && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Operations Category Tag</label>
                          <input
                            type="text"
                            value={config.caseStudies[editingIndex].category}
                            onChange={(e) => {
                              const arr = [...config.caseStudies];
                              arr[editingIndex].category = e.target.value;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Sponsor Client Name</label>
                          <input
                            type="text"
                            value={config.caseStudies[editingIndex].clientName}
                            onChange={(e) => {
                              const arr = [...config.caseStudies];
                              arr[editingIndex].clientName = e.target.value;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Sponsor Client Industry</label>
                          <input
                            type="text"
                            value={config.caseStudies[editingIndex].clientIndustry}
                            onChange={(e) => {
                              const arr = [...config.caseStudies];
                              arr[editingIndex].clientIndustry = e.target.value;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">High-Definition Photo URL</label>
                          <input
                            type="text"
                            value={config.caseStudies[editingIndex].imageUrl}
                            onChange={(e) => {
                              const arr = [...config.caseStudies];
                              arr[editingIndex].imageUrl = e.target.value;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white font-mono text-[11px]"
                          />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Bespoke Accent Tagline (Short/Emotional)</label>
                          <input
                            type="text"
                            value={config.caseStudies[editingIndex].tagline}
                            onChange={(e) => {
                              const arr = [...config.caseStudies];
                              arr[editingIndex].tagline = e.target.value;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-3 py-2 outline-none text-white"
                          />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Full Deployed Summary</label>
                          <textarea
                            value={config.caseStudies[editingIndex].description}
                            onChange={(e) => {
                              const arr = [...config.caseStudies];
                              arr[editingIndex].description = e.target.value;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            rows={3}
                            className="w-full bg-neutral-950 border border-neutral-800 p-3 outline-none text-white"
                          />
                        </div>

                        {/* Results check list */}
                        <div className="col-span-2 space-y-2 pt-2 border-t border-neutral-800">
                          <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black font-mono">Results Checklist (One per line)</label>
                          <textarea
                            value={config.caseStudies[editingIndex].results.join('\n')}
                            onChange={(e) => {
                              const lines = e.target.value.split('\n').filter(Boolean);
                              const arr = [...config.caseStudies];
                              arr[editingIndex].results = lines;
                              updateConfig(prev => ({ ...prev, caseStudies: arr }));
                            }}
                            rows={3}
                            className="w-full bg-neutral-950 border border-neutral-800 p-3 outline-none text-white"
                          />
                        </div>

                        {/* Interactive Metrics mapping (two metric boxes available per case study) */}
                        <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-neutral-850">
                          {config.caseStudies[editingIndex].metrics.map((metric, mStateIdx) => (
                            <div key={mStateIdx} className="p-3 bg-black border border-neutral-800 rounded-none space-y-2">
                              <span className="text-[9px] font-black uppercase text-neutral-400 font-mono">PORTFOLIO KEY METRIC #{mStateIdx + 1}</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-neutral-500 uppercase font-black font-mono">VALUE</label>
                                  <input
                                    type="text"
                                    value={metric.value}
                                    onChange={(e) => {
                                      const arr = [...config.caseStudies];
                                      arr[editingIndex].metrics[mStateIdx].value = e.target.value;
                                      updateConfig(prev => ({ ...prev, caseStudies: arr }));
                                    }}
                                    className="w-full bg-neutral-950 border border-neutral-800 px-2 py-1 text-xs text-white outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] text-neutral-500 uppercase font-black font-mono">LABEL</label>
                                  <input
                                    type="text"
                                    value={metric.label}
                                    onChange={(e) => {
                                      const arr = [...config.caseStudies];
                                      arr[editingIndex].metrics[mStateIdx].label = e.target.value;
                                      updateConfig(prev => ({ ...prev, caseStudies: arr }));
                                    }}
                                    className="w-full bg-neutral-950 border border-neutral-800 px-2 py-1 text-xs text-white outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setShowAddForm(false);
                        showToast('Portfolio updates fully synchronized');
                      }}
                      className="px-4 py-2 bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      Store Case Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    TESTIMONIALS & CORPORATE ENDORSEMENT
                  </h2>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                    Administer partner quote metrics, authority names, avatar visuals, and rating scores.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  + Add Endorsement
                </button>
              </div>

              {/* headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950/40 border border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Status Badge
                  </label>
                  <input
                    type="text"
                    value={config.testimonialsHeader.badge}
                    onChange={(e) => handleDeepUpdateField('testimonialsHeader', 'badge', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Title Text
                  </label>
                  <input
                    type="text"
                    value={config.testimonialsHeader.title}
                    onChange={(e) => handleDeepUpdateField('testimonialsHeader', 'title', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Description
                  </label>
                  <textarea
                    value={config.testimonialsHeader.description}
                    onChange={(e) => handleDeepUpdateField('testimonialsHeader', 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Endorsements array list */}
              <div className="space-y-4">
                {config.testimonials.map((test, idx) => (
                  <div key={test.id} className="bg-neutral-950 border border-neutral-900 p-5 space-y-4 text-left font-sans text-xs">
                    <div className="flex justify-between items-center bg-neutral-900 p-2.5 border-b border-neutral-850 font-mono">
                      <span className="text-[10px] font-black text-white uppercase uppercase">ENDORSE #{idx + 1} ({test.author})</span>
                      <button
                        onClick={() => {
                          if (config.testimonials.length <= 1) {
                            alert('Must keep 1 client quote.');
                            return;
                          }
                          if (window.confirm(`Delete endorsement by: ${test.author}?`)) {
                            const newTests = config.testimonials.filter((_, i) => i !== idx);
                            updateConfig(prev => ({ ...prev, testimonials: newTests }));
                            showToast('Endorsement removed from register');
                          }
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
                      >
                        [ Delete Quote ]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Name fields */}
                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-500 font-bold uppercase font-mono">PERSON NAME</label>
                        <input
                          type="text"
                          value={test.author}
                          onChange={(e) => {
                            const arr = [...config.testimonials];
                            arr[idx].author = e.target.value;
                            updateConfig(prev => ({ ...prev, testimonials: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-500 font-bold uppercase font-mono">DESIGNATION POSITION</label>
                        <input
                          type="text"
                          value={test.position}
                          onChange={(e) => {
                            const arr = [...config.testimonials];
                            arr[idx].position = e.target.value;
                            updateConfig(prev => ({ ...prev, testimonials: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-500 font-bold uppercase font-mono">SPONSOR COMPANY</label>
                        <input
                          type="text"
                          value={test.company}
                          onChange={(e) => {
                            const arr = [...config.testimonials];
                            arr[idx].company = e.target.value;
                            updateConfig(prev => ({ ...prev, testimonials: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[9px] text-neutral-500 font-bold uppercase font-serif italic font-mono">AVATAR PICTURE URL</label>
                        <input
                          type="text"
                          value={test.avatarUrl}
                          onChange={(e) => {
                            const arr = [...config.testimonials];
                            arr[idx].avatarUrl = e.target.value;
                            updateConfig(prev => ({ ...prev, testimonials: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white outline-none text-[11px] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-500 font-bold uppercase font-mono">DEVELOPMENT SCOPE TYPE</label>
                        <input
                          type="text"
                          value={test.projectType}
                          onChange={(e) => {
                            const arr = [...config.testimonials];
                            arr[idx].projectType = e.target.value;
                            updateConfig(prev => ({ ...prev, testimonials: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white text-xs outline-none"
                        />
                      </div>

                      <div className="col-span-3 space-y-1">
                        <label className="block text-[9px] text-neutral-500 font-bold uppercase font-mono">PARTNER CLIENT QUOTE</label>
                        <textarea
                          value={test.quote}
                          onChange={(e) => {
                            const arr = [...config.testimonials];
                            arr[idx].quote = e.target.value;
                            updateConfig(prev => ({ ...prev, testimonials: arr }));
                          }}
                          rows={2.5}
                          className="w-full bg-black border border-neutral-800 p-3 text-white outline-none text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Endorsements template adder form */}
              {showAddForm && (
                <div className="p-4 bg-neutral-900 border border-neutral-700 text-left space-y-4">
                  <span className="text-[10px] font-bold uppercase text-white font-mono tracking-widest block">INITIALIZE BRAND NEW ENDORSEMENT FORM</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-400 font-bold uppercase font-mono">Person Name</label>
                      <input
                        type="text"
                        id="new-test-author"
                        placeholder="e.g. Marc Andreessen"
                        className="w-full bg-black border border-neutral-800 px-3 py-2 text-white outline-none text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1 flex items-end">
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-test-author') as HTMLInputElement;
                          if (!input || !input.value.trim()) {
                            alert('Type author name first.');
                            return;
                          }
                          const newRecord: Testimonial = {
                            id: 'test-' + Math.floor(Math.random() * 1000),
                            author: input.value,
                            position: 'Managing Partner',
                            company: 'Silicon Capital',
                            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
                            quote: 'AppWave delivered our custom machine learning pipeline under-time and under-capital expectations.',
                            rating: 5,
                            projectType: 'Core DevOps Coding'
                          };
                          updateConfig(prev => ({ ...prev, testimonials: [...prev.testimonials, newRecord] }));
                          setShowAddForm(false);
                          showToast('Endorsement added to list');
                        }}
                        className="w-full bg-white text-black py-2 text-xs font-black uppercase tracking-widest font-mono cursor-pointer"
                      >
                        Generate Endorsement Structure
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SYSTEM FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="border-b border-neutral-900 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    SYSTEM FAQS & REASSURANCES
                  </h2>
                  <p className="text-[10px] text-neutral-500 mt-1 uppercase">
                    Administer technical inquiries, legal questions, and compliance workflows.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  + Add Live FAQ
                </button>
              </div>

              {/* headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-950/40 border border-neutral-900">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Status Badge
                  </label>
                  <input
                    type="text"
                    value={config.faqHeader.badge}
                    onChange={(e) => handleDeepUpdateField('faqHeader', 'badge', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Banner Title
                  </label>
                  <input
                    type="text"
                    value={config.faqHeader.title}
                    onChange={(e) => handleDeepUpdateField('faqHeader', 'title', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 px-4 py-2 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">
                    Section Banner Description
                  </label>
                  <textarea
                    value={config.faqHeader.description}
                    onChange={(e) => handleDeepUpdateField('faqHeader', 'description', e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-850 p-3 text-xs text-white outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* FAQs checklist map */}
              <div className="space-y-4">
                {config.faqs.map((faq, idx) => (
                  <div key={faq.id} className="bg-neutral-950 border border-neutral-900 p-4 space-y-4 text-xs font-sans text-left">
                    <div className="flex justify-between items-center bg-neutral-900/60 p-2.5 border-b border-neutral-850 font-mono">
                      <span className="text-[10px] font-black text-white uppercase uppercase">INQUIRY WORK #${idx + 1} ({faq.category})</span>
                      <button
                        onClick={() => {
                          if (config.faqs.length <= 1) {
                            alert('Must keep at least 1 FAQ.');
                            return;
                          }
                          if (window.confirm(`Delete FAQ: "${faq.question}"?`)) {
                            const newFaqs = config.faqs.filter((_, i) => i !== idx);
                            updateConfig(prev => ({ ...prev, faqs: newFaqs }));
                            showToast('FAQ inquiry removed');
                          }
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
                      >
                        [ Delete FAQ ]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Name inputs */}
                      <div className="space-y-1">
                        <label className="block text-[9px] text-neutral-550 font-mono tracking-wider">CATEGORY</label>
                        <input
                          type="text"
                          value={faq.category}
                          onChange={(e) => {
                            const arr = [...config.faqs];
                            arr[idx].category = e.target.value;
                            updateConfig(prev => ({ ...prev, faqs: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white outline-none font-mono"
                        />
                      </div>

                      <div className="col-span-3 space-y-1">
                        <label className="block text-[9px] text-neutral-550 font-mono tracking-wider">FAQ QUESTION TEXT</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            const arr = [...config.faqs];
                            arr[idx].question = e.target.value;
                            updateConfig(prev => ({ ...prev, faqs: arr }));
                          }}
                          className="w-full bg-black border border-neutral-800 px-3 py-1.5 text-white text-xs outline-none font-sans font-bold"
                        />
                      </div>

                      <div className="col-span-4 space-y-1">
                        <label className="block text-[9px] text-neutral-550 font-mono tracking-wider">RESOLVED ANSWER TEXT</label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const arr = [...config.faqs];
                            arr[idx].answer = e.target.value;
                            updateConfig(prev => ({ ...prev, faqs: arr }));
                          }}
                          rows={2.5}
                          className="w-full bg-black border border-neutral-800 p-2.5 text-white text-xs outline-none leading-relaxed font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQs adder form */}
              {showAddForm && (
                <div className="p-4 bg-neutral-900 border border-neutral-700 text-left space-y-4">
                  <span className="text-[10px] font-bold uppercase text-white font-mono tracking-widest block font-bold">INITIALIZE LIVE FAQ SYSTEM</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-400 font-bold uppercase font-mono">FAQ Inquiry Title</label>
                      <input
                        type="text"
                        id="new-faq-question"
                        placeholder="e.g. Do you support private source code access?"
                        className="w-full bg-black border border-neutral-800 px-3 py-2 text-white outline-none text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1 flex items-end">
                      <button
                        onClick={() => {
                          const input = document.getElementById('new-faq-question') as HTMLInputElement;
                          if (!input || !input.value.trim()) {
                            alert('Type question first.');
                            return;
                          }
                          const newFAQ: FAQItem = {
                            id: 'faq-' + Math.floor(Math.random() * 1000),
                            question: input.value,
                            answer: 'All projects include fully audited source code transfer. We deliver continuous access during development pipelines.',
                            category: 'Process'
                          };
                          updateConfig(prev => ({ ...prev, faqs: [...prev.faqs, newFAQ] }));
                          setShowAddForm(false);
                          showToast('Added FAQ inquiry, ready for customization');
                        }}
                        className="w-full bg-white text-black py-2 text-xs font-black uppercase tracking-widest font-mono cursor-pointer animate-none"
                      >
                        Create Live FAQ Structure
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
