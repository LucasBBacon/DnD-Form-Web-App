import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";

export const SpellSlotsTracker = () => {
  const { isSpellcaster, slotStatusByLevel, pactMagicInfo } = useSpellcasting();
  const { expendSpellSlot, expendPactSlot } = useCharacterStore();

  if (!isSpellcaster) return null;

  return (
    <div className="spell-slots">
      <h3>Spell Slots</h3>

      {/* Warlock Pact Magic */}
      {pactMagicInfo ? (
        <div className="pact-magic-block">
          <div className="slot-header">
            <span>Pact Slots</span>
            <span className="slot-level-tag">Level {pactMagicInfo.level}</span>
          </div>

          <div className="checkbox-row">
            {Array.from({ length: pactMagicInfo.total }).map((_, idx) => {
              const isExpended = idx < pactMagicInfo.expended;
              return (
                <button
                  key={`pact-${idx}`}
                  className={`slot-checkbox ${isExpended ? "expended" : "available"}`}
                  onClick={() => !isExpended && expendPactSlot()}
                  disabled={isExpended}
                  title="Pact slots refresh on a Short Rest"
                />
              );
            })}
          </div>
          <small className="help-text">Refreshes on a Short Rest.</small>
        </div>
      ) : (
        /* Standard Spellcasting */
        <div className="standard-slots-grid">
          {Object.entries(slotStatusByLevel).map(([level, data]) => (
            <div key={level} className="slot-row">
              <span>Level {level} Slots:</span>

              <div className="checkboxes">
                {Array.from({ length: data.total }).map((_, idx) => {
                  const isExpended = idx < data.expended;
                  return (
                    <button
                      key={`spell-${level}-${idx}`}
                      className={`slot-checkbox ${isExpended ? "expended" : "available"}`}
                      onClick={() =>
                        !isExpended && expendSpellSlot(Number(level))
                      }
                      disabled={isExpended}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          <small className="help-text">Refreshes on a Long Rest.</small>
        </div>
      )}
    </div>
  );
};
