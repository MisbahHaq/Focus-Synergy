/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Smartphone,
  Gamepad2,
  Brain,
  Sparkles,
  Globe,
  Share2,
  UserCheck,
  CreditCard,
  MessageSquare,
  WifiOff,
  Star,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  PhoneCall,
  Settings,
  ChevronDown,
  Clock,
  Shield,
  HelpCircle,
  TrendingUp,
  Award,
  Layers,
  Sparkle
} from 'lucide-react';

const iconsMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Smartphone,
  Gamepad2,
  Brain,
  Sparkles,
  Globe,
  Share2,
  UserCheck,
  CreditCard,
  MessageSquare,
  WifiOff,
  Star,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  PhoneCall,
  Settings,
  ChevronDown,
  Clock,
  Shield,
  HelpCircle,
  TrendingUp,
  Award,
  Layers,
  Sparkle
};

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className, size }: LucideIconProps) {
  const IconComponent = iconsMap[name];
  if (!IconComponent) {
    // Fallback icon
    return <Settings className={className} size={size} />;
  }
  return <IconComponent className={className} size={size} />;
}
