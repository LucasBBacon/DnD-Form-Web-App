import type { SpellcastingFixture } from "../../types/fixtures";
import { SPELLCASTING_FIXTURES } from "../../fixtures/boardFixtures";
import type {
  CombatActionEntry,
  CombatActionSection,
} from "../../hooks/useCombatActions";

/**
 * Defines shape of a single action board scenario.
 * Combines spell slots, combat action sections, and UI state.
 */
export interface ActionsBoardScenario {
  /** The spellcasting fixture for the scenario. */
  spellcasting: SpellcastingFixture;
  /** The combat action sections for the scenario. */
  sections: Partial<Record<CombatActionSection, CombatActionEntry[]>>;
  /** The currently active roller for the scenario. */
  activeRoller: {
    /** The ID of the combat action entry currently being rolled. */
    entryId: string;
    /** The kind of roll being performed: attack or damage. */
    kind: "attack" | "damage";
    /** The ID of the specific damage roll being performed, if applicable. */
    damageId?: string;
  } | null;
  /** The attack roll modes for the scenario. */
  attackRollModes: Record<string, "normal" | "advantage" | "disadvantage">;
  /** The roll results by entry for the scenario. */
  rollResultsByEntry: Record<
    string,
    {
      /** The result of the attack roll, if applicable. */
      attack?: string;
      /** The results of the damage rolls, keyed by damage roll ID. */
      damage: Record<string, string>;
    }
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
    id: "atk:longsword",
    label: "Longsword Attack",
    count: 1,
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

const THROWN_JAVELIN_ACTION: CombatActionEntry = {
  id: "action:javelin:thrown",
  name: "Javelin [Thrown]",
  section: "action",
  source: "attack",
  subtitle: "Weapon Attack",
  quickStats: ["+4 to-hit", "1d6+2 damage", "Range 30/120"],
  description: "Ranged weapon attack with a thrown javelin.",
  isExhausted: false,
  isThrown: true,
  throwableItemId: "weapon_javelin",
  throwableCount: 3,
  attackRoll: {
    id: "atk:javelin:thrown",
    label: "Javelin Attack",
    count: 1,
    sides: 20,
    modifier: 4,
  },
  damageRolls: [
    {
      id: "dmg:javelin:thrown",
      label: "1d6+2",
      count: 1,
      sides: 6,
      modifier: 2,
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
    id: "atk:fireball",
    label: "Fireball Save DC",
    count: 1,
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

  withThrownWeapons: {
    spellcasting: SPELLCASTING_FIXTURES.allSpent,
    sections: {
      action: [THROWN_JAVELIN_ACTION],
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
