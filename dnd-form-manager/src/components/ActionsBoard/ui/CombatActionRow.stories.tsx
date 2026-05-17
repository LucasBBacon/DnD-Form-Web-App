import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CombatActionRow } from "./CombatActionRow";
import type {
  AttackActionEntry,
  SpellSaveActionEntry,
  TraitUseActionEntry,
} from "../../../hooks/useCombatActions";

const toRomanNumeral = (level: number): string =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] ??
  level.toString();

const longswordAttack: AttackActionEntry = {
  id: "attack-longsword",
  name: "Longsword",
  section: "action",
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
  section: "action",
  source: "spell",
  isExhausted: false,
  subtitle: "3rd-level evocation",
  quickStats: ["8d6 fire", "Dex save"],
  spellLevel: 3,
  spellMetadata: {
    spellId: "fireball",
    baseSpellLevel: 3,
    availableCastLevels: [3, 4, 5],
    selectedCastLevel: 3,
    canCast: true,
    canUseSharedSlot: true,
    canUsePactSlot: true,
    resolvedDamageEntries: [],
    resolvedHealingEntries: [],
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
  section: "action",
  source: "spell",
  isExhausted: true,
  subtitle: "2nd-level enchantment",
  quickStats: ["Wis save", "Humanoid"],
  spellLevel: 2,
  spellMetadata: {
    spellId: "hold-person",
    baseSpellLevel: 2,
    availableCastLevels: [2],
    selectedCastLevel: 2,
    canCast: false,
    canUseSharedSlot: false,
    canUsePactSlot: false,
    unavailableReason: "No spell slots remaining",
    resolvedDamageEntries: [],
    resolvedHealingEntries: [],
  },
};

const magicMissileSpell: SpellSaveActionEntry = {
  id: "spell-magic-missile",
  name: "Magic Missile",
  section: "action",
  source: "spell",
  isExhausted: false,
  subtitle: "1st-level evocation",
  quickStats: ["3 darts", "Force damage"],
  spellLevel: 1,
  spellMetadata: {
    spellId: "magic-missile",
    baseSpellLevel: 1,
    availableCastLevels: [1, 2, 3],
    selectedCastLevel: 1,
    canCast: true,
    canUseSharedSlot: true,
    canUsePactSlot: true,
    resolvedDamageEntries: [],
    resolvedHealingEntries: [],
  },
};

const rageTrait: TraitUseActionEntry = {
  id: "trait-rage",
  name: "Rage",
  section: "bonus_action",
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
  section: "bonus_action",
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

export const SpellPrepareCast: Story = {
  args: {
    entry: magicMissileSpell,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Prepare Cast" }));

    await expect(canvas.getByText("Level:")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Shared" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Pact" })).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Confirm Cast" }),
    ).toBeInTheDocument();
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
      section: "bonus_action",
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
