import type React from "react";
import "./SpellRow.css";
import type { SpellData } from "../../../types/spell";

interface CastingStats {
  saveDC: number;
  attackBonus: number;
}

interface InnateEntry {
  spellId: string;
  sourceTraitName: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  uses?: { count: number; reset: string };
}

interface SpellRowProps {
  spell: SpellData;
  eligible: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  classNames: string[];
  castingStats: CastingStats | null;
  innateEntries: InnateEntry[];
  hasDamageOutput: boolean;
}

const formatLevel = (level: number) => (level === 0 ? "Cantrip" : `Level ${level}`);
const formatSchool = (school: string) =>
  school.charAt(0).toUpperCase() + school.slice(1);
const formatAttackBonus = (bonus: number) =>
  bonus >= 0 ? `+${bonus}` : String(bonus);
const formatResetText = (value: string) => value.replace(/_/g, " ");

export const SpellRow: React.FC<SpellRowProps> = ({
  spell,
  eligible,
  isExpanded,
  onToggle,
  classNames,
  castingStats,
  innateEntries,
  hasDamageOutput,
}) => (
  <article
    key={spell.id}
    role="listitem"
    className={`spell-card ${isExpanded ? "expanded" : ""}`}
  >
    <button
      className="spell-header-btn"
      onClick={onToggle}
      aria-expanded={isExpanded}
    >
      <div className="spell-heading-main">
        <span className="spell-name">{spell.name}</span>
        <span className={`availability-badge ${eligible ? "eligible" : "ineligible"}`}>
          {eligible ? "Eligible" : "Not eligible"}
        </span>
      </div>

      <div className="spell-collapsed-meta">
        <span className="quick-stat">{formatLevel(spell.level)}</span>
        <span className="quick-stat">{formatSchool(spell.school)}</span>
      </div>

      <p className="spell-short-description">
        {spell.lore.shortDescription || "No short description available."}
      </p>
    </button>

    {isExpanded && (
      <div className="spell-details">
        <div className="spell-meta-grid">
          <div className="meta-item">
            <strong>Casting Time:</strong> {spell.castingTime}
          </div>
          <div className="meta-item">
            <strong>Range:</strong> {spell.range}
          </div>
          <div className="meta-item">
            <strong>Duration:</strong> {spell.duration}
          </div>
          <div className="meta-item">
            <strong>Concentration:</strong> {spell.concentration ? "Yes" : "No"}
          </div>
          <div className="meta-item">
            <strong>Ritual:</strong> {spell.ritual ? "Yes" : "No"}
          </div>
          <div className="meta-item">
            <strong>Classes:</strong> {classNames.join(", ")}
          </div>
          <div className="meta-item">
            <strong>Components:</strong>{" "}
            {[
              spell.components.vocal ? "V" : null,
              spell.components.somatic ? "S" : null,
              spell.components.material ? "M" : null,
            ]
              .filter(Boolean)
              .join(", ") || "None"}
          </div>
          {spell.components.materialMaterials && (
            <div className="meta-item">
              <strong>Material Details:</strong> {spell.components.materialMaterials}
            </div>
          )}
          {spell.savingThrow && castingStats && (
            <div className="meta-item highlight">
              <strong>Save DC:</strong> {castingStats.saveDC}
            </div>
          )}
          {hasDamageOutput && castingStats && (
            <div className="meta-item highlight">
              <strong>Spell Attack:</strong> {formatAttackBonus(castingStats.attackBonus)}
            </div>
          )}
        </div>

        <hr className="divider" />

        <p className="spell-description">
          {spell.lore.fullText?.trim() || "No description available."}
        </p>

        {spell.lore.higherLevel && (
          <p className="spell-higher-level">
            <strong>At Higher Levels:</strong> {spell.lore.higherLevel}
          </p>
        )}

        {innateEntries.map((entry, index) => (
          <div key={`${spell.id}-innate-${index}`} className="innate-note">
            <strong>Innate Source:</strong> {entry.sourceTraitName}
            <span>
              {" "}
              (DC {entry.spellSaveDC}
              {hasDamageOutput
                ? `, Attack ${formatAttackBonus(entry.spellAttackBonus)}`
                : ""}
              )
            </span>
            {entry.uses && (
              <span>
                {" "}
                - Uses: {entry.uses.count} / {formatResetText(entry.uses.reset)}
              </span>
            )}
          </div>
        ))}
      </div>
    )}
  </article>
);
