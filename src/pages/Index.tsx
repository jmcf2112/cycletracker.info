import { useState, useEffect } from 'react';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Dashboard } from '@/components/Dashboard';
import { useCycleData } from '@/hooks/useCycleData';


const Index = () => {
  const { settings, isLoading, updateSettings, addEntry } = useCycleData();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading && !settings.onboardingComplete) {
      setShowOnboarding(true);
    }
  }, [isLoading, settings.onboardingComplete]);

  const handleOnboardingComplete = (data: { firstCycleDate?: string; typicalLength?: number }) => {
    if (data.firstCycleDate) {
      addEntry({
        cycleStartDate: data.firstCycleDate,
        isAtypical: false,
      });
    }

    updateSettings({
      onboardingComplete: true,
      privacyAcknowledged: true,
      typicalCycleLength: data.typicalLength,
      averageCycleOverride: data.typicalLength,
    });

    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-calm flex items-center justify-center">
        <div className="animate-pulse-soft">
          <div className="w-16 h-16 rounded-full bg-primary/20" />
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <Dashboard />;
};

export default Index;