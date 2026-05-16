import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CombatActionRow } from "./CombatActionRow";
import type {
  AttackActionEntry,
  SpellSaveActionEntry,
  TraitUseActionEntry,
} from "./CombatActionRow";

const meta: Meta<typeof CombatActionRow> = {
  title: "ActionsBoard/CombatActionRow",
  component: CombatActionRow,
  tags: ["autodocs"],
  args: {
    onAttackResult: fn(),
    onDamageResult: fn(),
    onCastSpell: fn(),
    onExpendTraitUse: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof CombatActionRow>;

// ===== ATTACK ACTION ENTRIES =====

export const SimpleAttack: Story = {
  args: {
    entry: {
      id: "attack-1",
      name: "Longsword",
      kind: "attack",
      subtitle: "Melee weapon attack",
      attackModifier: 4,
      damageDice: "1d8",
      damageModifier: 4,
      damageType: "slashing",
    } as AttackActionEntry,
  },
};

export const FinessWeapon: Story = {
  args: {
    entry: {
      id: "attack-2",
      name: "Rapier",
      kind: "attack",
      subtitle: "Finesse, melee weapon attack",
      attackModifier: 5,
      damageDice: "1d8",
      damageModifier: 5,
      damageType: "piercing",
    } as AttackActionEntry,
  },
};

export const RangedWeapon: Story = {
  args: {
    entry: {
      id: "attack-3",
      name: "Longbow",
      kind: "attack",
      subtitle: "Ranged weapon attack",
      attackModifier: 3,
      damageDice: "1d8",
      damageModifier: 2,
      damageType: "piercing",
    } as AttackActionEntry,
  },
};

export const HighModifierAttack: Story = {
  args: {
    entry: {
      id: "attack-4",
      name: "Extra Attack",
      kind: "attack",
      subtitle: "Fighter's bonus attack",
      attackModifier: 7,
      damageDice: "2d6",
      damageModifier: 4,
      damageType: "slashing",
    } as AttackActionEntry,
  },
};

export const LowModifierAttack: Story = {
  args: {
    entry: {
      id: "attack-5",
      name: "Unarmed Strike",
      kind: "attack",
      subtitle: "Melee weapon attack",
      attackModifier: 1,
      damageDice: "1d4",
      damageModifier: 1,
      damageType: "bludgeoning",
    } as AttackActionEntry,
  },
};

// ===== SPELL SAVE ACTION ENTRIES =====

export const SpellSaveWithDamage: Story = {
  args: {
    entry: {
      id: "spell-1",
      name: "Fireball",
      kind: "spell_save",
      subtitle: "Evocation spell, 3rd level",
      saveDc: 15,
      saveAbility: "dexterity",
      damageDice: "8d6",
    } as SpellSaveActionEntry,
  },
};

export const SpellSaveNoDamage: Story = {
  args: {
    entry: {
      id: "spell-2",
      name: "Hold Person",
      kind: "spell_save",
      subtitle: "Enchantment spell, 2nd level",
      saveDc: 14,
      saveAbility: "wisdom",
    } as SpellSaveActionEntry,
  },
};

export const HighDCSpell: Story = {
  args: {
    entry: {
      id: "spell-3",
      name: "Delayed Blast Fireball",
      kind: "spell_save",
      subtitle: "Evocation spell, 7th level",
      saveDc: 17,
      saveAbility: "dexterity",
      damageDice: "14d6",
    } as SpellSaveActionEntry,
  },
};

export const LowDCSpell: Story = {
  args: {
    entry: {
      id: "spell-4",
      name: "Magic Missile",
      kind: "spell_save",
      subtitle: "Evocation spell, 1st level",
      saveDc: 12,
      saveAbility: "constitution",
    } as SpellSaveActionEntry,
  },
};

export const ConstitutionSave: Story = {
  args: {
    entry: {
      id: "spell-5",
      name: "Poison Spray",
      kind: "spell_save",
      subtitle: "Conjuration cantrip",
      saveDc: 13,
      saveAbility: "constitution",
      damageDice: "1d12",
    } as SpellSaveActionEntry,
  },
};

// ===== TRAIT USE ACTION ENTRIES =====

export const TraitFreshUses: Story = {
  args: {
    entry: {
      id: "trait-1",
      name: "Rage",
      kind: "trait_use",
      subtitle: "Channel your fury",
      currentUses: 3,
      maxUses: 3,
    } as TraitUseActionEntry,
  },
};

export const TraitPartiallyExpended: Story = {
  args: {
    entry: {
      id: "trait-2",
      name: "Second Wind",
      kind: "trait_use",
      subtitle: "Regain hit points",
      currentUses: 1,
      maxUses: 2,
    } as TraitUseActionEntry,
  },
};

export const TraitExhausted: Story = {
  args: {
    entry: {
      id: "trait-3",
      name: "Reckless Attack",
      kind: "trait_use",
      subtitle: "Attack recklessly",
      currentUses: 0,
      maxUses: 1,
    } as TraitUseActionEntry,
  },
};

export const TraitManyUses: Story = {
  args: {
    entry: {
      id: "trait-4",
      name: "Cunning Action",
      kind: "trait_use",
      subtitle: "Dash, disengage, or hide",
      currentUses: 5,
      maxUses: 5,
    } as TraitUseActionEntry,
  },
};

export const TraitLastUse: Story = {
  args: {
    entry: {
      id: "trait-5",
      name: "Lay on Hands",
      kind: "trait_use",
      subtitle: "Heal yourself or allies",
      currentUses: 1,
      maxUses: 10,
    } as TraitUseActionEntry,
  },
};

// ===== PLAYGROUND =====

export const Playground: Story = {
  args: {
    entry: {
      id: "attack-playground",
      name: "Greatsword",
      kind: "attack",
      subtitle: "Versatile melee weapon",
      attackModifier: 6,
      damageDice: "2d6",
      damageModifier: 4,
      damageType: "slashing",
    } as AttackActionEntry,
  },
};
