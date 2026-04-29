import { getAllCharacterTraits } from "../utils/traitUtils";
import { useCharacterStore } from "../store/useCharacterStore";
import { resolveGrantedActionsFromTraits } from "../utils/traitEffectResolvers";

export const useTraitActions = () => {
  const state = useCharacterStore();

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel,
    state.acquiredFeats,
    state.classTracks,
  );

  const actions = resolveGrantedActionsFromTraits(allTraits, state.level);

  return { actions };
};
