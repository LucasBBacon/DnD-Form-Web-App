import type React from "react";
import { useMemo } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllCharacterTraitsWithSources } from "../../utils/traitUtils";
import { FeaturesBoard } from "./FeaturesBoard";
import type { FeatureCardProps } from "./ui/FeatureCard";

export const FeaturesBoardContainer: React.FC = () => {
  const store = useCharacterStore();

  const features = useMemo<FeatureCardProps[]>(() => {
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
    ).map(({ trait, sources }) => ({
      traitId: trait.id,
      name: trait.name,
      sources: sources.map((source) => ({
        key: `${trait.id}-${source.kind}-${source.sourceId ?? source.label}-${source.level ?? 0}`,
        kind: source.kind,
        label: source.label,
      })),
      lore: {
        shortDescription: trait.lore.shortDescription,
        fullText: trait.lore.fullText,
      },
    }));
  }, [
    store.acquiredFeats,
    store.choicesByLevel,
    store.classId,
    store.classTracks,
    store.level,
    store.raceId,
    store.subclassId,
    store.subraceId,
  ]);

  return <FeaturesBoard features={features} />;
};
