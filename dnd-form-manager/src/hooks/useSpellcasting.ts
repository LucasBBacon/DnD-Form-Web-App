import { getClassById, getSubclassById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";

export const useSpellcasting = () => {
    const { level, classId, subclassId, expendedSpellSlots, expendedPactSlots, spellsPrepared, spellsKnown } = useCharacterStore();

    const classData = classId ? getClassById(classId) : null;
    const subclassData = subclassId ? getSubclassById(subclassId) : null;

    // Find the total slots the character *should* have at this level
    // Assuming Class JSON has progression[level - 1].spellcasting_progression
    const currentProgression = classData?.progression.find(p => p.level === level);
    const totalSlots = currentProgression?.spellcasting_progression?.spell_slots || {};

    // Generate a clean array for the UI to render slot checkboxes
    // eg.g, Level 1: [true, true, false, false] (2 used, 2 available out of 4)
    const slotStatusByLevel: Record<number, boolean[]> = {};

    for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
        const maxSlotsForThisLevel = totalSlots[spellLevel] || 0;

        if (maxSlotsForThisLevel > 0) {
            const usedSlots = expendedSpellSlots[spellLevel] || 0;
            const statusArray = [];
            
            for (let i = 0; i < maxSlotsForThisLevel; i++) {
                // if i is less than used slots, this specific checkbox is checked
                statusArray.push(i < usedSlots);
            }

            slotStatusByLevel[spellLevel] = statusArray;
        }
    }

    // Return the data needed to build the spellbook UI
    return {
        spellcastingAbility: classData?.spellcasting_base?.ability,
        slotStatusByLevel,
        spellsPrepared,
        spellsKnown,
        // TODO: Add Pact Logic and spell save DC
    };
};