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

  // filter spells so dropdown only shows spells for THIS class
  const availableClassSpells = getAllSpells().filter(
    (spell) => classId && spell.classes.includes(classId),
  );

  const handleAddSpell = () => {
    if (!selectedSpellId) return;
    isPreparedCaster
      ? prepareSpell(selectedSpellId)
      : learnSpell(selectedSpellId);
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

      {/* --- Innate Spells --- */}
      {innateSpells && innateSpells.length > 0 && (
        <div className="innate-spells-block">
          <h3>Innate Magic and Traits</h3>
          <ul className="innate-spell-list">
            {innateSpells.map((innate, idx) => (
              <li key={`innate-${idx}`} className="spell-row">
                <div className="spell-info">
                  <strong>
                    {/* TODO: Fetch Spell Name by innate.spellId */}
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
                  <span>{spell.casting_time}</span>
                  <span>{spell.range}</span>
                  <span>
                    {spell.duration} {spell.concentration && "(C)"}
                  </span>
                </div>

                <p className="spell-lore">{spell.lore.short_description}</p>

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
