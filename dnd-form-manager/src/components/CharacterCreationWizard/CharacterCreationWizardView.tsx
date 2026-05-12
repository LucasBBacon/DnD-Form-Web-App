import type React from "react";
import { WizardStepNav } from "./ui/WizardStepNav";
import type { WizardStep } from "./ui/WizardStepNav";
import "./CharacterCreationWizard.css";

export interface WizardDraftIdentityRow {
  label: string;
  value: string;
}

export interface WizardDraftAbilityRow {
  label: string;
  score: number;
  modifier: number;
}

export interface WizardProgressCheck {
  label: string;
  isComplete: boolean;
}

export interface CharacterCreationWizardViewProps {
  brandTitle?: string;
  steps: WizardStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  isStepDisabled: (index: number) => boolean;
  centerStage: React.ReactNode;
  draft: {
    identityRows: WizardDraftIdentityRow[];
    proficiencyBonus: number;
    abilities: WizardDraftAbilityRow[];
    progressChecks: WizardProgressCheck[];
  };
}

const formatModifier = (modifier: number): string =>
  modifier >= 0 ? `+${modifier}` : `${modifier}`;

export const CharacterCreationWizardView: React.FC<
  CharacterCreationWizardViewProps
> = ({
  brandTitle = "Character Creator",
  steps,
  currentStepIndex,
  onStepClick,
  isStepDisabled,
  centerStage,
  draft,
}) => {
  return (
    <div className="wizard-workspace">
      <aside className="wizard-sidebar-left">
        <h1 className="wizard-brand">{brandTitle}</h1>
        <WizardStepNav
          steps={steps}
          currentStepIndex={currentStepIndex}
          onStepClick={onStepClick}
          isStepDisabled={isStepDisabled}
        />
      </aside>

      <main className="wizard-center-stage">{centerStage}</main>

      <aside className="wizard-sidebar-right">
        <h3 className="draft-header">Live Draft</h3>
        <div className="draft-content">
          <div className="draft-section-title">Identity</div>
          {draft.identityRows.map((row) => (
            <div className="draft-row" key={row.label}>
              <span className="label">{row.label}:</span>
              <span className="value">{row.value}</span>
            </div>
          ))}
          <div className="draft-row">
            <span className="label">Prof. Bonus:</span>
            <span className="value">{formatModifier(draft.proficiencyBonus)}</span>
          </div>

          <hr className="draft-divider" />

          <div className="draft-section-title">Core Stats</div>
          <div className="draft-stats-grid">
            {draft.abilities.map((ability) => (
              <div className="draft-stat-box" key={ability.label}>
                <span className="draft-stat-name">{ability.label}</span>
                <span className="draft-stat-val">{ability.score}</span>
                <span className="draft-stat-mod">
                  {formatModifier(ability.modifier)}
                </span>
              </div>
            ))}
          </div>

          <hr className="draft-divider" />

          <div className="draft-section-title">Progress</div>
          <div className="draft-progress-list">
            {draft.progressChecks.map((check) => (
              <div className="draft-progress-row" key={check.label}>
                <span className="label">{check.label}</span>
                <span
                  className={`draft-status-chip ${check.isComplete ? "done" : "pending"}`}
                >
                  {check.isComplete ? "Complete" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
