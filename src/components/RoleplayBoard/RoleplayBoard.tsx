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
  const store = useCharacterStore();

  const activeFeatures = useMemo<RoleplayFeature[]>(() => {
    return getAllCharacterTraitsWithSources(
      store.level,
      store.raceId,
      store.subraceId,
      store.classId,
      store.subclassId,
      false,
      store.choicesByLevel,
      store.acquiredFeats,
      store.classTracks,
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
  }, [store]);

  const roleplayValues: Record<RoleplayField, string> = {
    personalityTraits: store.personalityTraits,
    ideals: store.ideals,
    bonds: store.bonds,
    flaws: store.flaws,
    age: store.age,
    height: store.height,
    weight: store.weight,
    eyes: store.eyes,
    skin: store.skin,
    hair: store.hair,
    appearance: store.appearance,
    backstory: store.backstory,
    alliesAndOrganizations: store.alliesAndOrganizations,
  };

  const handleTextBlur = (field: RoleplayField, value: string) => {
    if (roleplayValues[field] !== value) {
      store.updateRoleplayField(field, value);
    }
  };

  return (
    <RoleplayBoardView
      activeTab={activeTab}
      features={activeFeatures}
      characteristics={{
        personalityTraits: store.personalityTraits,
        ideals: store.ideals,
        bonds: store.bonds,
        flaws: store.flaws,
      }}
      biography={{
        age: store.age,
        height: store.height,
        weight: store.weight,
        eyes: store.eyes,
        skin: store.skin,
        hair: store.hair,
        appearance: store.appearance,
        backstory: store.backstory,
        alliesAndOrganizations: store.alliesAndOrganizations,
      }}
      onTabChange={setActiveTab}
      onRoleplayFieldBlur={handleTextBlur}
    />
  );
};
