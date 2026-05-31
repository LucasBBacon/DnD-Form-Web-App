import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeatureCard } from "./FeatureCard";

const meta: Meta<typeof FeatureCard> = {
  title: "RoleplayBoard/FeatureCard",
  component: FeatureCard,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof FeatureCard>;

export const RaceFeature: Story = {
  args: {
    traitId: "trait_darkvision_60",
    name: "Darkvision",
    sources: [{ key: "race-elf", kind: "race", label: "Elf" }],
    lore: {
      shortDescription:
        "You can see in dim light within 60 feet of you as if it were bright light.",
      fullText:
        "Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.",
    },
  },
};

export const ClassFeature: Story = {
  args: {
    traitId: "trait_rage",
    name: "Rage",
    sources: [
      { key: "class-barbarian-1", kind: "class", label: "Barbarian 1" },
    ],
    lore: {
      shortDescription: "In battle, you fight with primal ferocity.",
      fullText:
        "In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain the following benefits if you aren't wearing heavy armor:\n- You have advantage on Strength checks and Strength saving throws.\n- When you make a melee weapon attack using Strength, you gain a bonus to the damage roll that increases as you gain levels as a barbarian, as shown in the Rage Damage column of the Barbarian table.\n- You have resistance to bludgeoning, piercing, and slashing damage.\nIf you end your rage on your turn, it ends early. You can also end your rage on your turn as a bonus action. Once you have raged the number of times shown for your barbarian level in the Rages column of the Barbarian table, you must finish a long rest before you can rage again.",
    },
    uses: {
      maxCount: 2,
      resetCondition: "long_rest",
      currentUses: 1,
    },
  },
};

export const MultipleSourceBadges: Story = {
  args: {
    traitId: "trait_extra_attack",
    name: "Extra Attack",
    sources: [
      { key: "class-fighter-5", kind: "class", label: "Fighter 5" },
      { key: "feat-warcaster", kind: "feat", label: "War Caster" },
    ],
    lore: {
      shortDescription:
        "You can attack twice, instead of once, whenever you take the Attack action.",
      fullText:
        "Beginning at 5th level, you can attack twice, instead of once, whenever you take the Attack action on your turn. The Extra Attack feature improves when you reach certain levels in the fighter class, as shown in the table below. The number of attacks increases to three attacks per Attack action at 11th level and to four attacks per Attack action at 20th level.",
    },
    uses: {
      maxCount: 1,
      resetCondition: "turn",
      currentUses: 0,
    },
  },
};
