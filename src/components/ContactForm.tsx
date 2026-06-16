/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppConfig } from '../AppContext';
import { submitProposal } from '../firebase';
import LucideIcon from './LucideIcon';

interface PrepopulationData {
  platform: string;
  design: string;
  features: string[];
  timeline: string;
  totalCost: number;
}

interface ContactFormProps {
  prepopulatedEstimate: PrepopulationData | null;
  onClearEstimate: () => void;
  selectedServiceId?: string;
  onClearServiceId?: () => void;
}

export default function ContactForm({ prepopulatedEstimate, onClearEstimate, selectedServiceId, onClearServiceId }: ContactFormProps) {
  const { config } = useAppConfig();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('50k-100k');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Auto-fill when a specific service is selected
  useEffect(() => {
    if (selectedServiceId) {
      const targetService = config.services.find(s => s.id === selectedServiceId);
      if (targetService) {
        setMessage(`Hello! I am interested in inquiring about your "${targetService.title}" development services. Please let us know the typical kickoff timeline and resource availability.`);
      }
    }
  }, [selectedServiceId, config.services]);

  // Auto-inject prepopulated estimate description into the message field
  useEffect(() => {
    if (prepopulatedEstimate) {
      const featStr = prepopulatedEstimate.features.length > 0
        ? prepopulatedEstimate.features.join(', ')
        : 'None specified';

      const injectedText = `Please draft a customized development brief for our milestone estimate:\n` +
        `• Environment Schema: ${prepopulatedEstimate.platform}\n` +
        `• Layout Design: ${prepopulatedEstimate.design}\n` +
        `• Custom Modules: ${featStr}\n` +
        `• Estimated Duration: ${prepopulatedEstimate.timeline}\n` +
        `• Indicated Budget: $${prepopulatedEstimate.totalCost.toLocaleString()} USD`;

      setMessage(injectedText);

      // Adjust budget dropdown select to best match
      const cost = prepopulatedEstimate.totalCost;
      if (cost <= 35000) {
        setBudget('under-35k');
      } else if (cost <= 75000) {
        setBudget('35k-75k');
      } else if (cost <= 150000) {
        setBudget('75k-150k');
      } else {
        setBudget('above-150k');
      }
    }
  }, [prepopulatedEstimate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await submitProposal({
        name,
        email,
        company,
        message,
        budget,
        prepopulatedEstimate,
        selectedServiceId: selectedServiceId || undefined,
        sourceUrl: window.location.href
      });

      setIsSubmitted(true);
      const randNum = Math.floor(100000 + Math.random() * 900000);
      setBookingRef(`AWX-REQP-${randNum}`);
    } catch (error) {
      setSubmitError('Firebase database rules blocked the proposal submission. Update Realtime Database rules to allow writes to /proposals.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white text-neutral-900 border-b border-neutral-250 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="contact-form-node"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Header Box */}
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 border border-neutral-200 text-xs font-bold text-neutral-500 tracking-widest uppercase font-mono bg-white">
                  <span className="font-serif italic font-medium text-neutral-400 lowercase">09 /</span>
                  <span>{config.contactHeader.badge}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.03em] uppercase text-[#0a0a0a] font-sans">
                  {config.contactHeader.title}
                </h2>
                <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl mx-auto">
                  {config.contactHeader.description}
                </p>
              </div>

              {/* Prepopulate Notification Slate if active */}
              {prepopulatedEstimate && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-neutral-50 border border-neutral-200 p-5 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-neutral-900 text-white text-[8px] font-mono px-2.5 py-1 font-bold uppercase">
                    ESTIMATION SYNCED
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-neutral-900 rounded-none text-white">
                      <LucideIcon name="CreditCard" size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-[#0a0a0a]">Calculated Milestone Connected</h4>
                      <p className="text-[11px] text-neutral-500 font-sans mt-1">
                        {prepopulatedEstimate.platform} &bull; ${prepopulatedEstimate.totalCost.toLocaleString()} USD
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClearEstimate}
                    className="px-3.5 py-1.5 text-[10px] font-bold font-mono uppercase bg-transparent border border-neutral-300 hover:border-black rounded-none text-neutral-500 hover:text-black transition-colors cursor-pointer"
                  >
                    Clear Slate
                  </button>
                </motion.div>
              )}

              {/* Core Forms Grid */}
              <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-none p-6 sm:p-10 space-y-6 shadow-none text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-neutral-500 font-mono uppercase">
                      Contact Name <span className="text-neutral-800">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jean Dupont"
                      className="w-full bg-neutral-50 border border-neutral-250 focus:border-black focus:bg-white rounded-none px-4 py-3 text-sm text-[#0a0a0a] outline-none transition-all placeholder:text-neutral-405 font-sans"
                    />
                  </div>

                  {/* Corporate Email field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-neutral-500 font-mono uppercase">
                      Corporate Email <span className="text-neutral-800">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. jean@domain.com"
                      className="w-full bg-neutral-50 border border-neutral-250 focus:border-black focus:bg-white rounded-none px-4 py-3 text-sm text-[#0a0a0a] outline-none transition-all placeholder:text-neutral-405 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-neutral-500 font-mono uppercase">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Biotech Corp Inc."
                      className="w-full bg-neutral-50 border border-neutral-250 focus:border-black focus:bg-white rounded-none px-4 py-3 text-sm text-[#0a0a0a] outline-none transition-all placeholder:text-neutral-405 font-sans"
                    />
                  </div>

                  {/* Projected Budget tier */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold tracking-wider text-neutral-500 font-mono uppercase">
                      Projected Capital Budget
                    </label>
                    <div className="relative">
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-250 focus:border-black focus:bg-white rounded-none px-4 py-3 text-sm text-[#0a0a0a] outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="under-35k">Under $35,000 USD</option>
                        <option value="35k-75k">$35,000 - $75,000 USD</option>
                        <option value="75k-150k">$75,000 - $150,000 USD</option>
                        <option value="above-150k">Above $150,050 USD</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500">
                        <LucideIcon name="ChevronDown" size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements / Description Text Area */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold tracking-wider text-neutral-500 font-mono uppercase">
                    Requirements Summary
                  </label>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide a high-level summary of your application objectives..."
                    className="w-full bg-neutral-50 border border-neutral-250 focus:border-black focus:bg-white rounded-none px-4 py-3.5 text-xs sm:text-sm text-[#0a0a0a] outline-none transition-all placeholder:text-neutral-405 font-sans"
                  />
                </div>

                {/* Guarantee checks */}
                <div className="flex items-start space-x-3.5 text-[10px] text-neutral-500 py-1 font-mono uppercase">
                  <LucideIcon name="Shield" className="text-black mt-0.5 flex-shrink-0" size={14} />
                  <span>
                    By submitting, you initiate our mutual corporate NDA pipeline protecting all uploaded documentation. IP transfer locks securely to client.
                  </span>
                </div>

                {submitError && (
                  <p className="text-red-500 text-[10px] font-mono uppercase tracking-wider">
                    {submitError}
                  </p>
                )}

                {/* Submission core action */}
                <div className="pt-6 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-mono">* Required Inputs</span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name || !email}
                    className={`px-6 py-4 rounded-none text-xs sm:text-sm font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-850 hover:border-black transition-all flex items-center justify-center cursor-pointer border border-transparent ${
                      isSubmitting || !name || !email
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-none animate-spin mr-2" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        Request Blueprint Proposal
                        <LucideIcon name="ArrowRight" className="ml-2" size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Success Blueprint Receipt Confirmation view */
            <motion.div
              key="success-receipt-node"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-neutral-50 border border-neutral-200 rounded-none p-6 sm:p-10 text-center space-y-8 shadow-none relative overflow-hidden text-left"
            >
              <div className="text-center space-y-4 font-sans">
                <div className="mx-auto w-14 h-14 bg-[#0a0a0a] text-white rounded-none flex items-center justify-center shadow-sm">
                  <LucideIcon name="CheckCircle2" size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase text-[#0a0a0a] tracking-tight">
                    Strategy Blueprint Initiated!
                  </h3>
                  <p className="text-[10px] text-neutral-550 font-mono uppercase tracking-wider">
                    Booking Reference: <span className="text-neutral-800 font-bold select-all">{bookingRef}</span>
                  </p>
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-white border border-neutral-200 rounded-none p-5 space-y-4 text-xs font-sans">
                <div className="flex justify-between pb-3 border-b border-neutral-200 text-[9px] font-mono text-neutral-500 uppercase font-bold">
                  <span>METRIC DETAILS</span>
                  <span className="font-serif italic font-medium text-neutral-400 lowercase">status: intake queued</span>
                </div>
                
                <div className="space-y-2.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase text-[10px]">Request Sponsor:</span>
                    <span className="text-[#0a0a0a] text-right font-sans font-bold">{name} ({company || 'Independent'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase text-[10px]">Routing Email:</span>
                    <span className="text-[#0a0a0a] text-right select-all font-sans font-semibold">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase text-[10px]">Selected Budget Bracket:</span>
                    <span className="text-[#0a0a0a] text-right font-sans font-semibold">
                      {budget === 'under-35k' && 'Under $35,000 USD'}
                      {budget === '35k-75k' && '$35,000 - $75,000 USD'}
                      {budget === '75k-150k' && '$75,000 - $150,000 USD'}
                      {budget === 'above-150k' && 'Above $150,000 USD'}
                    </span>
                  </div>
                </div>

                {prepopulatedEstimate && (
                  <div className="pt-3 border-t border-neutral-200 space-y-2.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase text-[10px]">Estimated Target Base:</span>
                      <span className="text-[#0a0a0a] font-black text-right font-sans">${prepopulatedEstimate.totalCost.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500 uppercase text-[10px]">Environment Selected:</span>
                      <span className="text-neutral-600 text-right font-sans font-semibold">{prepopulatedEstimate.platform}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-none text-center space-y-1 font-sans">
                <p className="text-xs text-neutral-600">
                  Our USA-based dev lead has been pinged. We are preparing your spec assessment and custom timeline map right now.
                </p>
                <p className="text-[10px] text-neutral-450 font-mono uppercase mt-1">
                  Confirmation receipt has been queued through Firebase for {email}
                </p>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    onClearEstimate();
                    setName('');
                    setEmail('');
                    setCompany('');
                    setMessage('');
                    setBookingRef('');
                    setSubmitError('');
                  }}
                  className="px-5 py-3 rounded-none text-xs font-bold uppercase tracking-widest text-[#0a0a0a] bg-white hover:bg-neutral-50 border border-neutral-250 cursor-pointer transition-all"
                >
                  Create New Blueprint Inquiry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
