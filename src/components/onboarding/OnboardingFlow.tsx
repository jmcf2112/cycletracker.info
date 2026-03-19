import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingStep } from '@/types/cycle';
import { WelcomeStep } from './WelcomeStep';
import { PrivacyStep } from './PrivacyStep';
import { FirstCycleStep } from './FirstCycleStep';
import { TypicalLengthStep } from './TypicalLengthStep';

interface OnboardingFlowProps {
  onComplete: (data: { firstCycleDate?: string; typicalLength?: number }) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [firstCycleDate, setFirstCycleDate] = useState<string>();
  const [typicalLength, setTypicalLength] = useState<number>();

  const handleNext = () => {
    switch (step) {
      case 'welcome': setStep('privacy'); break;
      case 'privacy': setStep('first-cycle'); break;
      case 'first-cycle': setStep('typical-length'); break;
      case 'typical-length': onComplete({ firstCycleDate, typicalLength }); break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'privacy': setStep('welcome'); break;
      case 'first-cycle': setStep('privacy'); break;
      case 'typical-length': setStep('first-cycle'); break;
    }
  };

  const handleSkip = () => { onComplete({ firstCycleDate, typicalLength }); };

  return (
    <div className="min-h-screen gradient-calm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 'welcome' && <WelcomeStep onNext={handleNext} />}
            {step === 'privacy' && <PrivacyStep onNext={handleNext} onBack={handleBack} />}
            {step === 'first-cycle' && <FirstCycleStep onNext={handleNext} onBack={handleBack} value={firstCycleDate} onChange={setFirstCycleDate} />}
            {step === 'typical-length' && <TypicalLengthStep onNext={handleNext} onBack={handleBack} onSkip={handleSkip} value={typicalLength} onChange={setTypicalLength} />}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-8">
          {['welcome', 'privacy', 'first-cycle', 'typical-length'].map((s, i) => (
            <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-primary' : i < ['welcome', 'privacy', 'first-cycle', 'typical-length'].indexOf(step) ? 'w-2 bg-primary/50' : 'w-2 bg-primary/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}