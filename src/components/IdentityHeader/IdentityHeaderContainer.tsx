import type React from "react";
import { useMemo } from "react";
import { getClassById, getRaceById, getSubclassById } from "../../data/staticDataApi";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAvailableLevelUpTargetForCharacter } from "../../utils/levelAvailabilityUtils";
import { IdentityHeader, type CharacterClassEntry } from "./IdentityHeader";

const formatDisplayNameFromId = (id: string | null): string => {
  if (!id) return "";
  return id
    .replace(/^(background|race|subrace|class|subclass)_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const IdentityHeaderContainer: React.FC = () => {
  const name = useCharacterStore((state) => state.name);
  const playerName = useCharacterStore((state) => state.playerName);
  const alignment = useCharacterStore((state) => state.alignment);
  const xp = useCharacterStore((state) => state.xp);
  const level = useCharacterStore((state) => state.level);
  const levelUpMode = useCharacterStore((state) => state.levelUpMode);
  const raceId = useCharacterStore((state) => state.raceId);
  const backgroundId = useCharacterStore((state) => state.backgroundId);
  const classId = useCharacterStore((state) => state.classId);
  const subclassId = useCharacterStore((state) => state.subclassId);
  const classTracks = useCharacterStore((state) => state.classTracks);
  const choicesByLevel = useCharacterStore((state) => state.choicesByLevel);

  const setName = useCharacterStore((state) => state.setName);
  const setPlayerName = useCharacterStore((state) => state.setPlayerName);
  const setAlignment = useCharacterStore((state) => state.setAlignment);
  const setXp = useCharacterStore((state) => state.setXp);
  const setLevelUpMode = useCharacterStore((state) => state.setLevelUpMode);
  const openLevelUpModal = useCharacterStore((state) => state.openLevelUpModal);

  const classes = useMemo<CharacterClassEntry[]>(() => {
    if (classTracks.length > 0) {
      return classTracks.map((track) => {
        const classData = getClassById(track.classId);
        const subclassData = track.subclassId
          ? getSubclassById(track.subclassId)
          : null;

        return {
          classId: track.classId,
          className: classData?.name ?? formatDisplayNameFromId(track.classId),
          subclassName: subclassData?.name,
          level: track.level,
        };
      });
    }

    if (!classId) return [];

    const classData = getClassById(classId);
    const subclassData = subclassId
      ? getSubclassById(subclassId)
      : null;

    return [
      {
        classId,
        className: classData?.name ?? formatDisplayNameFromId(classId),
        subclassName: subclassData?.name,
        level,
      },
    ];
  }, [classId, classTracks, level, subclassId]);

  const raceNameDisplay = useMemo(() => {
    const raceData = getRaceById(raceId);
    return raceData?.name ?? formatDisplayNameFromId(raceId);
  }, [raceId]);

  const backgroundNameDisplay = useMemo(() => {
    return formatDisplayNameFromId(backgroundId);
  }, [backgroundId]);

  const openLevelUpFromHeader = () => {
    const targetLevel = getAvailableLevelUpTargetForCharacter({
      xp,
      level,
      levelUpMode,
      classTracks,
      choicesByLevel,
    });

    if (targetLevel !== null) {
      openLevelUpModal(targetLevel);
    }
  };

  return (
    <IdentityHeader
      characterName={name}
      playerName={playerName}
      alignment={alignment}
      classes={classes}
      raceNameDisplay={raceNameDisplay}
      backgroundNameDisplay={backgroundNameDisplay}
      xp={xp}
      levelUpMode={levelUpMode}
      onCharacterNameChange={setName}
      onPlayerNameChange={setPlayerName}
      onAlignmentChange={setAlignment}
      onXpChange={setXp}
      onLevelUpModeChange={setLevelUpMode}
      onClassModalClick={openLevelUpFromHeader}
      onBackgroundModalClick={() => {}}
      onRaceModalClick={() => {}}
    />
  );
};
