type ProficiencyCategory = "Armor" | "Weapon" | "Tool" | "Languages & Other";

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
            return { category: "Weapon", key: targetId };
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
            category: "Weapon",
            toolLabel: toTitleCase(targetId.replace("weapon_", "")),
        };
    }

    if (targetId.startsWith("tool_")) {
        return {
            category: "Tool",
            toolLabel: toTitleCase(targetId.replace("tool_", "")),
        };
    }

    if (targetId.startsWith("category_")) {
        const categoryName = targetId.replace("category_", "");
        if (categoryName === "artisans_tools") {
            return { category: "Tool", toolLabel: "Artisan's Tools" };
        }
        if (categoryName === "musical_instrument") {
            return { category: "Tool", toolLabel: "Musical Instrument" };
        }

        return { category: "Languages & Other", toolLabel: toTitleCase(categoryName) };
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