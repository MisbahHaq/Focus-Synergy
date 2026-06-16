/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, CaseStudy, Testimonial, FAQItem, EstimateOptions } from './types';

export const SERVICES_DATA: Service[] = [
  {
    id: 'mobile-dev',
    title: 'Mobile App Development',
    description: 'Bespoke native and cross-platform mobile apps structured for extreme performance, offline capability, and high engagement on iOS and Android.',
    longDescription: 'At AppWave, we engineered mobile apps that scaled to millions of downloads. From custom CoreAnimation layouts and reactive Swift architecture to high-octane Android Kotlin pipelines, we specialize in building experiences that users fall in love with. We also utilize React Native and Flutter to deliver premium single-codebase builds with native feel.',
    iconName: 'Smartphone',
    benefits: [
      'Native Swift/Kotlin & React Native/Flutter experts',
      'Offline-first synchronization architectures',
      'App Store Optimization (ASO) and submission guidance',
      'Biometric authentication and secure local storage configuration'
    ],
    features: ['Push Notification Engine', 'Background Sync', 'Custom Core UI', 'Payment Gateways'],
    tags: ['iOS', 'Android', 'React Native', 'Kotlin', 'Swift'],
    themeColor: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'game-dev',
    title: 'Game Development',
    description: 'Immersive, engaging 2D and 3D games built for mobile, web, and consoles, complete with multiplayer sync, game economics, and stunning art direction.',
    longDescription: 'We translate interactive visions into commercial game sensations. Our gaming studio offers full-cycle development utilizing Unity, Unreal Engine, and WebGL. Whether you are building an AR adventure, a real-time multiplayer card battler, or a competitive web game, we craft the asset pipelines, Physics controllers, and matchmakers.',
    iconName: 'Gamepad2',
    benefits: [
      'High-performance 3D character design and asset rigging',
      'Sub-millisecond matchmaking and server synchronization',
      'Realistic physics engines & customized game loops',
      'Frictionless custom monetization and reward mechanics'
    ],
    features: ['Matchmaking Engine', 'Custom 3D Art Asset Pipelines', 'Real-time WebSockets', 'Cross-play Physics'],
    tags: ['Unity', 'Unreal Engine', 'WebGL', 'C#', 'C++'],
    themeColor: 'from-amber-500 to-rose-600'
  },
  {
    id: 'artificial-intelligence',
    title: 'Artificial Intelligence',
    description: 'Incorporate production-ready machine learning models, custom Large Language Models, and intelligent search into your business workflows.',
    longDescription: 'Go beyond the hype and integrate commercial-grade AI into your digital ecosystems. We build custom intelligence layers, including vector database embeddings, local model hosting, semantic enterprise search, predictive user diagnostics, and automated workflows optimized to save thousands of labor hours.',
    iconName: 'Brain',
    benefits: [
      'State-of-the-art LLM fine-tuning and prompting strategies',
      'Retrieval-Augmented Generation (RAG) using vector databases',
      'High-throughput predictive analytics systems',
      'Completely private model deployments securing sensitive client data'
    ],
    features: ['RAG Architectures', 'Predictive User Intent Models', 'Private LLM Pipelines', 'Data Classification'],
    tags: ['Python', 'Gemini API', 'PyTorch', 'Qdrant', 'OpenAI'],
    themeColor: 'from-indigo-500 to-violet-600'
  },
  {
    id: 'ar-vr',
    title: 'Augmented & Virtual Reality',
    description: 'Cutting-edge spatial installations, interactive AR shopping engines, and high-fidelity VR simulation suites for real-world operations.',
    longDescription: 'As virtual frontiers expand, we build spatial software that maps digital interactives onto real-world coordinates. Using Apple Vision Pro, Meta Quest, ARKit, and ARCore, we build surgical simulations, virtual architectural walkthroughs, and spatial commerce platforms that bring high-tech products into active sight.',
    iconName: 'Sparkles',
    benefits: [
      'Cross-platform ARCore (Android) & ARKit (iOS) compatibility',
      'Meta Quest & Apple VisionOS native spatial architectures',
      'Precision CAD model optimization for mobile WebGL viewing',
      'Interactive spatial gestures & low-latency canvas renderings'
    ],
    features: ['Spatial UI Design', '3D Scene Mapping', 'Hand Tracking Gestures', 'Holographic Overlays'],
    tags: ['VisionOS', 'ARKit', 'ARCore', 'Meta SDK', 'Three.js'],
    themeColor: 'from-pink-500 to-purple-600'
  },
  {
    id: 'web-dev',
    title: 'High-Performance Web & SaaS',
    description: 'Modern full-stack web platforms and SaaS portals built on lightning-fast frameworks, securing performance, scalability, and airtight code.',
    longDescription: 'Your web application is the core of your product offering. Our web architecture team builds resilient, high-traffic SaaS systems and enterprise portals using React, Next.js, and Node.js. Every build features modern state management, microservice architectures, and robust security safeguards to ensure absolute durability.',
    iconName: 'Globe',
    benefits: [
      'SEO-fluid pages with sub-second page loading speeds',
      'Airtight security standards preserving database safety',
      'Elastic cloud setups adjusting to peak traffic surges',
      'Intuitive design and detailed customer analytic portals'
    ],
    features: ['Multi-tenant SaaS Architecture', 'Real-time Analytical Panels', 'API Gateway Structures', 'OAuth & Role Security'],
    tags: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS'],
    themeColor: 'from-emerald-500 to-teal-600'
  }
];

export const CASE_STUDIES_DATA: CaseStudy[] = [
  {
    id: 'healthtrack-ai',
    title: 'HealthTrack: Rebuilding Offline-First Medical Tracking',
    category: 'Mobile & AI App',
    clientName: 'HealthTrack Corp',
    clientIndustry: 'Digital Medicine',
    description: 'How we upgraded a lagging legacy healthcare app into a fluid, offline-first mobile product with local encryption, voice-transcribed medical entries, and smart patient telemetry.',
    tagline: 'Empowering patient wellness through zero-lag interface architectures.',
    results: [
      'Ranked #6 in the App Store Health & Fitness Index within 30 days of launch.',
      'Offline-first data replication model reduced sync errors by 94.2%.',
      'Speech-to-text integration shaved 3 minutes off typical daily diagnostic tracking workflows.',
      'Secured $14M Series-A Funding fueled by user retention and visual polish.'
    ],
    metrics: [
      { label: 'User Rating', value: '4.8⭐' },
      { label: 'Sync Errors', value: '-94%' },
      { label: 'Weekly Active Users', value: '180K+' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    accentColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
  },
  {
    id: 'neorealm-3d',
    title: 'NeoRealm: Multi-Platform Action RPG',
    category: 'Game Development',
    clientName: 'Studio Eclipse Game Co.',
    clientIndustry: 'Interactive Entertainment',
    description: 'We engineered the procedural asset streaming pipelines, custom WebSockets matchmaking, and real-time physics nodes to launch a beautiful 3D multiplayer social action realm.',
    tagline: 'Pushing procedural graphics limits for multi-platform web & mobile gameplay.',
    results: [
      'Generated $4.2M in pre-sale virtual asset registrations during beta tests.',
      'Optimized WebGL Web Assembly builds sustaining 60fps across legacy smartphones.',
      'Matchmaker systems resolved team lobbies in under 800ms globally.',
      'Featured as "Game of the Day" on the Google Play home dashboard.'
    ],
    metrics: [
      { label: 'Active Lobbies', value: '50K+' },
      { label: 'Average Frame Rate', value: '60 FPS' },
      { label: 'Beta Retention rate', value: '72%' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    accentColor: 'text-amber-400 bg-amber-950/40 border-amber-800'
  },
  {
    id: 'aurabi-analytics',
    title: 'AuraBI: Predictive Sales Engine',
    category: 'AI & Enterprise SaaS',
    clientName: 'Aura Logistics Inc.',
    clientIndustry: 'Supply Chain & Retail',
    description: 'Integrated a deep learning business agent processing thousands of shipping records to predict regional inventory shortages 72 hours before retail peaks.',
    tagline: 'Translating legacy database logs into proactive inventory control paths.',
    results: [
      'Eliminated inventory shortages across 12 midwest shipping warehouses.',
      'Over $3.1M saved in expedited shipping tolls over the first quarter.',
      'Engineered a dashboard loading 10 million transactions in 400ms.',
      'Acquired by international supply conglomerate for $42M.'
    ],
    metrics: [
      { label: 'Shortage Reductions', value: '88%' },
      { label: 'Processing Speed', value: '0.4s' },
      { label: 'Quarterly Savings', value: '$3.1M' }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    accentColor: 'text-violet-400 bg-violet-950/40 border-violet-800'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Sarah Jenkins',
    position: 'VP of Product',
    company: 'HealthTrack Corp',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'AppWave is the rarest model of agency partner. Because of their "one project at a time" policy, we felt like they were our in-house team. The engineering quality is peerless.',
    rating: 5,
    projectType: 'Mobile App Architecture'
  },
  {
    id: 'test-2',
    author: 'Dimitri Vance',
    position: 'Founder & CEO',
    company: 'Studio Eclipse Games',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'Other dev shops shied away from our WebGL rendering targets. AppWave tackled the physics pipelines head-on, delivering 60 FPS on low-end devices. Our launch was a stellar triumph.',
    rating: 5,
    projectType: '3D Game Engineering'
  },
  {
    id: 'test-3',
    author: 'Elena Rostova',
    position: 'Chief Information Officer',
    company: 'Aura Logistics Inc.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    quote: 'Integrating predictive AI into our operations was intimidating. AppWave simplified the entire roadmap. We got a custom RAG solution keeping all data local and highly secure.',
    rating: 5,
    projectType: 'Enterprise Predictive AI'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How does your "One Project at a Time" promise work?',
    answer: 'Unlike typical development agencies that stretch resources across 10+ client queues simultaneously, AppWave allocates dedicated engineering teams to individual customer scopes. When your project kicks off, our focus is laser-targeted on your codebase. This drives cleaner architecture, faster delivery, and total alignment.',
    category: 'Process'
  },
  {
    id: 'faq-2',
    question: 'Who owns the final application intellectual property (IP)?',
    answer: 'You do. Always. We sign a clear, absolute intellectual property rights transfer. Every line of custom code, custom graphics, database schema model, and architectural asset created belongs entirely to your business from day one.',
    category: 'Legal'
  },
  {
    id: 'faq-3',
    question: 'Are all of your software engineers based in the USA?',
    answer: 'Yes! Our entire product core, lead developers, QA testers, and creative UI designers operate directly out of our USA-based offices. This ensures real-time communication, regular daily standups, and high standards of security controls.',
    category: 'Team'
  },
  {
    id: 'faq-4',
    question: 'What is your technology stack capability?',
    answer: 'For mobile products, we write native iOS (Swift) and Android (Kotlin) as well as cross-platform React Native and Flutter. In client web & backend servers, we work with Node.js, Next.js, Express, and Python. For games and 3D scenes, we use Unity, Unreal Engine, WebGL, and Three.js. Our AI builds utilize the Google GenAI SDK, PyTorch, and Vector Stores.',
    category: 'Technology'
  },
  {
    id: 'faq-5',
    question: 'Do you offer ongoing service support after application launch?',
    answer: 'Absolutely. We do not just build and vanish. We offer formal post-launch maintenance, OS upgrades, database diagnostics support, security patching, and scaling support, ensuring your product remains robust and secure long after launch.',
    category: 'Process'
  }
];

export const ESTIMATE_OPTIONS: EstimateOptions = {
  platforms: [
    { id: 'ios-native', label: 'iOS App (Native Swift)', price: 30000, icon: 'Smartphone' },
    { id: 'android-native', label: 'Android App (Native Kotlin)', price: 30000, icon: 'Smartphone' },
    { id: 'cross-platform', label: 'Cross-Platform (React Native/Flutter)', price: 42000, icon: 'Share2' },
    { id: 'web-saas', label: 'Web Platform / SaaS', price: 28000, icon: 'Globe' },
    { id: 'game-3d', label: '3D/2D Game (Unity/WebGL)', price: 45000, icon: 'Gamepad2' }
  ],
  designs: [
    { id: 'clean-functional', label: 'Clean & Standard UI', price: 5000, description: 'Sleek, typography-focused layouts using beautiful pre-styled utility cards.' },
    { id: 'custom-branding', label: 'Bespoke Custom Branding', price: 12000, description: 'Fully tailored design system, custom illustrations, responsive animation flows.' },
    { id: 'premium-spatial', label: 'High-End Spatial & 3D Web UI', price: 22000, description: 'Top-tier interaction design, micro-interactions, custom interactive 3D WebGL accents, ultra-premium look.' }
  ],
  features: [
    { id: 'auth-user', label: 'Secure User Accounts & Profiles', price: 6000, description: 'Biometrics, passkeys, multi-tenant workspace, social login.', icon: 'UserCheck' },
    { id: 'payment-stripe', label: 'Subscription & payment (Stripe)', price: 4500, description: 'Subscriptions, invoice receipt tracking, global credit cards.', icon: 'CreditCard' },
    { id: 'ai-gen', label: 'AI Generative Smart Agent', price: 15000, description: 'Custom LLM integration, user-facing AI chatbots, smart categorization, RAG pipeline.', icon: 'Brain' },
    { id: 'realtime-chat', label: 'Real-time Chat & Collaboration', price: 8000, description: 'Instant messaging threads, WebSockets, collaborative status indicators.', icon: 'MessageSquare' },
    { id: 'offline-sync', label: 'Robust Offline mode & Sync', price: 10000, description: 'Local database storage with cloud synchronization queues.', icon: 'WifiOff' },
    { id: 'ar-shopping', label: 'Spatial AR Viewer Integration', price: 12000, description: 'Interactive augmented-reality 3D models viewing for mobile browsers.', icon: 'Sparkles' }
  ],
  timelines: [
    { id: 'standard', label: 'Standard Delivery (3-4 Months)', multiplier: 1.0, description: 'Fully structured agile sprints, weekly reviews.' },
    { id: 'expedited', label: 'Expedited Track (1.5-2 Months)', multiplier: 1.4, description: 'Double dedicated developer squads, prioritized backlog.' },
    { id: 'flexible', label: 'Milestone Pace (6 Months)', multiplier: 0.9, description: 'Highly cost-effective milestones, extended testing periods.' }
  ]
};
