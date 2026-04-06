type ProficiencyCategory = "Armor" | "Weapons" | "Tools" | "Languages & Other";

export const formatAbilityModifier = (value: number): string => {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return "0";
};

const toTitleCase = (value: string): string => {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const normalizeLegacyTarget = (
  targetId: string,
): { category: ProficiencyCategory; key: string } | null => {
  switch (targetId) {
    case "light":
    case "medium":
    case "heavy":
    case "shield":
      return { category: "Armor", key: targetId };
    case "simple":
    case "martial":
      return { category: "Weapons", key: targetId };
    default:
      return null;
  }
};

export const formatClassTraitProficiency = (
  targetId: string,
): { category: ProficiencyCategory; toolLabel: string } => {
  if (targetId.startsWith("armor_")) {
    return {
      category: "Armor",
      toolLabel: toTitleCase(targetId.replace("armor_", "")),
    };
  }

  if (targetId.startsWith("weapon_")) {
    return {
      category: "Weapons",
      toolLabel: toTitleCase(targetId.replace("weapon_", "")),
    };
  }

  if (targetId.startsWith("tool_")) {
    return {
      category: "Tools",
      toolLabel: toTitleCase(targetId.replace("tool_", "")),
    };
  }

  if (targetId.startsWith("category_")) {
    const categoryName = targetId.replace("category_", "");
    if (categoryName === "artisans_tools") {
      return { category: "Tools", toolLabel: "Artisan's Tools" };
    }
    if (categoryName === "musical_instrument") {
      return { category: "Tools", toolLabel: "Musical Instrument" };
    }

    return {
      category: "Languages & Other",
      toolLabel: toTitleCase(categoryName),
    };
  }

  const legacyTarget = normalizeLegacyTarget(targetId);
  if (legacyTarget) {
    return {
      category: legacyTarget.category,
      toolLabel: toTitleCase(legacyTarget.key),
    };
  }

  return { category: "Languages & Other", toolLabel: toTitleCase(targetId) };
};

export const formatProficiency = (
  targetId: string,
): { category: string; label: string } => {
  const { category, toolLabel } = formatClassTraitProficiency(targetId);
  return { category, label: toolLabel };
};
