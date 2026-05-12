import type React from "react";
import "./WizardStepNav.css";

// #region Interfaces

export interface WizardStep {
  /** The unique identifier for the step */
  id: string;
  /** The label displayed for the step */
  label: string;
}

interface WizardStepNavProps {
  /** The steps to be displayed in the wizard */
  steps: WizardStep[];
  /** The index of the currently active step */
  currentStepIndex: number;
  /** Callback function when a step is clicked */
  onStepClick: (index: number) => void;
  /** Function to determine if a step is disabled */
  isStepDisabled: (index: number) => boolean;
}

// #endregion

// #region Component

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

// #endregion
