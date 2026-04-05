import { useMemo, useState } from "react";
import {
  getAllClasses,
  getClassById,
  getSubclassById,
  getSubclassesForClass,
} from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import type { LevelChoice } from "../../types/progression";
import { getLevelUpRequirements } from "../../utils/levelUpUtils";
import { rollDice } from "../../utils/dice";
import type { DiceRoll, DieFace } from "../../types/common";
import { ASIChoiceBlock } from "./ASIChoiceBlock";
import { SkillChoiceBlock } from "./SkillChoiceBlock";

interface LevelUpModalProps {
  targetLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  targetLevel,
  onClose,
}) => {
  // Fetch from zustand
  const {
    raceId,
    subraceId,
    classId,
    subclassId,
    classTracks,
    choicesByLevel,
    setLevel,
    updateLevelChoice,
    setSubclass,
    setClassTrackLevel,
    setClassTrackSubclass,
    addClassTrack,
  } = useCharacterStore();

  const allClasses = getAllClasses();
  const MULTICLASS_OPTION = "__add_multiclass__";

  const selectableClassIds = useMemo(() => {
    if (classTracks.length > 0) {
      return classTracks.map((track) => track.classId);
    }

    return classId ? [classId] : [];
  }, [classId, classTracks]);

  const [selectedClassId, setSelectedClassId] = useState<string>(
    classId || "",
  );
  const [selectedNewClassId, setSelectedNewClassId] = useState<string>("");

  const isAddingNewClass = selectedClassId === MULTICLASS_OPTION;
  const activeClassId = isAddingNewClass
    ? selectedNewClassId || null
    : selectedClassId || classId;
  const activeClassTrack = classTracks.find(
    (track) => track.classId === activeClassId,
  );

  const availableMulticlassOptions = useMemo(
    () =>
      allClasses.filter(
        (candidateClass) =>
          !selectableClassIds.includes(candidateClass.id),
      ),
    [allClasses, selectableClassIds],
  );

  const classData = activeClassId ? getClassById(activeClassId) : null;
  const activeSubclassId = activeClassTrack?.subclassId ?? subclassId;
  const subclassData = activeSubclassId ? getSubclassById(activeSubclassId) : null;
  const availableSubclasses = activeClassId
    ? getSubclassesForClass(activeClassId)
    : [];

  const projectedClassTracks = useMemo(() => {
    if (targetLevel === 1) {
      return classTracks;
    }

    if (!activeClassId) return classTracks;

    const existingTrack = classTracks.find((track) => track.classId === activeClassId);

    if (!existingTrack) {
      return [
        ...classTracks,
        {
          classId: activeClassId,
          subclassId: null,
          level: 1,
        },
      ];
    }

    const nextTracks = classTracks.map((track) =>
      track.classId === activeClassId
        ? { ...track, level: track.level + 1 }
        : track,
    );

    return nextTracks;
  }, [activeClassId, classTracks, targetLevel]);

  const projectedChoicesByLevel = useMemo(
    () => ({
      ...choicesByLevel,
      [targetLevel]: {
        ...(choicesByLevel[targetLevel] || {}),
        selectedClassId: activeClassId || undefined,
      },
    }),
    [activeClassId, choicesByLevel, targetLevel],
  );

  const targetClassLevel =
    targetLevel === 1 ? 1 : activeClassTrack ? activeClassTrack.level + 1 : 1;

  // Determine modules to render
  const requirements = getLevelUpRequirements(
    targetLevel,
    raceId,
    subraceId,
    classData,
    subclassData,
    targetClassLevel,
    projectedChoicesByLevel,
    projectedClassTracks,
  );

  // #region Draft State
  
  const [draftChoices, setDraftChoices] = useState<Partial<LevelChoice>>({});
  const [hpInputValue, setHpInputValue] = useState<string>("");
  
  // #endregion

  // #region Dynamic Validity States

  const [isAsiValid, setIsAsiValid] = useState(!requirements.requiresAsiOrFeat);
  const [isSkillsValid, setIsSkillsValid] = useState(!requirements.requiresSkillSelection);
  const [isHpValid, setIsHpValid] = useState(targetLevel === 1);

  const isClassSelectionValid =
    !isAddingNewClass || (isAddingNewClass && !!selectedNewClassId);
  
  // don't need local state for subclass/HP, just check if they are valid
  const isSubclassValid = !requirements.requiresSubclass || activeSubclassId !== null;
  
  // Master check
  const canFinalize =
    isClassSelectionValid && isAsiValid && isSkillsValid && isSubclassValid && isHpValid;

  // #endregion
  
  // #region Event Handlers

  const handleDraftUpdate = (updates: Partial<LevelChoice>, isValid: boolean, type: 'asi' | 'skills' | 'hp') => {
    setDraftChoices(prev => ({...prev, ...updates}));
    if (type === 'asi') setIsAsiValid(isValid);
    if (type === 'skills') setIsSkillsValid(isValid);
    if (type === 'hp') setIsHpValid(isValid);
  };

  const handleRollHp = () => {
    if (!classData?.hitDie) return;
    const diceRoll: DiceRoll = { count: 1, faces: classData.hitDie as DieFace };
    const result = rollDice(diceRoll);
    setHpInputValue(result.toString());
    handleDraftUpdate({ hpGained: result }, result > 0, 'hp');
  };

  const handleHpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHpInputValue(val);
    const numVal = Number(val);
    handleDraftUpdate({ hpGained: numVal }, numVal > 0, 'hp');
  };

  const handleSubclassChange = (nextSubclassId: string) => {
    if (!activeClassId) return;

    if (activeClassId === classId) {
      setSubclass(nextSubclassId);
    }

    setClassTrackSubclass(activeClassId, nextSubclassId);
  };

  const finalizeLevelUp = () => {
    const effectiveClassId = activeClassId || undefined;

    updateLevelChoice(targetLevel, {
      ...draftChoices,
      selectedClassId: effectiveClassId,
    });

    if (effectiveClassId) {
      const existingTrack = classTracks.find(
        (track) => track.classId === effectiveClassId,
      );

      if (existingTrack) {
        setClassTrackLevel(effectiveClassId, existingTrack.level + 1);
      } else {
        addClassTrack(effectiveClassId, 1);
      }
    }

    setLevel(targetLevel);
    onClose();
  };

  // #endregion

  return (
    <div className="modal level-up-wizard">
      <h2>
        {targetLevel === 1
          ? "Finalize Character Creation"
          : `Leveling up to ${targetLevel}!`}
      </h2>

        {targetLevel > 1 && (
        <div className="choice-block">
          <h3>Choose the class that gains this level</h3>
          <select
              value={isAddingNewClass ? MULTICLASS_OPTION : activeClassId || ""}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                if (e.target.value !== MULTICLASS_OPTION) {
                  setSelectedNewClassId("");
                }
              }}
          >
            {selectableClassIds.map((id) => {
              const data = getClassById(id);
              const currentTrack = classTracks.find((track) => track.classId === id);
              const trackLevel = currentTrack?.level || 0;

              return (
                <option key={id} value={id}>
                  {data?.name || id} (current class level {trackLevel})
                </option>
              );
            })}

            {availableMulticlassOptions.length > 0 && (
              <option value={MULTICLASS_OPTION}>Add New Class (Multiclass)</option>
            )}
          </select>

          {isAddingNewClass && (
            <select
              value={selectedNewClassId}
              onChange={(e) => setSelectedNewClassId(e.target.value)}
            >
              <option value="" disabled>
                Select a class to add...
              </option>
              {availableMulticlassOptions.map((availableClass) => (
                <option key={availableClass.id} value={availableClass.id}>
                  {availableClass.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Render subclass picker if required */}
      {requirements.requiresSubclass && activeClassId && (
        <div className="choice-block">
          <h3>Choose your Martial Archetype</h3>
          <select
            value={activeSubclassId || ""}
            onChange={(e) => handleSubclassChange(e.target.value)}
          >
            <option value="" disabled>
              Select an archetype...
            </option>
            {availableSubclasses.map((subclass) => (
              <option key={subclass.id} value={subclass.id}>
                {subclass.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Render Skill picker if required */}
      {requirements.requiresSkillSelection && (
        <SkillChoiceBlock
          level={targetLevel}
          classIdOverride={activeClassId}
          subclassIdOverride={activeSubclassId}
          choicesByLevelOverride={projectedChoicesByLevel}
          classTracksOverride={projectedClassTracks}
          onChange={(draft, isValid) => handleDraftUpdate(draft, isValid, 'skills')}
        />
      )}

      {/* Render ASI/Feat Picker if required */}
      {requirements.requiresAsiOrFeat && (
        <ASIChoiceBlock
          level={targetLevel}
          onChange={(draft, isValid) => handleDraftUpdate(draft, isValid, 'asi')}
        />
      )}

      {/* Render HP Roller (Required every level after 1) */}
      {targetLevel > 1 && (
        <div className="choice-block">
          <h3>Roll for Hit Points</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button onClick={handleRollHp} type="button">
              Roll 1d{classData?.hitDie}
            </button>
            <input
              type="number"
              placeholder={`Enter HP (1d${classData?.hitDie})`}
              value={hpInputValue}
              onChange={handleHpInputChange}
            />
          </div>
        </div>
      )}

      <button
        className="finalize-btn"
        onClick={finalizeLevelUp}
        disabled={!canFinalize}
      >
        {targetLevel === 1 ? "Enter Game" : "Complete Level Up"}
      </button>
    </div>
  );
};
