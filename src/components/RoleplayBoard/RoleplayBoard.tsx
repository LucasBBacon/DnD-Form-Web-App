import type React from "react";
import { useMemo, useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore.ts";
import { getAllCharacterTraitsWithSources } from "../../utils/traitUtils.ts";
import { RoleplayBoardView } from "./RoleplayBoardView.tsx";
import type {
  RoleplayField,
  RoleplayFeature,
  RoleplayTab,
} from "./RoleplayBoardView.tsx";

export const RoleplayBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RoleplayTab>("biography");
  const level = useCharacterStore((state) => state.level);
  const raceId = useCharacterStore((state) => state.raceId);
  const subraceId = useCharacterStore((state) => state.subraceId);
  const classId = useCharacterStore((state) => state.classId);
  const subclassId = useCharacterStore((state) => state.subclassId);
  const choicesByLevel = useCharacterStore((state) => state.choicesByLevel);
  const acquiredFeats = useCharacterStore((state) => state.acquiredFeats);
  const classTracks = useCharacterStore((state) => state.classTracks);

  const personalityTraits = useCharacterStore((state) => state.personalityTraits);
  const ideals = useCharacterStore((state) => state.ideals);
  const bonds = useCharacterStore((state) => state.bonds);
  const flaws = useCharacterStore((state) => state.flaws);
  const age = useCharacterStore((state) => state.age);
  const height = useCharacterStore((state) => state.height);
  const weight = useCharacterStore((state) => state.weight);
  const eyes = useCharacterStore((state) => state.eyes);
  const skin = useCharacterStore((state) => state.skin);
  const hair = useCharacterStore((state) => state.hair);
  const appearance = useCharacterStore((state) => state.appearance);
  const backstory = useCharacterStore((state) => state.backstory);
  const alliesAndOrganizations = useCharacterStore(
    (state) => state.alliesAndOrganizations,
  );

  const updateRoleplayField = useCharacterStore(
    (state) => state.updateRoleplayField,
  );

  const activeFeatures = useMemo<RoleplayFeature[]>(() => {
    return getAllCharacterTraitsWithSources(
      level,
      raceId,
      subraceId,
      classId,
      subclassId,
      false,
      choicesByLevel,
      acquiredFeats,
      classTracks,
    ).map(({ trait, sources }, index) => ({
      id: `${trait.id}-${index}`,
      name: trait.name,
      description: trait.lore.shortDescription ?? "",
      sources: sources.map((source) => ({
        key: `${trait.id}-${source.kind}-${source.sourceId ?? source.label}-${source.level ?? 0}`,
        kind: source.kind,
        label: source.label,
      })),
    }));
  }, [
    acquiredFeats,
    choicesByLevel,
    classId,
    classTracks,
    level,
    raceId,
    subclassId,
    subraceId,
  ]);

  const roleplayValues: Record<RoleplayField, string> = {
    personalityTraits,
    ideals,
    bonds,
    flaws,
    age,
    height,
    weight,
    eyes,
    skin,
    hair,
    appearance,
    backstory,
    alliesAndOrganizations,
  };

  const handleTextBlur = (field: RoleplayField, value: string) => {
    if (roleplayValues[field] !== value) {
      updateRoleplayField(field, value);
    }
  };

  return (
    <RoleplayBoardView
      activeTab={activeTab}
      features={activeFeatures}
      characteristics={{
        personalityTraits,
        ideals,
        bonds,
        flaws,
      }}
      biography={{
        age,
        height,
        weight,
        eyes,
        skin,
        hair,
        appearance,
        backstory,
        alliesAndOrganizations,
      }}
      onTabChange={setActiveTab}
      onRoleplayFieldBlur={handleTextBlur}
    />
  );
};
