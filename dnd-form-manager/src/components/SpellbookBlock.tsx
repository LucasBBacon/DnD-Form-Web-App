import { useState } from "react";
import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllSpells, getSpellByID } from "../data/staticDataApi";

export const SpellbookBlock = () => {
  const { classId, learnSpell, prepareSpell, unprepareSpell } =
    useCharacterStore();
  const {
    isSpellcaster,
    preparationType,
    spellSaveDC,
    spellAttackBonus,
    maxSpellsKnown,
    maxPreparedSpells,
    classSpellcastingSummaries,
    spellSelectionDiagnostics,
    spellsKnown,
    spellsPrepared,
    innateSpells,
    canCastSpells,
  } = useSpellcasting();

  const [selectedSpellId, setSelectedSpellId] = useState<string>("");

  // Safety check, don't render if a pure martial class
  if (!isSpellcaster) return null;

  // Figure out which paradigm is being used
  const isPreparedCaster = preparationType === "prepared";
  const activeSpells = isPreparedCaster ? spellsPrepared : spellsKnown;
  const eligibleClassIds =
    classSpellcastingSummaries.length > 0
      ? classSpellcastingSummaries.map((summary) => summary.classId)
      : classId
        ? [classId]
        : [];

  // Filter spells so dropdown only shows spells for active spellcasting classes.
  const availableClassSpells = getAllSpells().filter(
    (spell) => spell.classes.some((spellClassId) => eligibleClassIds.includes(spellClassId)),
  );

  const uniqueKnownCount = new Set(spellsKnown).size;
  const uniquePreparedCount = new Set(spellsPrepared).size;

  const resolveSpellName = (spellId: string) => {
    const spell = getSpellByID(spellId);
    return spell?.name || `Unknown Spell (${spellId})`;
  };

  const hasDiagnostics =
    spellSelectionDiagnostics.invalidKnownSpellIds.length > 0 ||
    spellSelectionDiagnostics.invalidPreparedSpellIds.length > 0 ||
    spellSelectionDiagnostics.knownSpellOverflow > 0 ||
    spellSelectionDiagnostics.preparedSpellOverflow > 0;

  const handleAddSpell = () => {
    if (!selectedSpellId) return;
    if (isPreparedCaster) {
      prepareSpell(selectedSpellId)
    } else {
      learnSpell(selectedSpellId);
    }
    setSelectedSpellId("");
  };

  return (
    <div className="spellbook-container">
      {/* Penalty Banner */}
      {!canCastSpells && (
        <div
          className="penalty-banner"
          style={{
            background: "#ff4444",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
        >
          <strong>ARMOR PENALTY</strong> You are wearing armor or wielding a
          shield you are not proficient with. You cannot cast spells!
        </div>
      )}

      <div className="spellbook-header">
        <h2>Spellbook</h2>
        <div className="spell-stats">
          <span>
            <strong>Spell Save DC:</strong> {spellSaveDC}
          </span>
          <span>
            <strong>Spell Attack:</strong> +{spellAttackBonus}
          </span>
        </div>
      </div>

      <div className="spellbook-capacity" style={{ marginBottom: "0.75rem" }}>
        {isPreparedCaster ? (
          <p>
            Prepared Capacity: {uniquePreparedCount}/{maxPreparedSpells}
          </p>
        ) : (
          <p>
            Known Capacity: {uniqueKnownCount}/{maxSpellsKnown}
          </p>
        )}
      </div>

      {hasDiagnostics && (
        <div
          className="spellbook-diagnostics"
          style={{
            border: "1px solid #d89d00",
            background: "#fff7e0",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Spell Selection Warnings</h3>

          {spellSelectionDiagnostics.knownSpellOverflow > 0 && (
            <p>
              Known spells exceed limit by {spellSelectionDiagnostics.knownSpellOverflow}.
            </p>
          )}

          {spellSelectionDiagnostics.preparedSpellOverflow > 0 && (
            <p>
              Prepared spells exceed limit by {spellSelectionDiagnostics.preparedSpellOverflow}.
            </p>
          )}

          {spellSelectionDiagnostics.invalidKnownSpellIds.length > 0 && (
            <div>
              <strong>Invalid known spells:</strong>
              <ul>
                {spellSelectionDiagnostics.invalidKnownSpellIds.map((spellId) => (
                  <li key={`invalid-known-${spellId}`}>{resolveSpellName(spellId)}</li>
                ))}
              </ul>
            </div>
          )}

          {spellSelectionDiagnostics.invalidPreparedSpellIds.length > 0 && (
            <div>
              <strong>Invalid prepared spells:</strong>
              <ul>
                {spellSelectionDiagnostics.invalidPreparedSpellIds.map((spellId) => (
                  <li key={`invalid-prepared-${spellId}`}>
                    {resolveSpellName(spellId)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* --- Innate Spells --- */}
      {innateSpells && innateSpells.length > 0 && (
        <div className="innate-spells-block">
          <h3>Innate Magic and Traits</h3>
          <ul className="innate-spell-list">
            {innateSpells.map((innate, idx) => (
              <li key={`innate-${idx}`} className="spell-row">
                <div className="spell-info">
                  <strong>
                    {innate.spellName}
                  </strong>
                  <span className="source-tag">
                    from {innate.sourceTraitName}
                  </span>
                </div>
                <div className="spell-math">
                  <span>
                    ATK:{" "}
                    {innate.spellAttackBonus >= 0
                      ? `+${innate.spellAttackBonus}`
                      : innate.spellAttackBonus}
                  </span>
                  <span>DC: {innate.spellSaveDC}</span>
                </div>
                {innate.uses && (
                  <div className="spell-uses">
                    {innate.uses.count} / {innate.uses.reset.replace("_", " ")}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Add Spell Dev Tool --- */}
      <div className="add-spell-row">
        <select
          value={selectedSpellId}
          onChange={(e) => setSelectedSpellId(e.target.value)}
        >
          <option value="" disabled>
            {isPreparedCaster
              ? "Select a spell to prepare..."
              : "Select a spell to learn..."}
          </option>
          {availableClassSpells.map((spell) => (
            <option key={spell.id} value={spell.id}>
              Lvl {spell.level}: {spell.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddSpell} disabled={!canCastSpells}>
          {isPreparedCaster ? "Prepare" : "Learn"}
        </button>
      </div>

      {/* --- Active spells list --- */}
      <div className="active-spells-list">
        {activeSpells.length == 0 ? (
          <p>No spells currently {isPreparedCaster ? "prepared" : "known"}.</p>
        ) : (
          activeSpells.map((spellId) => {
            const spell = getSpellByID(spellId);
            if (!spell) return null;

            return (
              <div key={spell.id} className="spell-card">
                <div className="spell-card-header">
                  <strong>{spell.name}</strong>
                  <span className="spell-tags">
                    {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} -
                    {spell.school}
                  </span>
                </div>

                <div className="spell-card-meta">
                  <span>{spell.castingTime}</span>
                  <span>{spell.range}</span>
                  <span>
                    {spell.duration} {spell.concentration && "(C)"}
                  </span>
                </div>

                <p className="spell-lore">{spell.lore.shortDescription}</p>

                {/* Clerics and Wizards can unprepare spells on the fly */}
                {isPreparedCaster && (
                  <button onClick={() => unprepareSpell(spell.id)}>
                    Unprepare
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
