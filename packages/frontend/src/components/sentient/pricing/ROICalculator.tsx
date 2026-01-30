'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ROICalculatorProps {
  className?: string;
}

export default function ROICalculator({ className = '' }: ROICalculatorProps) {
  const [missedCalls, setMissedCalls] = useState(25);
  const [avgJobValue, setAvgJobValue] = useState(400);

  // Calculate values
  const monthlyLostRevenue = missedCalls * avgJobValue;
  const yearlyLostRevenue = monthlyLostRevenue * 12;
  const aiMonthlyCost = 197; // Monthly cost
  const aiSetupCost = 997; // One-time setup
  const firstYearCost = aiSetupCost + aiMonthlyCost * 12;
  const firstYearSavings = yearlyLostRevenue - firstYearCost;
  const roi = Math.round((firstYearSavings / firstYearCost) * 100);

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 ${className}`}>
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">
        Calculate Your ROI
      </h3>
      <p className="text-gray-400 text-sm text-center mb-8">
        See how much you could save by never missing a call
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Missed Calls Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Missed calls per month
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={missedCalls}
                onChange={(e) => setMissedCalls(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lime-400"
                aria-label="Number of missed calls per month"
              />
              <span className="w-16 text-center text-xl font-bold text-lime-400">
                {missedCalls}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average service business misses 20-40 calls/month
            </p>
          </div>

          {/* Average Job Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Average job value
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="100"
                max="1500"
                step="50"
                value={avgJobValue}
                onChange={(e) => setAvgJobValue(Number(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-lime-400"
                aria-label="Average value per job"
              />
              <span className="w-20 text-center text-xl font-bold text-lime-400">
                ${avgJobValue}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Plumbers: ~$400 | HVAC: ~$500 | Dental: ~$300
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <motion.div
            key={monthlyLostRevenue}
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <div className="text-sm text-red-400 mb-1">You&apos;re losing monthly</div>
            <div className="text-3xl font-bold text-red-400">
              ${monthlyLostRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {missedCalls} calls × ${avgJobValue} avg job
            </div>
          </motion.div>

          <motion.div
            key={firstYearSavings}
            initial={{ scale: 0.95, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-lime-500/10 border border-lime-500/20 rounded-xl p-4"
          >
            <div className="text-sm text-lime-400 mb-1">First year savings with AI</div>
            <div className="text-3xl font-bold text-lime-400">
              ${firstYearSavings.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              After ${firstYearCost.toLocaleString()} total cost (setup + 12 months)
            </div>
          </motion.div>

          <div className="text-center pt-2">
            <span className="text-sm text-gray-400">ROI: </span>
            <span className="text-2xl font-bold text-white">
              {roi > 0 ? '+' : ''}
              {roi}%
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href="/intake"
          className="inline-block px-8 py-4 bg-lime-400 text-black font-bold rounded-xl hover:bg-lime-300 transition-all duration-300"
        >
          Stop Losing ${monthlyLostRevenue.toLocaleString()}/month →
        </a>
      </div>
    </div>
  );
}
