import "./WizardStepNav.css"
import type React from "react";

export interface WizardStep {
  id: string;
  label: string;
}

interface WizardStepNavProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  isStepDisabled: (index: number) => boolean;
}

export const WizardStepNav: React.FC<WizardStepNavProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  isStepDisabled,
}) => {
  return (
    <nav className="stepper-nav">
      {steps.map((step, index) => {
        const isActive = currentStepIndex === index;
        const isDisabled = isStepDisabled(index);

        return (
          <button
            key={step.id}
            className={`stepper-btn ${isActive ? "active" : ""} ${
              isDisabled ? "disabled" : ""
            }`}
            onClick={() => onStepClick(index)}
            disabled={isDisabled}
          >
            {step.label}
          </button>
        );
      })}
    </nav>
  );
};
