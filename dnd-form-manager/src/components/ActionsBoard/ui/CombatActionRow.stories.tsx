import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CombatActionRow } from "./CombatActionRow";
import type {
  AttackActionEntry,
  SpellSaveActionEntry,
  TraitUseActionEntry,
} from "./CombatActionRow";

const toRomanNumeral = (level: number): string =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] ??
  level.toString();

const longswordAttack: AttackActionEntry = {
  id: "attack-longsword",
  name: "Longsword",
  section: "attack",
  source: "attack",
  isExhausted: false,
  subtitle: "Melee weapon attack",
  quickStats: ["+5 to hit", "1d8 + 3 slashing"],
  attackRoll: {
    id: "atk-longsword",
    count: 1,
    sides: 20,
    modifier: 5,
    label: "To Hit",
  },
  damageRolls: [
    {
      id: "dmg-longsword",
      count: 1,
      sides: 8,
      modifier: 3,
      label: "Slashing",
    },
  ],
};

const fireballSpell: SpellSaveActionEntry = {
  id: "spell-fireball",
  name: "Fireball",
  section: "spell",
  source: "spell",
  isExhausted: false,
  subtitle: "3rd-level evocation",
  quickStats: ["8d6 fire", "Dex save"],
  spellLevel: 3,
  spellCast: {
    canCast: true,
    canUseSharedSlot: true,
    canUsePactSlot: false,
  },
  attackRoll: {
    id: "atk-fireball",
    count: 1,
    sides: 20,
    modifier: 7,
    label: "Spell Attack",
  },
  damageRolls: [
    {
      id: "dmg-fireball",
      count: 8,
      sides: 6,
      modifier: 0,
      label: "Fire Damage",
    },
  ],
};

const holdPersonSpellUnavailable: SpellSaveActionEntry = {
  id: "spell-hold-person",
  name: "Hold Person",
  section: "spell",
  source: "spell",
  isExhausted: true,
  subtitle: "2nd-level enchantment",
  quickStats: ["Wis save", "Humanoid"],
  spellLevel: 2,
  spellCast: {
    canCast: false,
    canUseSharedSlot: false,
    canUsePactSlot: false,
    unavailableReason: "No spell slots remaining",
  },
};

const rageTrait: TraitUseActionEntry = {
  id: "trait-rage",
  name: "Rage",
  section: "trait",
  source: "trait",
  isExhausted: false,
  subtitle: "Enter a furious state",
  quickStats: ["Bonus damage", "Resistance"],
  uses: {
    total: 3,
    remaining: 2,
  },
};

const exhaustedTrait: TraitUseActionEntry = {
  id: "trait-second-wind",
  name: "Second Wind",
  section: "trait",
  source: "trait",
  isExhausted: true,
  subtitle: "Regain hit points",
  quickStats: ["1/rest"],
  uses: {
    total: 1,
    remaining: 0,
  },
};

const meta: Meta<typeof CombatActionRow> = {
  title: "ActionsBoard/CombatActionRow",
  component: CombatActionRow,
  tags: ["autodocs"],
  args: {
    attackRollMode: "normal",
    onAttackRollModeChange: fn(),
    onAttackResult: fn(),
    onDamageResult: fn(),
    onCastSpell: fn(),
    onExpendTraitUse: fn(),
    toRomanNumeral,
  },
};
export default meta;

type Story = StoryObj<typeof CombatActionRow>;

export const AttackNormal: Story = {
  args: {
    entry: longswordAttack,
    attackRollMode: "normal",
  },
};

export const AttackAdvantage: Story = {
  args: {
    entry: longswordAttack,
    attackRollMode: "advantage",
  },
};

export const AttackDisadvantage: Story = {
  args: {
    entry: longswordAttack,
    attackRollMode: "disadvantage",
  },
};

export const SpellCastAndRoll: Story = {
  args: {
    entry: fireballSpell,
  },
};

export const SpellUnavailable: Story = {
  args: {
    entry: holdPersonSpellUnavailable,
  },
};

export const TraitWithUsesRemaining: Story = {
  args: {
    entry: rageTrait,
  },
};

export const TraitExhausted: Story = {
  args: {
    entry: exhaustedTrait,
  },
};

export const TraitWithoutUsesTracker: Story = {
  args: {
    entry: {
      id: "trait-cunning-action",
      name: "Cunning Action",
      section: "trait",
      source: "trait",
      isExhausted: false,
      subtitle: "Dash, Disengage, or Hide",
      quickStats: ["Bonus action"],
    } as TraitUseActionEntry,
  },
};

export const Playground: Story = {
  args: {
    entry: longswordAttack,
  },
};
