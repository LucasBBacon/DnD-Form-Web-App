import { getClassById } from "../../data/staticDataApi";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { HitDie } from "../../types/common";
import type { RestType } from "../../store/useCharacterStore";
import { ShortRestModalView } from "./ShortRestModalView";

// #region Interface

interface ShortRestModalProps {
  /** The type of rest being taken (short or long) */
  restType?: RestType;
  /** Callback function to close the modal */
  onClose: () => void;
}

// #endregion

// #region Component

export const ShortRestModal: React.FC<ShortRestModalProps> = ({
  restType = "short",
  onClose,
}) => {
  const {
    level,
    classId,
    expendedHitDice,
    expendHitDie,
    heal,
    takeShortRest,
    takeLongRest,
  } = useCharacterStore();

  // Pull Con mod and current HP state
  const { abilities, combat } = useCharacterStats();
  const conMod = abilities.modifiers.con;

  const classData = classId ? getClassById(classId) : null;
  const hitDie: HitDie = classData?.hitDie ?? 6; // Fallback to d6 if no class

  const availableDice = Math.max(0, level - expendedHitDice);

  // Actions

  const handleFinishRest = () => {
    takeShortRest(); // Warlocks should get pact slots back
    onClose();
  };

  const handleConfirmLongRest = () => {
    takeLongRest();
    onClose();
  };

  const recoveredHitDice = Math.max(1, Math.floor(level / 2));
  return (
    <ShortRestModalView
      restType={restType}
      onClose={onClose}
      hpCurrent={combat.hp.current}
      hpMax={combat.hp.max}
      availableDice={availableDice}
      hitDie={hitDie}
      conMod={conMod}
      recoveredHitDice={recoveredHitDice}
      onApplyHitDie={(totalHeal) => {
        heal(totalHeal);
        expendHitDie();
      }}
      onFinishShortRest={handleFinishRest}
      onConfirmLongRest={handleConfirmLongRest}
    />
  );
};

// #endregion
