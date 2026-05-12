import type React from "react";
import "./WizardPickerStage.css";
import type { SpellSchool } from "../../types/spell";

export interface WizardSpellOption {
  id: string;
  name: string;
  level: number;
  school?: SpellSchool;
}

export interface WizardSpellSelectionStageViewProps {
  classSelected: boolean;
  isSpellcaster: boolean;
  isPreparedCaster: boolean;
  cantrips: WizardSpellOption[];
  spells: WizardSpellOption[];
  bonusPreparedSpells: WizardSpellOption[];
  selectedCantripIds: string[];
  selectedSpellIds: string[];
  cantripMax: number;
  spellMax: number;
  spellCountLabel: "prepared" | "known";
  onCantripToggle: (spellId: string) => void;
  onSpellToggle: (spellId: string) => void;
}

const spellMeta = (level: number, school?: string): string => {
  const levelLabel = level === 0 ? "Cantrip" : `Level ${level}`;
  return school ? `${levelLabel} - ${school}` : levelLabel;
};

export const WizardSpellSelectionStageView: React.FC<
  WizardSpellSelectionStageViewProps
> = ({
  classSelected,
  isSpellcaster,
  isPreparedCaster,
  cantrips,
  spells,
  bonusPreparedSpells,
  selectedCantripIds,
  selectedSpellIds,
  cantripMax,
  spellMax,
  spellCountLabel,
  onCantripToggle,
  onSpellToggle,
}) => {
  if (!classSelected || !isSpellcaster) {
    return (
      <div className="picker-stage">
        <h2 className="picker-stage-title">Spells</h2>
        <p className="picker-stage-subtitle">
          {classSelected
            ? "Your class does not cast spells."
            : "Select a class first to see available spells."}
        </p>
      </div>
    );
  }

  const selectedCantripCount = selectedCantripIds.length;
  const selectedSpellCount = selectedSpellIds.length;

  return (
    <div className="picker-stage">
      <h2 className="picker-stage-title">Spells</h2>
      <p className="picker-stage-subtitle">Choose spells from your class list.</p>

      {cantripMax > 0 && (
        <>
          <div className="picker-section-header">Cantrips</div>
          <div
            className={`picker-counter ${selectedCantripCount >= cantripMax ? "complete" : ""}`}
          >
            {selectedCantripCount} / {cantripMax} chosen
          </div>
          <div className="picker-grid">
            {cantrips.map((spell) => {
              const isSelected = selectedCantripIds.includes(spell.id);
              const isDisabled = !isSelected && selectedCantripCount >= cantripMax;
              return (
                <div
                  key={spell.id}
                  className={`picker-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                  onClick={() => onCantripToggle(spell.id)}
                >
                  {isSelected && <span className="picker-card-badge">Chosen</span>}
                  <span className="picker-card-name">{spell.name}</span>
                  <span className="picker-card-meta">
                    {spellMeta(spell.level, spell.school)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {spellMax > 0 && (
        <>
          <div className="picker-section-header">
            {isPreparedCaster ? "Prepare Spells" : "Spells Known"}
          </div>
          <div
            className={`picker-counter ${selectedSpellCount >= spellMax ? "complete" : ""}`}
          >
            {selectedSpellCount} / {spellMax} {spellCountLabel}
          </div>
          <div className="picker-grid">
            {spells.map((spell) => {
              const isSelected = selectedSpellIds.includes(spell.id);
              const isDisabled = !isSelected && selectedSpellCount >= spellMax;
              return (
                <div
                  key={spell.id}
                  className={`picker-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                  onClick={() => onSpellToggle(spell.id)}
                >
                  {isSelected && <span className="picker-card-badge">Chosen</span>}
                  <span className="picker-card-name">{spell.name}</span>
                  <span className="picker-card-meta">
                    {spellMeta(spell.level, spell.school)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {bonusPreparedSpells.length > 0 && (
        <>
          <div className="picker-section-header">Domain Spells (Always Prepared)</div>
          <div className="picker-grid">
            {bonusPreparedSpells.map((spell) => (
              <div key={`domain-${spell.id}`} className="picker-card domain-spell-picker-card">
                <span className="picker-card-badge domain-picker-badge">Domain</span>
                <span className="picker-card-name">{spell.name}</span>
                <span className="picker-card-meta">
                  {spellMeta(spell.level, spell.school)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
