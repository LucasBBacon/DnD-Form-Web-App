import type React from "react";

export interface SpellSlotRow {
  label: string;
  text: string;
}

interface SpellSlotHudProps {
  rows: SpellSlotRow[];
}

export const SpellSlotHud: React.FC<SpellSlotHudProps> = ({ rows }) => (
  <div className="spell-slot-hud" aria-label="Available spell slots">
    <span className="hud-label">Spell Slots</span>
    <div className="hud-track-list">
      {rows.length === 0 ? (
        <span className="hud-empty">No spell slots</span>
      ) : (
        rows.map((entry) => (
          <span key={entry.label} className="hud-track">
            <strong>{entry.label}:</strong> {entry.text}
          </span>
        ))
      )}
    </div>
  </div>
);
