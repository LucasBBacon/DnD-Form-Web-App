import type React from "react";
import "./WizardPickerStage.css";
import { useMemo } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllSpells, getSpellByID } from "../../data/staticDataApi";
import { useSpellcasting } from "../../hooks/useSpellcasting";

/** Formats a spell's school and level for the card subtitle. */
function spellMeta(level: number, school?: string): string {
  const levelStr = level === 0 ? "Cantrip" : `Level ${level}`;
  return school ? `${levelStr} · ${school}` : levelStr;
}

export const WizardSpellSelectionStage: React.FC = () => {
  const classId = useCharacterStore((s) => s.classId);
  const spellsKnown = useCharacterStore((s) => s.spellsKnown);
  const spellsPrepared = useCharacterStore((s) => s.spellsPrepared);
  const learnSpell = useCharacterStore((s) => s.learnSpell);
  const unlearnSpell = useCharacterStore((s) => s.unlearnSpell);
  const prepareSpell = useCharacterStore((s) => s.prepareSpell);
  const unprepareSpell = useCharacterStore((s) => s.unprepareSpell);

  const { isSpellcaster, pools, casting } = useSpellcasting();

  const isPreparedCaster = casting.preparationType === "prepared";

  // Filter the full spell list to this class's available spells.
  // Exclude always-prepared domain spells (they're shown in their own locked section).
  // Include any spells added via expandedSpellIds (off-list spells that can be manually prepared).
  const classSpells = useMemo(() => {
    if (!classId) return [];
    const bonusPreparedSet = new Set(pools.bonusPrepared);
    const baseSpells = getAllSpells().filter(
      (spell) => spell.classes?.includes(classId) && !bonusPreparedSet.has(spell.id),
    );
    const baseIds = new Set(baseSpells.map((s) => s.id));
    const expandedOnly = pools.allExpandedSpellIds
      .filter((id) => !baseIds.has(id) && !bonusPreparedSet.has(id))
      .map((id) => getAllSpells().find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s != null);
    return [...baseSpells, ...expandedOnly];
  }, [classId, pools.bonusPrepared, pools.allExpandedSpellIds]);

  const cantrips = useMemo(
    () => classSpells.filter((s) => s.level === 0),
    [classSpells],
  );

  const spells = useMemo(
    () => classSpells.filter((s) => s.level > 0),
    [classSpells],
  );

  // Current selection counts
  const chosenCantrips = spellsKnown.filter((id) => {
    const spell = getSpellByID(id);
    return spell != null && spell.level === 0;
  });

  const chosenKnownSpells = spellsKnown.filter((id) => {
    const spell = getSpellByID(id);
    return spell != null && spell.level > 0;
  });

  const cantripMax = pools.cantrips.max;
  const knownMax = pools.known.max;
  const preparedMax = pools.prepared.max;
  // Count only manually prepared spells (exclude always-prepared domain spells)
  const bonusPreparedSet = new Set(pools.bonusPrepared);
  const manualPreparedCount = spellsPrepared.filter((id) => !bonusPreparedSet.has(id)).length;

  if (!classId || !isSpellcaster) {
    return (
      <div className="picker-stage">
        <h2 className="picker-stage-title">Spells</h2>
        <p className="picker-stage-subtitle">
          {classId
            ? "Your class does not cast spells."
            : "Select a class first to see available spells."}
        </p>
      </div>
    );
  }

  const handleCantripClick = (spellId: string) => {
    if (chosenCantrips.includes(spellId)) {
      unlearnSpell(spellId);
    } else if (chosenCantrips.length < cantripMax) {
      learnSpell(spellId);
    }
  };

  const handleSpellClick = (spellId: string) => {
    if (isPreparedCaster) {
      // Prepared casters toggle prepared list
      if (spellsPrepared.includes(spellId)) {
        unprepareSpell(spellId);
      } else if (manualPreparedCount < preparedMax) {
        prepareSpell(spellId);
      }
    } else {
      // Known/pact casters toggle known list
      if (chosenKnownSpells.includes(spellId)) {
        unlearnSpell(spellId);
      } else if (chosenKnownSpells.length < knownMax) {
        learnSpell(spellId);
      }
    }
  };

  return (
    <div className="picker-stage">
      <h2 className="picker-stage-title">Spells</h2>
      <p className="picker-stage-subtitle">
        Choose spells from your class list.
      </p>

      {/* Cantrips section */}
      {cantripMax > 0 && (
        <>
          <div className="picker-section-header">Cantrips</div>
          <div
            className={`picker-counter ${chosenCantrips.length >= cantripMax ? "complete" : ""}`}
          >
            {chosenCantrips.length} / {cantripMax} chosen
          </div>
          <div className="picker-grid">
            {cantrips.map((spell) => {
              const isSelected = chosenCantrips.includes(spell.id);
              const isDisabled =
                !isSelected && chosenCantrips.length >= cantripMax;
              return (
                <div
                  key={spell.id}
                  className={`picker-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                  onClick={() => handleCantripClick(spell.id)}
                >
                  {isSelected && (
                    <span className="picker-card-badge">Chosen</span>
                  )}
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

      {/* Spells section */}
      {(knownMax > 0 || (isPreparedCaster && preparedMax > 0)) && (
        <>
          <div className="picker-section-header">
            {isPreparedCaster ? "Prepare Spells" : "Spells Known"}
          </div>
          {(() => {
            const currentCount = isPreparedCaster
              ? manualPreparedCount
              : chosenKnownSpells.length;
            const maxCount = isPreparedCaster ? preparedMax : knownMax;
            return (
              <div
                className={`picker-counter ${currentCount >= maxCount ? "complete" : ""}`}
              >
                {currentCount} / {maxCount}{" "}
                {isPreparedCaster ? "prepared" : "known"}
              </div>
            );
          })()}
          <div className="picker-grid">
            {spells.map((spell) => {
              const isSelected = isPreparedCaster
                ? spellsPrepared.includes(spell.id)
                : chosenKnownSpells.includes(spell.id);
              const currentCount = isPreparedCaster
                ? manualPreparedCount
                : chosenKnownSpells.length;
              const maxCount = isPreparedCaster ? preparedMax : knownMax;
              const isDisabled = !isSelected && currentCount >= maxCount;
              return (
                <div
                  key={spell.id}
                  className={`picker-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                  onClick={() => handleSpellClick(spell.id)}
                >
                  {isSelected && (
                    <span className="picker-card-badge">Chosen</span>
                  )}
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

      {/* Domain Spells — always prepared, shown as locked cards */}
      {pools.bonusPrepared.length > 0 && (
        <>
          <div className="picker-section-header">Domain Spells (Always Prepared)</div>
          <div className="picker-grid">
            {pools.bonusPrepared.map((spellId) => {
              const spell = getSpellByID(spellId);
              if (!spell) return null;
              return (
                <div key={`domain-${spell.id}`} className="picker-card domain-spell-picker-card">
                  <span className="picker-card-badge domain-picker-badge">Domain</span>
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
    </div>
  );
};
