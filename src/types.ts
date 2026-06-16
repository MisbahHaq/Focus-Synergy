/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  iconName: string;
  benefits: string[];
  features: string[];
  tags: string[];
  themeColor: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  clientName: string;
  clientIndustry: string;
  description: string;
  results: string[];
  metrics: { label: string; value: string }[];
  tagline: string;
  imageUrl: string;
  accentColor: string;
}

export interface Testimonial {
  id: string;
  author: string;
  position: string;
  company: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  projectType: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface EstimateOptions {
  platforms: { id: string; label: string; price: number; icon: string }[];
  designs: { id: string; label: string; price: number; description: string }[];
  features: { id: string; label: string; price: number; description: string; icon: string }[];
  timelines: { id: string; label: string; multiplier: number; description: string }[];
}
