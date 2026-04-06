import { useState } from "react";
import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllSpells, getSpellByID } from "../data/staticDataApi";

export const SpellbookBlock = () => {
  const { classId, learnSpell, prepareSpell, unprepareSpell } =
    useCharacterStore();
  const {
    isSpellcaster,
    canCastSpells,
    casting,
    pools,
    diagnostics,
  } = useSpellcasting();

  const [selectedSpellId, setSelectedSpellId] = useState<string>("");

  // Safety check, don't render if a pure martial class
  if (!isSpellcaster) return null;

  // Figure out which paradigm is being used
  const isPreparedCaster = casting.preparationType === "prepared";
  const activeSpells = isPreparedCaster
    ? pools.prepared.selected
    : pools.known.selected;
  const eligibleClassIds =
    diagnostics.classBreakdown.length > 0
      ? diagnostics.classBreakdown.map((summary) => summary.classId)
      : classId
        ? [classId]
        : [];

  // Filter spells so dropdown only shows spells for active spellcasting classes.
  const availableClassSpells = getAllSpells().filter(
    (spell) => spell.classes.some((spellClassId) => eligibleClassIds.includes(spellClassId)),
  );

  const uniqueKnownCount = new Set(pools.known.selected).size;
  const uniquePreparedCount = new Set(pools.prepared.selected).size;

  const resolveSpellName = (spellId: string) => {
    const spell = getSpellByID(spellId);
    return spell?.name || `Unknown Spell (${spellId})`;
  };

  const hasDiagnostics =
    diagnostics.selections.invalidKnownSpellIds.length > 0 ||
    diagnostics.selections.invalidPreparedSpellIds.length > 0 ||
    diagnostics.selections.knownSpellOverflow > 0 ||
    diagnostics.selections.preparedSpellOverflow > 0;

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
            <strong>Spell Save DC:</strong> {casting.saveDC}
          </span>
          <span>
            <strong>Spell Attack:</strong> +{casting.attackBonus}
          </span>
        </div>
      </div>

      <div className="spellbook-capacity" style={{ marginBottom: "0.75rem" }}>
        {isPreparedCaster ? (
          <p>
            Prepared Capacity: {uniquePreparedCount}/{pools.prepared.max}
          </p>
        ) : (
          <p>
            Known Capacity: {uniqueKnownCount}/{pools.known.max}
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

          {diagnostics.selections.knownSpellOverflow > 0 && (
            <p>
              Known spells exceed limit by {diagnostics.selections.knownSpellOverflow}.
            </p>
          )}

          {diagnostics.selections.preparedSpellOverflow > 0 && (
            <p>
              Prepared spells exceed limit by {diagnostics.selections.preparedSpellOverflow}.
            </p>
          )}

          {diagnostics.selections.invalidKnownSpellIds.length > 0 && (
            <div>
              <strong>Invalid known spells:</strong>
              <ul>
                {diagnostics.selections.invalidKnownSpellIds.map((spellId) => (
                  <li key={`invalid-known-${spellId}`}>{resolveSpellName(spellId)}</li>
                ))}
              </ul>
            </div>
          )}

          {diagnostics.selections.invalidPreparedSpellIds.length > 0 && (
            <div>
              <strong>Invalid prepared spells:</strong>
              <ul>
                {diagnostics.selections.invalidPreparedSpellIds.map((spellId) => (
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
      {pools.innate.length > 0 && (
        <div className="innate-spells-block">
          <h3>Innate Magic and Traits</h3>
          <ul className="innate-spell-list">
            {pools.innate.map((innate, idx) => (
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
