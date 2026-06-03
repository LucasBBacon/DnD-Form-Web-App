import type React from "react";
import { useMemo } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllCharacterTraitsWithSources } from "../../utils/traitUtils";
import { FeaturesBoard } from "./FeaturesBoard";
import type { FeatureCardProps } from "./ui/FeatureCard";

export const FeaturesBoardContainer: React.FC = () => {
  const level = useCharacterStore((state) => state.level);
  const raceId = useCharacterStore((state) => state.raceId);
  const subraceId = useCharacterStore((state) => state.subraceId);
  const classId = useCharacterStore((state) => state.classId);
  const subclassId = useCharacterStore((state) => state.subclassId);
  const choicesByLevel = useCharacterStore((state) => state.choicesByLevel);
  const acquiredFeats = useCharacterStore((state) => state.acquiredFeats);
  const classTracks = useCharacterStore((state) => state.classTracks);

  const features = useMemo<FeatureCardProps[]>(() => {
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
    acquiredFeats,
    choicesByLevel,
    classId,
    classTracks,
    level,
    raceId,
    subclassId,
    subraceId,
  ]);

  return <FeaturesBoard features={features} />;
};
