/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, CheckCircle, Flame, Server, AlertCircle } from 'lucide-react';
import { Application } from '../types';

interface LiveActivityTickerProps {
  applications: Application[];
  subscribers: string[];
}

interface ActivityEvent {
  id: string;
  type: 'download' | 'signup' | 'review' | 'deploy';
  message: string;
  subMessage: string;
  timestamp: string;
  icon: React.ReactNode;
}

const COUNTRIES = [
  { name: 'United States', flag: '🇺🇸', code: 'US' },
  { name: 'Germany', flag: '🇩🇪', code: 'DE' },
  { name: 'Spain', flag: '🇪🇸', code: 'ES' },
  { name: 'Japan', flag: '🇯🇵', code: 'JP' },
  { name: 'United Kingdom', flag: '🇬🇧', code: 'UK' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
  { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
];

const MOCK_EMAILS = [
  'cyber-ops', 'digital_shadow', 'null_pointer', 'matrix_driver', 
  'binary_ghost', 'neural_nexus', 'quantum_glitch', 'stack_trace',
  'kernel_bypass', 'synapse_node', 'zero_day', 'root_shell'
];

const EMAIL_PROVIDERS = [
  'proton.me', 'rexlify.com', 'gmail.com', 'sifra.co', 'outlook.com', 'duck.com'
];

export const LiveActivityTicker: React.FC<LiveActivityTickerProps> = ({ applications, subscribers }) => {
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);

  const generateEvent = (): ActivityEvent => {
    const isSubscriber = Math.random() > 0.5;
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const id = `event-${Date.now()}`;
    
    if (isSubscriber && applications.length > 0) {
      // Generate App Download event
      const app = applications[Math.floor(Math.random() * applications.length)];
      return {
        id,
        type: 'download',
        message: `New Download Event`,
        subMessage: `User from ${country.name} ${country.flag} downloaded ${app.name} APK v${app.apkInfo.version}`,
        timestamp: 'Just now',
        icon: <Download size={14} className="text-rose-500 animate-bounce" />
      };
    } else {
      // Generate Portal Signup or Deploy status
      const roll = Math.random();
      if (roll < 0.45) {
        const emailPrefix = MOCK_EMAILS[Math.floor(Math.random() * MOCK_EMAILS.length)];
        const emailDomain = EMAIL_PROVIDERS[Math.floor(Math.random() * EMAIL_PROVIDERS.length)];
        const maskEmail = `${emailPrefix.slice(0, 3)}***@${emailDomain}`;
        return {
          id,
          type: 'signup',
          message: `Ecosystem Index Aligned`,
          subMessage: `Operator node [${maskEmail}] subscribed to daily transmissions`,
          timestamp: '3s ago',
          icon: <CheckCircle size={14} className="text-emerald-400" />
        };
      } else if (roll < 0.8) {
        return {
          id,
          type: 'deploy',
          message: `Portal Core Telemetry`,
          subMessage: `Server nodes healthy on port 3000. Static assets compiled.`,
          timestamp: '1s ago',
          icon: <Server size={14} className="text-cyan-400" />
        };
      } else {
        const hotApps = applications.filter(a => a.featured);
        const name = hotApps.length > 0 ? hotApps[Math.floor(Math.random() * hotApps.length)].name : "Chrono-Matrix";
        return {
          id,
          type: 'review',
          message: `Rating Matrix Synced`,
          subMessage: `An anonymous inspector verified ${name} with a 5-star clearance`,
          timestamp: 'Just now',
          icon: <Flame size={14} className="text-amber-500 animate-pulse" />
        };
      }
    }
  };

  useEffect(() => {
    // Show first event after 4 seconds
    const initialDelay = setTimeout(() => {
      setCurrentEvent(generateEvent());
    }, 4000);

    const interval = setInterval(() => {
      // Fade out current one or clear it
      setCurrentEvent(null);
      // Wait slightly and load a new random event
      setTimeout(() => {
        setCurrentEvent(generateEvent());
      }, 800);
    }, 14000); // Trigger every 14 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [applications]);

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-none max-w-sm w-[calc(100vw-32px)] md:w-80">
      <AnimatePresence mode="wait">
        {currentEvent && (
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-[#07080d]/90 backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-[#be123c]/20"
          >
            {/* Subtle glow edge bar */}
            <span className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-rose-600 to-amber-500" />

            <div className="p-2 rounded-lg bg-white/5 shrink-0">
              {currentEvent.icon}
            </div>

            <div className="space-y-1 text-left flex-grow">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white text-xs font-bold leading-none">
                  {currentEvent.message}
                </span>
                <span className="font-mono text-[8px] text-gray-500 uppercase leading-none">
                  {currentEvent.timestamp}
                </span>
              </div>
              <p className="text-gray-400 text-[10px] sm:text-xxs font-light leading-relaxed">
                {currentEvent.subMessage}
              </p>
            </div>

            {/* Cancel trigger */}
            <button
              onClick={() => setCurrentEvent(null)}
              className="p-0.5 rounded text-gray-600 hover:text-white hover:bg-white/5 transition-all cursor-pointer inline-flex items-center justify-center shrink-0"
              title="Acknowledge event"
            >
              <span className="text-[10px] leading-none block">&times;</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
