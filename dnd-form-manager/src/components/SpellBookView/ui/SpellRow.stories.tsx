import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpellRow } from "./SpellRow";
import { fn } from "storybook/test";
import type { SpellSavingThrow, SpellSchool } from "../../../types/spell";

const basicSpell = {
  id: "fireball",
  name: "Fireball",
  level: 3,
  school: "evocation" as SpellSchool,
  castingTime: "1 action",
  range: "150 feet",
  duration: "Instantaneous",
  concentration: false,
  ritual: false,
  classes: ["wizard", "sorcerer"],
  components: {
    vocal: true,
    somatic: true,
    material: true,
    materialMaterials: "A tiny ball of bat guano and sulfur",
  },
  lore: {
    shortDescription: "A sphere of fire explodes at a point you choose.",
    fullText:
      "A bright streak flashes from your pointing finger to a point of your choice within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.",
    higherLevel:
      "When you cast this spell using a spell slot of 4th level or higher, the fire damage increases by 1d6 for each slot level above 3rd.",
  },
  savingThrow: {
      ability: "dex",
      dcCalculation: {
        base: 8,
        includeProficiency: true,
        modifierStat: "spellcasting",
      },
      onSave: "half_damage",
    } as SpellSavingThrow,
  output: { damage: [{ roll: "1d6", type: "fire", dice: "8d6" }] },
};

const meta: Meta<typeof SpellRow> = {
  title: "SpellBookView/SpellRow",
  component: SpellRow,
  tags: ["autodocs"],
  args: {
    onToggle: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof SpellRow>;

export const Collapsed: Story = {
  args: {
    spell: basicSpell,
    eligible: true,
    isExpanded: false,
    classNames: ["Sorcerer", "Wizard"],
    castingStats: { saveDC: 16, attackBonus: 6 },
    innateEntries: [],
    hasDamageOutput: true,
  },
};

export const Expanded: Story = {
  args: {
    spell: basicSpell,
    eligible: true,
    isExpanded: true,
    classNames: ["Sorcerer", "Wizard"],
    castingStats: { saveDC: 16, attackBonus: 6 },
    innateEntries: [],
    hasDamageOutput: true,
  },
};

export const NotEligible: Story = {
  args: {
    spell: basicSpell,
    eligible: false,
    isExpanded: false,
    classNames: ["Sorcerer", "Wizard"],
    castingStats: null,
    innateEntries: [],
    hasDamageOutput: true,
  },
};

export const WithInnateSource: Story = {
  args: {
    spell: basicSpell,
    eligible: true,
    isExpanded: true,
    classNames: ["Sorcerer"],
    castingStats: { saveDC: 15, attackBonus: 5 },
    innateEntries: [
      {
        spellId: "fireball",
        sourceTraitName: "Dragon Ancestry",
        spellSaveDC: 15,
        spellAttackBonus: 5,
        uses: { count: 1, reset: "long_rest" },
      },
    ],
    hasDamageOutput: true,
  },
};
