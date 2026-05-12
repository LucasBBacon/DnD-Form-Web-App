import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActionsBoardView } from "./ActionsBoardView";
import { ACTIONS_BOARD_FIXTURES } from "./ActionsBoard.fixtures";
import type { SpellcastingFixture } from "../../types/fixtures";

/**
 * Helper function to convert a spellcasting fixture into slot HUD rows for the ActionsBoardView.
 * @param spellcasting The spellcasting fixture containing spell slot information.
 * @returns An array of objects representing the label and text for each spell slot level to be displayed in the HUD.
 */
function fixtureToSlotHudRows(
  spellcasting: SpellcastingFixture,
): Array<{ label: string; text: string }> {
  const rows: Array<{ label: string; text: string }> = [];

  Object.entries(spellcasting.spellSlotsByLevel).forEach(
    ([level, slotData]) => {
      const remaining = slotData.available - slotData.used;
      const bubbles = "o".repeat(remaining).padEnd(slotData.available, " ");
      rows.push({
        label: `Lvl ${level}`,
        text: `[${bubbles}]`,
      });
    },
  );

  if (spellcasting.pactSlots) {
    const remaining =
      spellcasting.pactSlots.available - spellcasting.pactSlots.used;
    const bubbles = "o"
      .repeat(remaining)
      .padEnd(spellcasting.pactSlots.available, " ");
    rows.push({
      label: "Pact",
      text: `[${bubbles}]`,
    });
  }

  return rows;
}

const toRomanNumeral = (level: number) =>
  ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] ||
  level.toString();

const meta: Meta<typeof ActionsBoardView> = {
  component: ActionsBoardView,
  title: "Boards/ActionsBoard",
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
type Story = StoryObj<typeof ActionsBoardView>;

export const NoActions: Story = {
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.noActions.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.noActions.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.noActions.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.noActions.attackRollModes,
    rollResultsByEntry: ACTIONS_BOARD_FIXTURES.noActions.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
  parameters: {
    docs: {
      description: {
        story: "Empty board state with no available actions or spellcasting.",
      },
    },
  },
};

export const WithAttacks: Story = {
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.withAttacks.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.withAttacks.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.withAttacks.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.withAttacks.attackRollModes,
    rollResultsByEntry: ACTIONS_BOARD_FIXTURES.withAttacks.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
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
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.withSpells.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.withSpells.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.withSpells.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.withSpells.attackRollModes,
    rollResultsByEntry: ACTIONS_BOARD_FIXTURES.withSpells.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
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
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.withBonusActions.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.withBonusActions.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.withBonusActions.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.withBonusActions.attackRollModes,
    rollResultsByEntry:
      ACTIONS_BOARD_FIXTURES.withBonusActions.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
  parameters: {
    docs: {
      description: {
        story: "Sneak Attack bonus action with use/restore trait controls.",
      },
    },
  },
};

export const WithReactions: Story = {
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.withReactions.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.withReactions.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.withReactions.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.withReactions.attackRollModes,
    rollResultsByEntry: ACTIONS_BOARD_FIXTURES.withReactions.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
  parameters: {
    docs: {
      description: {
        story: "Shield reaction ability demonstrating reaction section.",
      },
    },
  },
};

export const AllActions: Story = {
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.allActions.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.allActions.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.allActions.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.allActions.attackRollModes,
    rollResultsByEntry: ACTIONS_BOARD_FIXTURES.allActions.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
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
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.exhaustedActions.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.exhaustedActions.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.exhaustedActions.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.exhaustedActions.attackRollModes,
    rollResultsByEntry:
      ACTIONS_BOARD_FIXTURES.exhaustedActions.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
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
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.withActiveRoller.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.withActiveRoller.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.withActiveRoller.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.withActiveRoller.attackRollModes,
    rollResultsByEntry:
      ACTIONS_BOARD_FIXTURES.withActiveRoller.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
  parameters: {
    docs: {
      description: {
        story: "Dice roller UI shown for active attack roll selection.",
      },
    },
  },
};

export const WithRollResults: Story = {
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.withRollResults.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.withRollResults.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.withRollResults.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.withRollResults.attackRollModes,
    rollResultsByEntry:
      ACTIONS_BOARD_FIXTURES.withRollResults.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Previous roll results displayed (Longsword hit/damage, Fireball advantage roll).",
      },
    },
  },
};

export const Playground: Story = {
  args: {
    slotHudRows: fixtureToSlotHudRows(
      ACTIONS_BOARD_FIXTURES.playground.spellcasting,
    ),
    sections: ACTIONS_BOARD_FIXTURES.playground.sections,
    activeRoller: ACTIONS_BOARD_FIXTURES.playground.activeRoller,
    attackRollModes: ACTIONS_BOARD_FIXTURES.playground.attackRollModes,
    rollResultsByEntry: ACTIONS_BOARD_FIXTURES.playground.rollResultsByEntry,
    onActiveRollerChange: () => {},
    onAttackRollModeChange: () => {},
    onAttackResult: () => {},
    onDamageResult: () => {},
    onExpendTraitUse: () => {},
    onRestoreTraitUse: () => {},
    toRomanNumeral,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full playground scenario with all action types for interactive exploration.",
      },
    },
  },
};
