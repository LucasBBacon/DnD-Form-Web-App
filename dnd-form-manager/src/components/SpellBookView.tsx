import type React from "react";
import type { UseSpellcastingReturn } from "../hooks/useSpellcasting";
import { useMemo, useState } from "react";
import { getSpellByID } from "../data/staticDataApi";
import "./SpellBookView.css"

interface SpellBookViewProps {
  spellcasting: UseSpellcastingReturn;
}

export const SpellBookView: React.FC<SpellBookViewProps> = ({
  spellcasting,
}) => {
  // State to track which spell accordion is currently open
  const [expandedSpellId, setExpandedSpellId] = useState<string | null>(null);

  // Hydrate and group spells
  const groupedSpells = useMemo(() => {
    // Combine all standard spell IDs (known + prepared) and deduplicate
    const standardIds = Array.from(
      new Set([
        ...spellcasting.pools.known.selected,
        ...spellcasting.pools.prepared.selected,
      ]),
    );

    const allSpells = standardIds
      .map((id) => getSpellByID(id))
      .filter(
        (spell): spell is NonNullable<typeof spell> => spell !== undefined,
      );

    // Group by Level (0 = cantrips)
    const grouped: Record<number, typeof allSpells> = {};
    allSpells.forEach((spell) => {
      if (!grouped[spell.level]) grouped[spell.level] = [];
      grouped[spell.level].push(spell);
    });

    return grouped;
  }, [spellcasting.pools.known.selected, spellcasting.pools.prepared.selected]);

  const toggleSpell = (id: string) => {
    setExpandedSpellId((prev) => (prev === id ? null : id));
  };

  // Render warning if armor penalty applies
  if (!spellcasting.canCastSpells) {
    return (
      <div className="spell-error-state">
        <strong>Cannot Cast Spells</strong>
        <p>You are wearing armor you are not proficient with.</p>
      </div>
    );
  }

  // Render spellbook
  const levels = Object.keys(groupedSpells)
    .map(Number)
    .sort((a, b) => a - b);

  if (levels.length === 0 && spellcasting.pools.innate.length === 0) {
    return <div className="empty-state">Your spellbook is empty.</div>;
  }

  return (
    <div className="spellbook-container">
      {/* Loop through levels */}
      {levels.map((level) => (
        <div key={`spell-lvl-${level}`} className="spell-level-group">
          <h3 className="level-header">
            {level === 0 ? "CANTRIPS" : `LEVEL ${level} SPELLS`}
          </h3>

          <div className="spell-list">
            {groupedSpells[level].map((spell) => {
              const isExpanded = expandedSpellId === spell.id;

              return (
                <div
                  key={spell.id}
                  className={`spell-card ${isExpanded ? "expanded" : ""}`}
                >
                  {/* Accordion header (always visible) */}
                  <button
                    className="spell-header-btn"
                    onClick={() => toggleSpell(spell.id)}
                  >
                    <span className="spell-name">{spell.name}</span>
                    <div className="spell-quick-stats">
                      <span className="quick-stat">{spell.castingTime}</span>
                      <span className="quick-stat">{spell.range}</span>
                    </div>
                  </button>

                  {/* Accordion body */}
                  {isExpanded && (
                    <div className="spell-details">
                      <div className="spell-meta-grid">
                        <div className="meta-item">
                          <strong>Duration:</strong> {spell.duration}
                        </div>
                        <div className="meta-item">
                          <strong>School:</strong> {spell.school}
                        </div>
                        <div className="meta-item highlight">
                          {/* TODO: Implement save DC and attack bonus */}
                          <strong>Save DC:</strong> TO BE IMPLEMENTED
                        </div>
                      </div>

                      <hr className="divider" />

                      <div className="spell-description">
                        {/* TODO: implement spell desc */}
                        TO BE IMPLEMENTED
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* TODO: Implement innate spells by looping over here, so that it always shows at the bottom */}
    </div>
  );
};
