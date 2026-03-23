import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";

export const SpellSlotsTracker = () => {
  const { slotStatusByLevel } = useSpellcasting();
  const { expendSpellSlot, restoreSpellSlot } = useCharacterStore();

  return (
    <div className="spell-slots">
      {Object.entries(slotStatusByLevel).map(([level, slots]) => (
        <div key={level} className="slot-row">
          <span>Level {level} Slots:</span>

          <div className="checkboxes">
            {slots.map((isUsed, index) => (
              <input
                key={index}
                type="checkbox"
                checked={isUsed}
                onChange={() =>
                  isUsed
                    ? restoreSpellSlot(Number(level))
                    : expendSpellSlot(Number(level))
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
