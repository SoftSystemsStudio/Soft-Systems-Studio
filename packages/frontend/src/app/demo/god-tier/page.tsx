'use client';

/**
 * God Tier Demo Page - Clean, Working Version
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Simple animated gradient background (no WebGL)
function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(192, 255, 107, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
        }}
      />
      {/* Animated grain overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}

// Magnetic button effect (pure CSS/JS, no external deps)
function MagneticButton({ children, onClick, className = '' }: { 
  children: React.ReactNode; 
  onClick?: () => void;
  className?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={`relative ${className}`}
    >
      {children}
    </motion.button>
  );
}

// Animated counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayed.toLocaleString()}{suffix}</span>;
}

// Feature card with hover effect
function FeatureCard({ icon, title, description, delay = 0 }: {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm hover:border-[#c0ff6b]/50 transition-colors"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#c0ff6b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
}

// ROI Calculator - simple version
function SimpleROICalculator() {
  const [employees, setEmployees] = useState(5);
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const hourlyRate = 50;
  
  const annualSavings = employees * hoursPerWeek * hourlyRate * 52;
  const automationCost = 8000;
  const roi = ((annualSavings - automationCost) / automationCost) * 100;

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
      <h3 className="text-2xl font-bold mb-6 text-white">ROI Calculator</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Employees affected: {employees}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={employees}
            onChange={(e) => setEmployees(Number(e.target.value))}
            className="w-full accent-[#c0ff6b]"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Hours saved per week per employee: {hoursPerWeek}
          </label>
          <input
            type="range"
            min="1"
            max="40"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="w-full accent-[#c0ff6b]"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-black/50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#c0ff6b]">
            ${annualSavings.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Annual Savings</div>
        </div>
        <div className="bg-black/50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-[#c0ff6b]">
            {roi.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">First Year ROI</div>
        </div>
      </div>
    </div>
  );
}

// Main page component
export default function GodTierDemo() {
  const features = [
    { icon: '🎙️', title: 'AI Voice Reception', description: 'Never miss a call. AI answers 24/7, books appointments, answers FAQs.' },
    { icon: '💬', title: 'Smart Chatbot', description: 'Intelligent chat that learns your business and converts visitors to leads.' },
    { icon: '⚡', title: 'Workflow Automation', description: 'Connect your tools. Automate repetitive tasks. Save 10+ hours weekly.' },
    { icon: '📊', title: 'Live Analytics', description: 'Real-time dashboards showing exactly how AI is impacting your business.' },
    { icon: '🔗', title: 'Deep Integrations', description: 'Connects with your CRM, calendar, email, and 100+ other tools.' },
    { icon: '🛡️', title: 'Enterprise Security', description: 'SOC 2 compliant. Your data is encrypted and never used for training.' },
  ];

  const stats = [
    { value: 10000, suffix: '+', label: 'Calls Handled' },
    { value: 95, suffix: '%', label: 'Satisfaction' },
    { value: 40, suffix: '%', label: 'Cost Reduction' },
    { value: 24, suffix: '/7', label: 'Availability' },
  ];

  return (
    <div className="min-h-screen text-white">
      <GradientBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-md bg-black/30 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#c0ff6b] font-mono font-bold text-lg hover:opacity-80 transition-opacity">
            ← SOFT SYSTEMS
          </Link>
          <MagneticButton 
            className="bg-[#c0ff6b] text-black px-6 py-2 rounded-full font-semibold hover:bg-[#d4ff8f] transition-colors"
            onClick={() => window.open('/intake', '_self')}
          >
            Get Started
          </MagneticButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 bg-[#c0ff6b]/10 border border-[#c0ff6b]/30 rounded-full text-[#c0ff6b] text-sm font-mono mb-6">
              ✨ GOD TIER DEMO
            </span>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              <span className="text-white">AI That</span>
              <br />
              <span className="text-[#c0ff6b]">Works For You</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Voice AI, chatbots, and automation that actually understand your business. 
              No templates. No limitations. Just results.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton 
                className="bg-[#c0ff6b] text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-[#d4ff8f] transition-colors"
                onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Calculate Your ROI
              </MagneticButton>
              <MagneticButton 
                className="border border-gray-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:border-[#c0ff6b] transition-colors"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See Features
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-[#c0ff6b] mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-400 text-lg">
              Enterprise-grade AI, small business pricing
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section id="calculator" className="py-20 px-6 bg-black/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See Your <span className="text-[#c0ff6b]">Savings</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Calculate the real impact of AI automation on your business
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SimpleROICalculator />
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join 50+ businesses already saving time and money with our AI solutions. 
              30-day money-back guarantee.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton 
                className="bg-[#c0ff6b] text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-[#d4ff8f] transition-colors"
                onClick={() => window.open('/intake', '_self')}
              >
                Start Free Consultation
              </MagneticButton>
            </div>

            <p className="text-gray-600 text-sm mt-6">
              No credit card required • Free discovery call • Custom proposal in 48hrs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <span>© 2026 Soft Systems Studio LLC</span>
          <Link href="/" className="hover:text-[#c0ff6b] transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
