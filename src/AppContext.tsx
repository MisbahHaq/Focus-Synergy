/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Service, CaseStudy, Testimonial, FAQItem, EstimateOptions } from './types';
import { SERVICES_DATA, CASE_STUDIES_DATA, TESTIMONIALS_DATA, FAQ_DATA, ESTIMATE_OPTIONS } from './data';

// Types for customizable items
export interface ProcessStep {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  deliverables: string[];
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface AppConfig {
  hero: {
    badgeText: string;
    titleLine1: string;
    titleLine2: string;
    italicQuote: string;
    description: string;
    cta1Text: string;
    cta2Text: string;
    proofs: { letter: string; text: string }[];
  };
  statsHeader: {
    badge: string;
    title: string;
    description: string;
  };
  stats: StatItem[];
  servicesHeader: {
    badge: string;
    title: string;
    description: string;
  };
  services: Service[];
  processHeader: {
    badge: string;
    title: string;
    description: string;
  };
  processSteps: ProcessStep[];
  caseStudiesHeader: {
    badge: string;
    title: string;
    description: string;
  };
  caseStudies: CaseStudy[];
  estimatorHeader: {
    badge: string;
    title: string;
    description: string;
  };
  estimateOptions: EstimateOptions;
  testimonialsHeader: {
    badge: string;
    title: string;
    description: string;
  };
  testimonials: Testimonial[];
  faqHeader: {
    badge: string;
    title: string;
    description: string;
  };
  faqs: FAQItem[];
  contactHeader: {
    badge: string;
    title: string;
    description: string;
  };
}

const DEFAULT_CONFIG: AppConfig = {
  hero: {
    badgeText: 'USA-Based Development Squad',
    titleLine1: 'SOFTWARE',
    titleLine2: 'DEVELOPMENT',
    italicQuote: 'built for real growth.',
    description: 'AppWave engineers digital solutions. We specialize in custom mobile apps, immersive Game dev, production-ready AI layers, and spatial AR interfaces. Scaled to perfection — one project at a time.',
    cta1Text: 'Estimate Project Cost',
    cta2Text: 'View Case Studies',
    proofs: [
      { letter: 'a', text: '100% IP Handoff' },
      { letter: 'b', text: 'USA-Based Squads' },
      { letter: 'c', text: 'Incremental Sprints' }
    ]
  },
  statsHeader: {
    badge: 'Our Track Record',
    title: 'STRETCHED TO MAX SCALE',
    description: 'We don’t just write software. We construct high-impact digital ventures that disrupt industries, engage millions, and drive significant capital returns for our corporate partners.'
  },
  stats: [
    {
      id: 'stat-years',
      value: '10+',
      label: 'Years of Excellence',
      description: 'Pristine codes built under Silicon Valley guidelines.',
      icon: 'Award',
      color: 'text-cyan-400'
    },
    {
      id: 'stat-projects',
      value: '1100+',
      label: 'Completed Projects',
      description: 'Flawless deployments across iOS, Android, and Web clouds.',
      icon: 'CheckCircle2',
      color: 'text-indigo-400'
    },
    {
      id: 'stat-downloads',
      value: '1.5M+',
      label: 'Active Users',
      description: 'Millions interacting with our software products daily.',
      icon: 'Smartphone',
      color: 'text-pink-400'
    },
    {
      id: 'stat-revenue',
      value: '$160M+',
      label: 'Revenue For Clients',
      description: 'Capital raised & commercial sales fueled by our builds.',
      icon: 'TrendingUp',
      color: 'text-emerald-400'
    }
  ],
  servicesHeader: {
    badge: 'Engineering Specialties',
    title: 'OPERATIONAL SPECTRUMS',
    description: 'Our unified team deploys top-tier engineering across critical technical boundaries. We combine rapid iteration style with rigorous code standards as a solid foundation.'
  },
  services: SERVICES_DATA,
  processHeader: {
    badge: 'Our Sprints Process',
    title: 'ONE SPRINT AT A TIME',
    description: 'We adhere to a strict linear execution model. By dedicating undivided attention to your active milestone, we eradicate project scope creep and ensure pristine software.'
  },
  processSteps: [
    {
      number: '01',
      title: 'Strategy & Discovery',
      subtitle: 'Mapping real, quantifiable commercial objectives.',
      description: 'Before coding any files, we map user personas, security constraints, and competitive landscapes. We refine your functional specification documents to eliminate architectural overhead, ensuring a clean, lean milestone setup.',
      icon: 'Award',
      deliverables: ['Detailed Product Discovery Brief', 'Interactive User Flow Diagrams', 'Airtight Milestone Budget Plan']
    },
    {
      number: '02',
      title: 'High-Fidelity UI/UX Design',
      subtitle: 'Distinctive visual identities, built without templates.',
      description: 'We construct custom layout designs, interactive clickable Figma prototypes, and advanced typography pairing schemes. Every touch gesture is optimized for micro-animations and accessibility compliance.',
      icon: 'Layers',
      deliverables: ['Clickable High-Fidelity Figma Prototypes', 'Custom Custom Tailored Grid Layouts', 'Responsive UI Kit Assets Handoff']
    },
    {
      number: '03',
      title: 'Agile Coding & Quality Sprints',
      subtitle: 'Silicon Valley engineering with daily build updates.',
      description: 'Your codebase comes to life matching our rigorous standards. We work in twin-sprint intervals, pushing actual functional branches to test sandboxes so you watch real progress in action.',
      icon: 'Settings',
      deliverables: ['Fully Documented Git Codebase', 'Weekly Live Review Sandboxes', 'Integrated CI/CD Test Pipelines']
    },
    {
      number: '04',
      title: 'Flawless QA & Secure Launch',
      subtitle: 'Zero crash metrics, premium hosting deployment.',
      description: 'We run intensive stress-tests and end-to-end user mocks. Once approved, we config App Store SEO optimization templates, and deploy to lightning-fast, sandboxed cloud servers.',
      icon: 'Shield',
      deliverables: ['App Store & Play Store Submissions', 'Comprehensive Security Audit Sheet', 'Server Hosting Provisioning & Launch']
    }
  ],
  caseStudiesHeader: {
    badge: 'Product Successes',
    title: 'ACTUAL PRODUCTION BUILDS',
    description: 'Explore live, robust high-traffic environments engineered by AppWave. We hand over flawless digital platforms that fuel real-world growth.'
  },
  caseStudies: CASE_STUDIES_DATA,
  estimatorHeader: {
    badge: 'Live Budget Modeling',
    title: 'ESTIMATE YOUR BUDGET INSTANTLY',
    description: 'Toggle deployment platforms, visual aesthetics levels, and core features. Our real-time agile formula outputs raw development capital parameters instantly.'
  },
  estimateOptions: ESTIMATE_OPTIONS,
  testimonialsHeader: {
    badge: 'Client Endorsements',
    title: 'PARTNER ENDORSEMENTS',
    description: 'Review actual quotes from technical founders, CIOs, and VP of Products who launched high-traffic digital environments with AppWave.'
  },
  testimonials: TESTIMONIALS_DATA,
  faqHeader: {
    badge: 'Any Questions?',
    title: 'FREQUENT INQUIRIES',
    description: 'Have questions about intellectual property, team localization, or support contracts? Review our quick answers below.'
  },
  faqs: FAQ_DATA,
  contactHeader: {
    badge: 'Proposal Intake',
    title: 'BRING YOUR APP STRATEGY TO LIFE',
    description: 'Submit your specification goals. Our development lead will assess resource feasibility and return an itemized blueprint proposal within 24 working hours.'
  }
};

interface AppContextType {
  config: AppConfig;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  updateConfig: (updater: (prev: AppConfig) => AppConfig) => void;
  resetConfig: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('appwave_cms_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read existing config from localStorage', e);
    }
    return DEFAULT_CONFIG;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('appwave_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('appwave_admin_logged_in', String(isAdmin));
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin]);

  const updateConfig = (updater: (prev: AppConfig) => AppConfig) => {
    setConfig((prev) => {
      const newConfig = updater(prev);
      try {
        localStorage.setItem('appwave_cms_config', JSON.stringify(newConfig));
      } catch (e) {
        console.error('Could not write config to localStorage', e);
      }
      return newConfig;
    });
  };

  const resetConfig = () => {
    if (window.confirm('Are you absolutely sure you want to restore all page content and pricing back to initial defaults? This will erase all custom dashboard settings.')) {
      setConfig(DEFAULT_CONFIG);
      try {
        localStorage.setItem('appwave_cms_config', JSON.stringify(DEFAULT_CONFIG));
      } catch (e) {
        console.error('Could not reset config in localStorage', e);
      }
    }
  };

  return (
    <AppContext.Provider value={{ config, isAdmin, setIsAdmin, updateConfig, resetConfig }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
}
