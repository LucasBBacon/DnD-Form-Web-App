import { useMemo } from "react";
import { getFeatsByCategory } from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { Ability } from "../../types/common";
import { calculateTotalAbilityScore } from "../../utils/abilityUtils";
import { isFeatEligible } from "../../utils/featUtils";
import { resolveFixedAbilityBonusesFromTraits } from "../../utils/traitEffectResolvers";
import { getAllCharacterTraits } from "../../utils/traitUtils";

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

interface OriginFeatStepProps {
  onBack: () => void;
  onFinish: () => void;
}

export const OriginFeatStep: React.FC<OriginFeatStepProps> = ({
  onBack,
  onFinish,
}) => {
  const state = useCharacterStore();
  const { completeSetup, setOriginFeat } = state;

  const selectedOriginFeatId =
    state.acquiredFeats.find((entry) => entry.source === "origin")?.featId ??
    "";

  const ancestryTraits = getAllCharacterTraits(
    1,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    true,
    state.choicesByLevel,
    state.acquiredFeats,
    state.classTracks,
  );

  const fixedAncestryBonuses = useMemo(
    () => resolveFixedAbilityBonusesFromTraits(ancestryTraits, 1),
    [ancestryTraits],
  );

  const totalScores = useMemo(() => {
    return ABILITIES.reduce(
      (acc, ability) => {
        acc[ability] = calculateTotalAbilityScore(
          ability,
          state.baseAbilityScores[ability],
          fixedAncestryBonuses,
          state.chosenRacialBonuses,
          0,
        );
        return acc;
      },
      {} as Record<Ability, number>,
    );
  }, [fixedAncestryBonuses, state.baseAbilityScores, state.chosenRacialBonuses]);

  const eligibleOriginFeats = useMemo(() => {
    return getFeatsByCategory("origin").filter((feat) =>
      isFeatEligible(feat, {
        level: 1,
        raceId: state.raceId,
        subraceId: state.subraceId,
        classId: state.classId,
        subclassId: state.subclassId,
        totalScores,
        choicesByLevel: state.choicesByLevel,
        acquiredFeats: state.acquiredFeats,
      }),
    );
  }, [
    state.acquiredFeats,
    state.choicesByLevel,
    state.classId,
    state.raceId,
    state.subclassId,
    state.subraceId,
    totalScores,
  ]);

  const canFinalize =
    eligibleOriginFeats.length === 0 || selectedOriginFeatId.length > 0;

  const handleFinalize = () => {
    if (!canFinalize) return;
    completeSetup();
    onFinish();
  };

  return (
    <div className="wizard-step origin-feat-step">
      <h2>Choose an Origin Feat</h2>
      <p>
        Origin feats are selected during character creation and are separate from
        level-up feat choices.
      </p>

      {eligibleOriginFeats.length > 0 ? (
        <div className="choice-block">
          {eligibleOriginFeats.map((feat) => (
            <label key={feat.id} className="skill-checkbox">
              <input
                type="radio"
                name="origin_feat"
                checked={selectedOriginFeatId === feat.id}
                onChange={() => setOriginFeat(feat.id)}
              />
              <strong>{feat.name}</strong>
              <span> - {feat.lore.shortDescription}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="choice-block">
          <p>No eligible origin feats are available for this character.</p>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="button" onClick={onBack}>
          Back
        </button>
        <button type="button" onClick={handleFinalize} disabled={!canFinalize}>
          Finish and Generate Sheet
        </button>
      </div>
    </div>
  );
};