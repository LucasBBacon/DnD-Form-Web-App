import { useState } from "react";
import { RaceSelectionStep } from "./RaceSelectionStep";
import { ClassSelectionStep } from "./ClassSelectionStep";
import { AbilityScoreStep } from "./AbilityScoreStep";
import { OriginFeatStep } from "./OriginFeatStep";

type WizardStep = "race" | "class" | "abilities" | "origin" | "complete";

export const CharacterCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("race");

  // Final commit function
  const finishWizard = () => {
    // commit the final details to zustand,
    // hide wizard and reveal character sheet
    setCurrentStep('complete'); 
  };

  return (
    <div className="wizard-container">
      {/* Progress Bar */}
      <div className="wizard-progress">
        <span className={currentStep === 'race' ? 'active' : ''}>1. Race</span>
        <span className={currentStep === 'class' ? 'active' : ''}>2. Class</span>
        <span className={currentStep === 'abilities' ? 'active' : ''}>3. Abilities</span>
        <span className={currentStep === 'origin' ? 'active' : ''}>4. Origin Feat</span>
      </div>

      {/* Step Router */}
      <div className="wizard-content">
        {currentStep === 'race' && (
          <RaceSelectionStep onNext={() => setCurrentStep('class')} />
        )}
        {currentStep === 'class' && (
          <ClassSelectionStep onNext={() => setCurrentStep('abilities')} />
        )}
        {currentStep === 'abilities' && (
          <div>
            <AbilityScoreStep onFinish={() => setCurrentStep('origin')} />
          </div>
        )}
        {currentStep === 'origin' && (
          <OriginFeatStep
            onBack={() => setCurrentStep('abilities')}
            onFinish={finishWizard}
          />
        )}
      </div>
    </div>
  );
};
