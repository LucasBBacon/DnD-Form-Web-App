import type { SpellcastingFixture } from "../../types/fixtures";
import { COMBAT_FIXTURES, SPELLCASTING_FIXTURES } from "../../fixtures/boardFixtures";
import type { CombatActionEntry, CombatActionSection } from "../../hooks/useCombatActions";

/**
 * Defines shape of a single action board scenario.
 * Combines spell slots, combat action sections, and UI state.
 */
export interface ActionsBoardScenario {
  spellcasting: SpellcastingFixture;
  sections: Partial<Record<CombatActionSection, CombatActionEntry[]>>;
  activeRoller: {
    entryId: string;
    kind: "attack" | "damage";
    damageId?: string;
  } | null;
  attackRollModes: Record<string, "normal" | "advantage" | "disadvantage">;
  rollResultsByEntry: Record<
    string,
    { attack?: string; damage: Record<string, string> }
  >;
}

// Example actions for different sections
const WEAPON_ACTION: CombatActionEntry = {
  id: "action:longsword",
  name: "Longsword",
  section: "action",
  source: "attack",
  subtitle: "Weapon Attack",
  quickStats: ["+5 to-hit", "1d8+3 damage"],
  description: "Melee weapon attack: +5 to hit, reach 5 ft., one target.",
  isExhausted: false,
  attackRoll: {
    label: "Longsword Attack",
    sides: 20,
    modifier: 5,
  },
  damageRolls: [
    {
      id: "dmg:longsword",
      label: "1d8+3",
      count: 1,
      sides: 8,
      modifier: 3,
    },
  ],
};

const FIREBALL_SPELL: CombatActionEntry = {
  id: "spell:fireball",
  name: "Fireball",
  section: "action",
  source: "spell",
  subtitle: "3rd-level evocation",
  quickStats: ["8d6 damage", "Range 150 ft."],
  description:
    "A bright streak flashes from your pointing finger to a point of your choice within range. Each creature in a 20-foot radius must make a Dexterity save.",
  isExhausted: false,
  spellLevel: 3,
  attackRoll: {
    label: "Fireball Save DC",
    sides: 20,
    modifier: 5,
  },
  damageRolls: [
    {
      id: "dmg:fireball",
      label: "8d6",
      count: 8,
      sides: 6,
      modifier: 0,
    },
  ],
};

const SNEAK_ATTACK_BONUS: CombatActionEntry = {
  id: "action:sneak-attack",
  name: "Sneak Attack",
  section: "bonus_action",
  source: "trait",
  quickStats: ["4d6 damage", "1/turn"],
  description: "Add sneak attack damage to a hit you make this turn.",
  isExhausted: false,
  uses: {
    total: 1,
    remaining: 1,
  },
  damageRolls: [
    {
      id: "dmg:sneak",
      label: "4d6",
      count: 4,
      sides: 6,
      modifier: 0,
    },
  ],
};

const REACTION_EXAMPLE: CombatActionEntry = {
  id: "reaction:shield",
  name: "Shield Reaction",
  section: "reaction",
  source: "trait",
  quickStats: ["AC+5", "1/turn"],
  description: "Use your reaction to gain +5 to AC against one attack.",
  isExhausted: false,
  uses: {
    total: 1,
    remaining: 1,
  },
};

const EXHAUSTED_ACTION: CombatActionEntry = {
  id: "action:second-wind",
  name: "Second Wind",
  section: "bonus_action",
  source: "trait",
  quickStats: ["1d10+level", "1/rest"],
  description: "Heal yourself, bonus action once per short rest.",
  isExhausted: true,
  uses: {
    total: 1,
    remaining: 0,
  },
  damageRolls: [
    {
      id: "dmg:second-wind",
      label: "1d10",
      count: 1,
      sides: 10,
      modifier: 5,
    },
  ],
};

export const ACTIONS_BOARD_FIXTURES = {
  noActions: {
    spellcasting: SPELLCASTING_FIXTURES.allSpent,
    sections: {},
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  withAttacks: {
    spellcasting: SPELLCASTING_FIXTURES.allSpent,
    sections: {
      action: [WEAPON_ACTION],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  withSpells: {
    spellcasting: SPELLCASTING_FIXTURES.withSpells,
    sections: {
      action: [FIREBALL_SPELL],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  withBonusActions: {
    spellcasting: SPELLCASTING_FIXTURES.allSpent,
    sections: {
      bonus_action: [SNEAK_ATTACK_BONUS],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  withReactions: {
    spellcasting: SPELLCASTING_FIXTURES.allSpent,
    sections: {
      reaction: [REACTION_EXAMPLE],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  allActions: {
    spellcasting: SPELLCASTING_FIXTURES.withSpells,
    sections: {
      action: [WEAPON_ACTION, FIREBALL_SPELL],
      bonus_action: [SNEAK_ATTACK_BONUS],
      reaction: [REACTION_EXAMPLE],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  exhaustedActions: {
    spellcasting: SPELLCASTING_FIXTURES.allSpent,
    sections: {
      action: [{ ...WEAPON_ACTION, isExhausted: true }],
      bonus_action: [EXHAUSTED_ACTION],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  withActiveRoller: {
    spellcasting: SPELLCASTING_FIXTURES.withSpells,
    sections: {
      action: [WEAPON_ACTION, FIREBALL_SPELL],
    },
    activeRoller: {
      entryId: "action:longsword",
      kind: "attack",
    },
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,

  withRollResults: {
    spellcasting: SPELLCASTING_FIXTURES.withSpells,
    sections: {
      action: [WEAPON_ACTION, FIREBALL_SPELL],
    },
    activeRoller: null,
    attackRollModes: {
      "action:longsword": "normal",
      "spell:fireball": "advantage",
    },
    rollResultsByEntry: {
      "action:longsword": {
        attack: "18 (d20 15 + 3)",
        damage: {
          "dmg:longsword": "11 (8 + 3)",
        },
      },
      "spell:fireball": {
        attack: "16 (d20 14/12 -> keep 14 (advantage) + 2)",
        damage: {
          "dmg:fireball": "24 (8d6)",
        },
      },
    },
  } satisfies ActionsBoardScenario,

  playground: {
    spellcasting: SPELLCASTING_FIXTURES.withSpells,
    sections: {
      action: [WEAPON_ACTION, FIREBALL_SPELL],
      bonus_action: [SNEAK_ATTACK_BONUS, EXHAUSTED_ACTION],
      reaction: [REACTION_EXAMPLE],
    },
    activeRoller: null,
    attackRollModes: {},
    rollResultsByEntry: {},
  } satisfies ActionsBoardScenario,
};
