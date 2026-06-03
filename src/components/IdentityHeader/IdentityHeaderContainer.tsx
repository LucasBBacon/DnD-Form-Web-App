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
  const store = useCharacterStore();

  const classes = useMemo<CharacterClassEntry[]>(() => {
    if (store.classTracks.length > 0) {
      return store.classTracks.map((track) => {
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

    if (!store.classId) return [];

    const classData = getClassById(store.classId);
    const subclassData = store.subclassId
      ? getSubclassById(store.subclassId)
      : null;

    return [
      {
        classId: store.classId,
        className: classData?.name ?? formatDisplayNameFromId(store.classId),
        subclassName: subclassData?.name,
        level: store.level,
      },
    ];
  }, [store.classId, store.classTracks, store.level, store.subclassId]);

  const raceNameDisplay = useMemo(() => {
    const raceData = getRaceById(store.raceId);
    return raceData?.name ?? formatDisplayNameFromId(store.raceId);
  }, [store.raceId]);

  const backgroundNameDisplay = useMemo(() => {
    return formatDisplayNameFromId(store.backgroundId);
  }, [store.backgroundId]);

  const openLevelUpFromHeader = () => {
    const targetLevel = getAvailableLevelUpTargetForCharacter({
      xp: store.xp,
      level: store.level,
      levelUpMode: store.levelUpMode,
      classTracks: store.classTracks,
      choicesByLevel: store.choicesByLevel,
    });

    if (targetLevel !== null) {
      store.openLevelUpModal(targetLevel);
    }
  };

  return (
    <IdentityHeader
      characterName={store.name}
      playerName={store.playerName}
      alignment={store.alignment}
      classes={classes}
      raceNameDisplay={raceNameDisplay}
      backgroundNameDisplay={backgroundNameDisplay}
      xp={store.xp}
      levelUpMode={store.levelUpMode}
      onCharacterNameChange={store.setName}
      onPlayerNameChange={store.setPlayerName}
      onAlignmentChange={store.setAlignment}
      onXpChange={store.setXp}
      onLevelUpModeChange={store.setLevelUpMode}
      onClassModalClick={openLevelUpFromHeader}
      onBackgroundModalClick={() => {}}
      onRaceModalClick={() => {}}
    />
  );
};
