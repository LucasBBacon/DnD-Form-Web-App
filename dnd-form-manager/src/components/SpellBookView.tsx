import type React from "react";
import type {
  InnateSpellcastingEntry,
  UseSpellcastingReturn,
} from "../hooks/useSpellcasting";
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

  const formatAttackBonus = (bonus: number) =>
    bonus >= 0 ? `+${bonus}` : String(bonus);

  // Hydrate and group spells
  const groupedSpells = useMemo(() => {
    // Combine all standard spell IDs (known + prepared) and deduplicate
    const standardIds = Array.from(
      new Set([
        ...spellcasting.pools.known.selected,
        ...spellcasting.pools.prepared.selected,
      ]),
    );

    const missingSpellIds: string[] = [];
    const allSpells = standardIds
      .map((id) => {
        const spell = getSpellByID(id);
        if (!spell) {
          missingSpellIds.push(id);
        }
        return spell;
      })
      .filter(
        (spell): spell is NonNullable<typeof spell> => spell != null,
      );

    // Group by Level (0 = cantrips)
    const grouped: Record<number, typeof allSpells> = {};
    allSpells.forEach((spell) => {
      if (!grouped[spell.level]) grouped[spell.level] = [];
      grouped[spell.level].push(spell);
    });

    return {
      grouped,
      missingSpellIds,
    };
  }, [spellcasting.pools.known.selected, spellcasting.pools.prepared.selected]);

  const groupedInnateSpells = useMemo(() => {
    const grouped: Record<
      number,
      Array<{
        entry: InnateSpellcastingEntry;
        index: number;
        spell: NonNullable<ReturnType<typeof getSpellByID>>;
      }>
    > = {};

    const missingSpellIds: string[] = [];

    spellcasting.pools.innate.forEach((entry, index) => {
      const spell = getSpellByID(entry.spellId);
      if (!spell) {
        missingSpellIds.push(entry.spellId);
        return;
      }

      if (!grouped[spell.level]) {
        grouped[spell.level] = [];
      }

      grouped[spell.level].push({ entry, index, spell });
    });

    return {
      grouped,
      missingSpellIds,
    };
  }, [spellcasting.pools.innate]);

  const missingSpellIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...groupedSpells.missingSpellIds,
          ...groupedInnateSpells.missingSpellIds,
        ]),
      ),
    [groupedInnateSpells.missingSpellIds, groupedSpells.missingSpellIds],
  );

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
  const levels = Object.keys(groupedSpells.grouped)
    .map(Number)
    .sort((a, b) => a - b);

  const innateLevels = Object.keys(groupedInnateSpells.grouped)
    .map(Number)
    .sort((a, b) => a - b);

  if (levels.length === 0 && innateLevels.length === 0) {
    return (
      <div className="spellbook-container">
        {missingSpellIds.length > 0 && (
          <div className="spell-error-state">
            <strong>Missing Spell References</strong>
            {missingSpellIds.map((spellId) => (
              <p key={`missing-spell-${spellId}`}>Missing spell reference: {spellId}</p>
            ))}
          </div>
        )}
        <div className="empty-state">Your spellbook is empty.</div>
      </div>
    );
  }

  return (
    <div className="spellbook-container">
      {missingSpellIds.length > 0 && (
        <div className="spell-error-state">
          <strong>Missing Spell References</strong>
          {missingSpellIds.map((spellId) => (
            <p key={`missing-spell-${spellId}`}>Missing spell reference: {spellId}</p>
          ))}
        </div>
      )}

      {/* Loop through levels */}
      {levels.map((level) => (
        <div key={`spell-lvl-${level}`} className="spell-level-group">
          <h3 className="level-header">
            {level === 0 ? "CANTRIPS" : `LEVEL ${level} SPELLS`}
          </h3>

          <div className="spell-list">
            {groupedSpells.grouped[level].map((spell) => {
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
                          <strong>Save DC:</strong> {spellcasting.casting.saveDC}
                        </div>
                        <div className="meta-item highlight">
                          <strong>Spell Attack:</strong>{" "}
                          {formatAttackBonus(spellcasting.casting.attackBonus)}
                        </div>
                      </div>

                      <hr className="divider" />

                      <div className="spell-description">
                        {spell.lore?.fullText?.trim() || "No description available."}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {innateLevels.length > 0 && (
        <div className="innate-spellbook-section">
          <h3 className="level-header innate-level-header">
            INNATE SPELLCASTING - TRAITS AND FEATURES
          </h3>

          {innateLevels.map((level) => (
            <div key={`innate-spell-lvl-${level}`} className="spell-level-group">
              <h4 className="innate-level-subheader">
                {level === 0 ? "INNATE CANTRIPS" : `INNATE LEVEL ${level}`}
              </h4>

              <div className="spell-list innate-spell-list">
                {groupedInnateSpells.grouped[level].map(({ entry, index, spell }) => {
                  const cardId = `innate:${entry.spellId}:${entry.sourceTraitName}:${index}`;
                  const isExpanded = expandedSpellId === cardId;

                  return (
                    <div
                      key={cardId}
                      className={`spell-card innate-spell-card ${isExpanded ? "expanded" : ""}`}
                    >
                      <button
                        className="spell-header-btn"
                        onClick={() => toggleSpell(cardId)}
                      >
                        <span className="spell-name">{spell.name}</span>
                        <div className="spell-quick-stats">
                          <span className="quick-stat innate-mode-pill">Innate</span>
                          <span className="quick-stat">{spell.castingTime}</span>
                          <span className="quick-stat">{spell.range}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="spell-details innate-spell-details">
                          <div className="spell-meta-grid">
                            <div className="meta-item">
                              <strong>Duration:</strong> {spell.duration}
                            </div>
                            <div className="meta-item">
                              <strong>School:</strong> {spell.school}
                            </div>
                            <div className="meta-item">
                              <strong>Source:</strong> {entry.sourceTraitName}
                            </div>
                            {entry.uses && (
                              <div className="meta-item">
                                <strong>Uses:</strong> {entry.uses.count} / {entry.uses.reset.replace("_", " ")}
                              </div>
                            )}
                            <div className="meta-item highlight innate-highlight">
                              <strong>Save DC:</strong> {entry.spellSaveDC}
                            </div>
                            <div className="meta-item highlight innate-highlight">
                              <strong>Spell Attack:</strong>{" "}
                              {formatAttackBonus(entry.spellAttackBonus)}
                            </div>
                          </div>

                          <hr className="divider" />

                          <div className="spell-description">
                            {spell.lore?.fullText?.trim() || "No description available."}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
