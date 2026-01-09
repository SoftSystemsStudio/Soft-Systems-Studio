import React, { useState } from 'react';
import { Button, HoloCard, ScanLine } from '../ui';
import { FadeIn } from '../motion';

interface FormData {
  projectType: 'website' | 'ai-automation' | 'both' | '';
  timeline: 'urgent' | 'normal' | 'flexible' | '';
  features: string[];
  budget: 'under-5k' | '5k-10k' | '10k-20k' | 'over-20k' | '';
  email: string;
}

interface EstimateResult {
  projectType: string;
  estimatedCost: string;
  timeline: string;
  keyFeatures: string[];
  nextSteps: string[];
}

export function ProjectEstimator() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    projectType: '',
    timeline: '',
    features: [],
    budget: '',
    email: '',
  });
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const generateEstimate = async () => {
    setLoading(true);

    // Simulate AI processing (in real implementation, call your API with Claude)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate estimate based on selections
    const baseEstimate = {
      website: { min: 3500, max: 8000, weeks: '3-6' },
      'ai-automation': { min: 5000, max: 12000, weeks: '4-8' },
      both: { min: 8000, max: 18000, weeks: '6-10' },
    }[formData.projectType || 'website'];

    const featureMultiplier = 1 + formData.features.length * 0.1;
    const estimatedMin = Math.round(baseEstimate.min * featureMultiplier);
    const estimatedMax = Math.round(baseEstimate.max * featureMultiplier);

    setEstimate({
      projectType:
        formData.projectType === 'both'
          ? 'Website + AI Automation'
          : formData.projectType === 'ai-automation'
            ? 'AI Automation'
            : 'Website Design',
      estimatedCost: `$${estimatedMin.toLocaleString()} - $${estimatedMax.toLocaleString()}`,
      timeline: baseEstimate.weeks + ' weeks',
      keyFeatures:
        formData.features.length > 0
          ? formData.features
          : ['Custom design', 'Mobile responsive', 'SEO optimized'],
      nextSteps: [
        'Schedule a free discovery call',
        'Receive detailed proposal with timeline',
        'Begin development within 1 week',
      ],
    });

    setLoading(false);
    setStep(5);
  };

  const resetEstimator = () => {
    setStep(1);
    setFormData({
      projectType: '',
      timeline: '',
      features: [],
      budget: '',
      email: '',
    });
    setEstimate(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <HoloCard className="p-8" glowColor="lime" showScanLine>
        {step < 5 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Step {step} of 4</h3>
              <span className="text-brand-gray text-sm">
                {Math.round((step / 4) * 100)}% complete
              </span>
            </div>
            <div className="h-2 bg-brand-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-lime to-cyan-400 transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Project Type */}
        {step === 1 && (
          <FadeIn>
            <h3 className="text-2xl font-bold text-white mb-4">What do you need?</h3>
            <p className="text-brand-gray mb-6">Select the type of project you're looking for</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { value: 'website', label: 'Website Design', desc: 'Modern, responsive website' },
                  {
                    value: 'ai-automation',
                    label: 'AI Automation',
                    desc: 'Intelligent automation systems',
                  },
                  { value: 'both', label: 'Complete Solution', desc: 'Website + AI automation' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateFormData('projectType', option.value);
                    setStep(2);
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    formData.projectType === option.value
                      ? 'border-brand-lime bg-brand-lime/10'
                      : 'border-brand-lime/20 hover:border-brand-lime/40 hover:bg-brand-lime/5'
                  }`}
                >
                  <div className="text-white font-semibold mb-2">{option.label}</div>
                  <div className="text-brand-gray text-sm">{option.desc}</div>
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Step 2: Timeline */}
        {step === 2 && (
          <FadeIn>
            <h3 className="text-2xl font-bold text-white mb-4">What's your timeline?</h3>
            <p className="text-brand-gray mb-6">When do you need this completed?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { value: 'urgent', label: 'ASAP', desc: 'Need it as soon as possible' },
                  { value: 'normal', label: '4-8 weeks', desc: 'Standard timeline' },
                  { value: 'flexible', label: 'Flexible', desc: 'No rush, when ready' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateFormData('timeline', option.value);
                    setStep(3);
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    formData.timeline === option.value
                      ? 'border-brand-lime bg-brand-lime/10'
                      : 'border-brand-lime/20 hover:border-brand-lime/40 hover:bg-brand-lime/5'
                  }`}
                >
                  <div className="text-white font-semibold mb-2">{option.label}</div>
                  <div className="text-brand-gray text-sm">{option.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-6 text-brand-gray hover:text-brand-lime transition-colors"
            >
              ← Back
            </button>
          </FadeIn>
        )}

        {/* Step 3: Features */}
        {step === 3 && (
          <FadeIn>
            <h3 className="text-2xl font-bold text-white mb-4">What features do you need?</h3>
            <p className="text-brand-gray mb-6">Select all that apply (optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.projectType === 'website' || formData.projectType === 'both'
                ? [
                    'E-commerce functionality',
                    'Content management system',
                    'User authentication',
                    'Payment processing',
                    'Custom animations',
                    'Multi-language support',
                  ].map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.features.includes(feature)
                          ? 'border-brand-lime bg-brand-lime/10'
                          : 'border-brand-lime/20 hover:border-brand-lime/40 hover:bg-brand-lime/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">{feature}</span>
                        {formData.features.includes(feature) && (
                          <span className="text-brand-lime">✓</span>
                        )}
                      </div>
                    </button>
                  ))
                : [
                    'AI voice reception',
                    'Chat support automation',
                    'Email automation',
                    'CRM integration',
                    'Calendar integration',
                    'Custom workflow automation',
                  ].map((feature) => (
                    <button
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.features.includes(feature)
                          ? 'border-brand-lime bg-brand-lime/10'
                          : 'border-brand-lime/20 hover:border-brand-lime/40 hover:bg-brand-lime/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">{feature}</span>
                        {formData.features.includes(feature) && (
                          <span className="text-brand-lime">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="text-brand-gray hover:text-brand-lime transition-colors"
              >
                ← Back
              </button>
              <Button variant="primary" onClick={() => setStep(4)}>
                Continue
              </Button>
            </div>
          </FadeIn>
        )}

        {/* Step 4: Contact Info */}
        {step === 4 && (
          <FadeIn>
            <h3 className="text-2xl font-bold text-white mb-4">Get your custom estimate</h3>
            <p className="text-brand-gray mb-6">Where should we send your estimate?</p>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full p-4 rounded-lg bg-brand-dark border-2 border-brand-lime/20 text-white placeholder-brand-gray focus:border-brand-lime focus:outline-none transition-colors mb-6"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep(3)}
                className="text-brand-gray hover:text-brand-lime transition-colors"
              >
                ← Back
              </button>
              <Button
                variant="primary"
                onClick={() => void generateEstimate()}
                disabled={!formData.email || loading}
              >
                {loading ? 'Generating estimate...' : 'Get My Estimate'}
              </Button>
            </div>
          </FadeIn>
        )}

        {/* Step 5: Results */}
        {step === 5 && estimate && (
          <FadeIn>
            <div className="text-center mb-8">
              <div className="inline-block p-3 rounded-full bg-brand-lime/10 border border-brand-lime/30 mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Your Custom Estimate</h3>
              <p className="text-brand-gray">Based on your selections</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-gradient-to-r from-brand-lime/10 to-cyan-400/10 border border-brand-lime/20">
                <div className="text-brand-gray text-sm mb-2">Estimated Investment</div>
                <div className="text-4xl font-bold text-brand-lime">{estimate.estimatedCost}</div>
                <div className="text-brand-gray text-sm mt-2">Timeline: {estimate.timeline}</div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Included Features:</h4>
                <ul className="space-y-2">
                  {estimate.keyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-brand-gray">
                      <span className="text-brand-lime mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Next Steps:</h4>
                <ol className="space-y-2">
                  {estimate.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-brand-gray">
                      <span className="text-brand-lime font-mono">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <ScanLine color="lime" className="my-6" />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button as="link" href="/intake" variant="primary" size="lg" className="flex-1">
                  Schedule Discovery Call
                </Button>
                <Button variant="outline" size="lg" onClick={resetEstimator} className="flex-1">
                  Start Over
                </Button>
              </div>

              <p className="text-brand-gray text-sm text-center mt-4">
                Estimate sent to {formData.email} ✓
              </p>
            </div>
          </FadeIn>
        )}
      </HoloCard>
    </div>
  );
}
