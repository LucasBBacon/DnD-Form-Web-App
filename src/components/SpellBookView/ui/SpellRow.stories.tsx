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

const hexSpell = {
  id: "hex",
  name: "Hex",
  level: 1,
  school: "enchantment" as SpellSchool,
  castingTime: "1 bonus action",
  range: "90 feet",
  duration: "1 hour",
  concentration: true,
  ritual: false,
  classes: ["warlock"],
  components: {
    vocal: true,
    somatic: true,
    material: true,
    materialMaterials: "The petrified eye of a newt.",
  },
  lore: {
    shortDescription: "Curse a creature to deal extra damage and hinder one ability.",
    fullText:
      "You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an attack roll.",
    higherLevel:
      "Your Concentration can last longer with a spell slot of level 2 (up to 4 hours), 3-4 (up to 8 hours), or 5+ (24 hours).",
  },
  output: {
    damage: [{ roll: "1d6", type: "necrotic" }],
  },
};

const dominateBeastSpell = {
  id: "dominate_beast",
  name: "Dominate Beast",
  level: 4,
  school: "enchantment" as SpellSchool,
  castingTime: "1 action",
  range: "60 feet",
  duration: "1 minute",
  concentration: true,
  ritual: false,
  classes: ["druid", "ranger", "sorcerer"],
  components: {
    vocal: true,
    somatic: true,
    material: false,
  },
  lore: {
    shortDescription: "Beguile a beast, controlling its actions and movements.",
    fullText:
      "You attempt to beguile a beast that you can see within range. It must succeed on a Wisdom saving throw or be charmed by you for the duration.",
    higherLevel:
      "When you cast this spell with a 5th-level spell slot, the duration is concentration, up to 10 minutes. When you use a 6th-level spell slot, the duration is concentration, up to 1 hour. When you use a spell slot of 7th level or higher, the duration is concentration, up to 8 hours",
  },
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
    proseUpcastEffects: [],
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
    proseUpcastEffects: [],
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
    proseUpcastEffects: [],
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
        spellName: "Fireball",
        isResolvedSpell: true,
        sourceTraitName: "Dragon Ancestry",
        spellSaveDC: 15,
        spellAttackBonus: 5,
        uses: { count: 1, reset: "long_rest" },
      },
    ],
    hasDamageOutput: true,
    proseUpcastEffects: [],
  },
};

export const WithSingleProseUpcastEffect: Story = {
  args: {
    spell: hexSpell,
    eligible: true,
    isExpanded: true,
    classNames: ["Warlock"],
    castingStats: { saveDC: 15, attackBonus: 7 },
    innateEntries: [],
    hasDamageOutput: true,
    proseUpcastEffects: [
      {
        level: 2,
        description:
          "When you cast this spell using a 2nd-level spell slot, your concentration can last up to 4 hours.",
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a single structured upcast entry alongside the spell's existing higher-level prose.",
      },
    },
  },
};

export const WithSteppedProseUpcastEffects: Story = {
  args: {
    spell: dominateBeastSpell,
    eligible: true,
    isExpanded: true,
    classNames: ["Druid", "Ranger", "Sorcerer"],
    castingStats: { saveDC: 15, attackBonus: 7 },
    innateEntries: [],
    hasDamageOutput: false,
    proseUpcastEffects: [
      {
        level: 5,
        description:
          "When you cast this spell with a 5th-level spell slot, the duration is concentration, up to 10 minutes.",
      },
      {
        level: 6,
        description:
          "When you use a 6th-level spell slot, the duration is concentration, up to 1 hour.",
      },
      {
        level: 7,
        description:
          "When you use a spell slot of 7th level or higher, the duration is concentration, up to 8 hours.",
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a stepped set of threshold-based prose effects, mirroring the spells that scale by higher slot levels.",
      },
    },
  },
};
