import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ActionsBoard } from "./ActionsBoard";
import { ACTIONS_BOARD_FIXTURES } from "./ActionsBoard.fixtures";
import type { SpellcastingFixture } from "../../types/fixtures";
import type { UseSpellcastingReturn } from "../../hooks/useSpellcasting";
import type { CombatActionEntry, SpellSaveActionEntry } from "../../hooks/useCombatActions";

/**
 * Convert old spellcasting fixture data into the spellcasting shape expected by ActionsBoard.
 */
function fixtureToSpellcasting(
  spellcasting: SpellcastingFixture,
): UseSpellcastingReturn {
  const shared = Object.fromEntries(
    Object.entries(spellcasting.spellSlotsByLevel).map(([level, slotData]) => [
      Number(level),
      {
        total: slotData.available,
        expended: slotData.used,
      },
    ]),
  );

  return {
    isSpellcaster:
      Object.keys(spellcasting.spellSlotsByLevel).length > 0 ||
      Boolean(spellcasting.pactSlots),
    canCastSpells: spellcasting.preparedSpells.length > 0,
    casting: {
      ability: null,
      preparationType: null,
      saveDC: 0,
      attackBonus: 0,
    },
    pools: {
      known: {
        selected: spellcasting.knownSpells,
        max: spellcasting.knownSpells.length,
      },
      prepared: {
        selected: spellcasting.preparedSpells,
        max: spellcasting.preparedSpells.length,
      },
      cantrips: {
        max: 0,
      },
      bonusPrepared: [],
      allExpandedSpellIds: [],
      freeSchoolDesignated: [],
      freeSchoolSlots: 0,
      innate: [],
    },
    slots: {
      shared,
      pact: spellcasting.pactSlots
        ? {
            level: 1,
            total: spellcasting.pactSlots.available,
            expended: spellcasting.pactSlots.used,
          }
        : null,
    },
    diagnostics: {
      selections: {
        invalidKnownSpellIds: [],
        invalidPreparedSpellIds: [],
        knownSpellOverflow: 0,
        preparedSpellOverflow: 0,
        freeSchoolOverflow: 0,
      },
      classBreakdown: [],
    },
    spellMetadata: undefined,
  };
}

function withSpellMetadata<T>(value: T): T {
  const scenario = value as {
    sections: Partial<Record<"action" | "bonus_action" | "reaction", CombatActionEntry[]>>;
  };

  const patchedSections = Object.fromEntries(
    Object.entries(scenario.sections).map(([sectionKey, entries]) => [
      sectionKey,
      (entries ?? []).map((entry) => {
        if (entry.source !== "spell") return entry;

        const spellEntry = entry as SpellSaveActionEntry;
        return {
          ...spellEntry,
          spellMetadata: {
            spellId: spellEntry.id,
            baseSpellLevel: spellEntry.spellLevel,
            availableCastLevels: [spellEntry.spellLevel, spellEntry.spellLevel + 1],
            selectedCastLevel: spellEntry.spellLevel,
            canCast: true,
            canUseSharedSlot: true,
            canUsePactSlot: true,
            resolvedDamageEntries: [],
            resolvedHealingEntries: [],
          },
        };
      }),
    ]),
  ) as typeof scenario.sections;

  return {
    ...(value as object),
    sections: patchedSections,
  } as T;
}

function createStoryArgs(
  scenario: (typeof ACTIONS_BOARD_FIXTURES)[keyof typeof ACTIONS_BOARD_FIXTURES],
) {
  const scenarioWithMetadata = withSpellMetadata(scenario);
  return {
    spellcasting: fixtureToSpellcasting(scenarioWithMetadata.spellcasting),
    sections: scenarioWithMetadata.sections,
    attackRollModes: scenarioWithMetadata.attackRollModes,
    onAttackRollModeChange: fn(),
    onAttackResult: fn(),
    onDamageResult: fn(),
    onCastSpell: fn(),
    onExpendTraitUse: fn(),
    toRomanNumeral,
  };
}

const toRomanNumeral = (level: number) =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] ||
  level.toString();

const meta: Meta<typeof ActionsBoard> = {
  component: ActionsBoard,
  title: "Boards/ActionsBoard",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Combat actions board displaying weapons, spells, and trait actions with dice roller integration.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionsBoard>;

export const NoActions: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.noActions),
  parameters: {
    docs: {
      description: {
        story: "Empty board state with no available actions or spellcasting.",
      },
    },
  },
};

export const WithAttacks: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.withAttacks),
  parameters: {
    docs: {
      description: {
        story:
          "Single weapon attack (Longsword) with to-hit and damage rolls available.",
      },
    },
  },
};

export const WithSpells: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.withSpells),
  parameters: {
    docs: {
      description: {
        story:
          "Fireball spell with 3rd-level slot display and save DC attack roll.",
      },
    },
  },
};

export const WithBonusActions: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.withBonusActions),
  parameters: {
    docs: {
      description: {
        story: "Sneak Attack bonus action with use/restore trait controls.",
      },
    },
  },
};

export const WithReactions: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.withReactions),
  parameters: {
    docs: {
      description: {
        story: "Shield reaction ability demonstrating reaction section.",
      },
    },
  },
};

export const AllActions: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.allActions),
  parameters: {
    docs: {
      description: {
        story:
          "Full action economy display with weapons, spells, bonus actions, and reactions.",
      },
    },
  },
};

export const ExhaustedActions: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.exhaustedActions),
  parameters: {
    docs: {
      description: {
        story:
          "Actions marked as exhausted with disabled state and resource notes.",
      },
    },
  },
};

export const WithActiveRoller: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.withActiveRoller),
  parameters: {
    docs: {
      description: {
        story: "Scenario with active attack entries and spell slots visible.",
      },
    },
  },
};

export const WithRollResults: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.withRollResults),
  parameters: {
    docs: {
      description: {
        story:
          "Mixed attack and spell actions with attack roll mode states configured.",
      },
    },
  },
};

export const Playground: Story = {
  args: createStoryArgs(ACTIONS_BOARD_FIXTURES.playground),
  parameters: {
    docs: {
      description: {
        story:
          "Full playground scenario with all action types for interactive exploration.",
      },
    },
  },
};
