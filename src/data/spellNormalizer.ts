import type { SpellActionType, SpellData, SpellRawData, SpellRange } from "../types/spell";

const CASTING_TIME_LABELS: Record<SpellActionType, string> = {
  action: "1 action",
  bonus_action: "1 bonus action",
  reaction: "1 reaction",
  legendary_action: "1 legendary action",
  special: "Special",
  minute: "1 minute",
  hour: "1 hour",
};

const formatRange = (range: SpellRange): string => {
  switch (range.type) {
    case "self":
      return "Self";
    case "touch":
      return "Touch";
    case "sight":
      return "Sight";
    case "unlimited":
      return "Unlimited";
    case "ranged": {
      const hasDistance = typeof range.distance === "number";
      const hasMaxDistance = typeof range.maxDistance === "number";

      if (hasDistance && hasMaxDistance) {
        return `${range.distance}/${range.maxDistance} feet`;
      }

      if (hasDistance) {
        return `${range.distance} feet`;
      }

      return "Ranged";
    }
    default:
      return "Special";
  }
};

export const normalizeSpell = (rawSpell: SpellRawData): SpellData => {
  const castingTime = CASTING_TIME_LABELS[rawSpell.actionType] ?? "Special";

  return {
    ...rawSpell,
    castingTime,
    range: formatRange(rawSpell.range),
  };
};

export const normalizeSpells = (rawSpells: SpellRawData[]): SpellData[] => {
  return rawSpells.map(normalizeSpell);
};
