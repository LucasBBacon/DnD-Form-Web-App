import { useState } from "react";
import { RaceSelectionStep } from "./RaceSelectionStep";
import { ClassSelectionStep } from "./ClassSelectionStep";
import { AbilityScoreStep } from "./AbilityScoreStep";

type WizardStep = "race" | "class" | "abilities" | "details" | "complete";

export const CharacterCreationWizard = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>("race");

  // use local state to hold the draft so user can back out
  const [draftName, setDraftName] = useState('');

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
            <AbilityScoreStep onFinish={finishWizard}/>
          </div>
        )}
      </div>
    </div>
  );
};
