import type React from "react";
import "./SpellSlotAbacus.css";
import type { UseSpellcastingReturn } from "../../../hooks/useSpellcasting";

export interface SpellSlotAbacusProps {
  slots: UseSpellcastingReturn["slots"];
  toRomanNumeral: (level: number) => string;
  onToggleSlot?: (
    type: "shared" | "pact",
    level: number,
    isExpending: boolean,
  ) => void;
}

export const SpellSlotAbacus: React.FC<SpellSlotAbacusProps> = ({
  slots,
  toRomanNumeral,
  onToggleSlot,
}) => {
  const renderSlotBeads = (
    type: "shared" | "pact",
    level: number,
    total: number,
    expended: number,
  ) => {
    return Array.from({ length: total }).map((_, index) => {
      const isExpended = index < expended;

      return (
        <button
          key={`${type}-${level}-${index}`}
          className={`abacus-bead ${type}-bead ${isExpended ? "is-expended" : "is-ready"}`}
          onClick={() => {
            if (onToggleSlot) onToggleSlot(type, level, !isExpended);
          }}
          disabled={!onToggleSlot}
          title={`${type === "pact" ? "Pact " : ""}Level ${level} Slot (${isExpended ? "Expended" : "Available"})`}
        />
      );
    });
  };

  const activeSharedLevels = Object.entries(slots.shared)
    .map(([level, data]) => ({ level: Number(level), ...data }))
    .filter((data) => data.total > 0);

  if (activeSharedLevels.length === 0 && !slots.pact) {
    return null;
  }

  return (
    <div className="spell-abacus-container">
      <div className="abacus-title">Spell Slots</div>

      <div className="abacus-grid">
        {/* Pact Magic */}
        {slots.pact && slots.pact.total > 0 && (
          <div className="abacus-row pact-row">
            <div className="slot-level-label pact-label">
              Pact {toRomanNumeral(slots.pact.level)}
            </div>
            <div className="slot-wire">
              {renderSlotBeads(
                "pact",
                slots.pact.level,
                slots.pact.total,
                slots.pact.expended,
              )}
            </div>
          </div>
        )}

        {/* Shared Magic */}
        {activeSharedLevels.map(({ level, total, expended }) => (
          <div key={`shared-${level}`} className="abacus-row">
            <div className="slot-level-label">
              Level {toRomanNumeral(level)}
            </div>
            <div className="slot-wire">
              {renderSlotBeads("shared", level, total, expended)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
