import { useEffect, useState } from "react";
import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllSpells, getSpellByID } from "../data/staticDataApi";

export const SpellbookBlock = () => {
  const {
    classId,
    learnSpell,
    prepareSpell,
    unprepareSpell,
    designateFreeSchoolSpell,
    undesignateFreeSchoolSpell,
    trimFreeSchoolDesignations,
  } = useCharacterStore();
  const {
    isSpellcaster,
    canCastSpells,
    casting,
    pools,
    diagnostics,
  } = useSpellcasting();

  const [selectedSpellId, setSelectedSpellId] = useState<string>("");

  // Auto-clear excess free-school designations when available slots change
  useEffect(() => {
    trimFreeSchoolDesignations(pools.freeSchoolSlots);
  }, [pools.freeSchoolSlots]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // Also include any spells added via spellsAddedToList (expanded spell lists) that
  // aren't already covered by the class filter, excluding always-prepared domain spells.
  const bonusPreparedSet = new Set(pools.bonusPrepared);
  const baseClassSpells = getAllSpells().filter(
    (spell) =>
      spell.classes.some((spellClassId) => eligibleClassIds.includes(spellClassId)) &&
      !bonusPreparedSet.has(spell.id),
  );
  const baseClassSpellIds = new Set(baseClassSpells.map((s) => s.id));
  const expandedOnlySpells = pools.allExpandedSpellIds
    .filter((id) => !baseClassSpellIds.has(id) && !bonusPreparedSet.has(id))
    .map((id) => getAllSpells().find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s != null);
  const availableClassSpells = [...baseClassSpells, ...expandedOnlySpells];

  const uniqueKnownCount = new Set(pools.known.selected).size;
  // Exclude always-prepared domain spells from the displayed prepared count
  const uniquePreparedCount = new Set(
    pools.prepared.selected.filter((id) => !bonusPreparedSet.has(id)),
  ).size;

  const resolveSpellName = (spellId: string) => {
    const spell = getSpellByID(spellId);
    return spell?.name || `Missing spell reference: ${spellId}`;
  };

  const missingActiveSpellIds = Array.from(
    new Set(activeSpells.filter((spellId) => getSpellByID(spellId) === null)),
  );
  const missingInnateSpellIds = Array.from(
    new Set(
      pools.innate
        .filter((innate) => !innate.isResolvedSpell)
        .map((innate) => innate.spellId),
    ),
  );
  const missingSpellIds = Array.from(
    new Set([...missingActiveSpellIds, ...missingInnateSpellIds]),
  );

  const hasDiagnostics =
    diagnostics.selections.invalidKnownSpellIds.length > 0 ||
    diagnostics.selections.invalidPreparedSpellIds.length > 0 ||
    diagnostics.selections.knownSpellOverflow > 0 ||
    diagnostics.selections.preparedSpellOverflow > 0 ||
    diagnostics.selections.freeSchoolOverflow > 0;

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
            {pools.freeSchoolSlots > 0 && (
              <span style={{ marginLeft: "1rem", color: "#6b48ff" }}>
                Free ✦: {pools.freeSchoolDesignated.length}/{pools.freeSchoolSlots}
              </span>
            )}
          </p>
        )}
      </div>

      {missingSpellIds.length > 0 && (
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
          <h3 style={{ marginTop: 0 }}>Missing Spell References</h3>
          <ul>
            {missingSpellIds.map((spellId) => (
              <li key={`missing-spell-${spellId}`}>
                Missing spell reference: {spellId}
              </li>
            ))}
          </ul>
        </div>
      )}

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

          {diagnostics.selections.freeSchoolOverflow > 0 && (
            <p>
              Free-school designations exceed available slots by{" "}
              {diagnostics.selections.freeSchoolOverflow}. Remove excess
              designations.
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

                {/* Free-school designation toggle — shown on all known spells when slots are available */}
                {!isPreparedCaster && pools.freeSchoolSlots > 0 && (
                  <button
                    style={{
                      marginRight: "0.5rem",
                      background: pools.freeSchoolDesignated.includes(spell.id)
                        ? "#6b48ff"
                        : "transparent",
                      color: pools.freeSchoolDesignated.includes(spell.id)
                        ? "white"
                        : "#6b48ff",
                      border: "1px solid #6b48ff",
                      borderRadius: "4px",
                      padding: "2px 8px",
                      cursor:
                        !pools.freeSchoolDesignated.includes(spell.id) &&
                        pools.freeSchoolDesignated.length >= pools.freeSchoolSlots
                          ? "not-allowed"
                          : "pointer",
                    }}
                    disabled={
                      !pools.freeSchoolDesignated.includes(spell.id) &&
                      pools.freeSchoolDesignated.length >= pools.freeSchoolSlots
                    }
                    onClick={() =>
                      pools.freeSchoolDesignated.includes(spell.id)
                        ? undesignateFreeSchoolSpell(spell.id)
                        : designateFreeSchoolSpell(spell.id)
                    }
                  >
                    Free ✦
                  </button>
                )}

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

      {/* --- Domain / Always-Prepared Spells --- */}
      {pools.bonusPrepared.length > 0 && (
        <div className="domain-spells-list">
          <h3 style={{ marginBottom: "0.5rem" }}>Domain Spells (Always Prepared)</h3>
          {pools.bonusPrepared.map((spellId) => {
            const spell = getSpellByID(spellId);
            if (!spell) return null;
            return (
              <div key={`domain-${spell.id}`} className="spell-card domain-spell-card">
                <div className="spell-card-header">
                  <strong>{spell.name}</strong>
                  <span className="spell-tags">
                    <span className="domain-badge">Domain</span>{" "}
                    {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`} -{" "}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
