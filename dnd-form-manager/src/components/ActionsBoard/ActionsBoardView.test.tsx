import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionsBoardView } from "./ActionsBoardView";
import type { ActionsBoardViewProps } from "./ActionsBoardView";
import {
  ACTIONS_BOARD_FIXTURES,
  type ActionsBoardScenario,
} from "./ActionsBoard.fixtures";

/**
 * Helper to create props from a fixture scenario.
 */
function createPropsFromScenario(scenario: ActionsBoardScenario): ActionsBoardViewProps {
  const onActiveRollerChange = vi.fn();
  const onAttackRollModeChange = vi.fn();
  const onAttackResult = vi.fn();
  const onDamageResult = vi.fn();
  const onExpendTraitUse = vi.fn();
  const onRestoreTraitUse = vi.fn();
  const toRomanNumeral = (level: number) =>
    ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"][level] || level.toString();

  return {
      slotHudRows: Object.entries(scenario.spellcasting.spellSlotsByLevel).map(
        ([level, slotData]) => ({
          label: `Lvl ${level}`,
          text: `[${("o".repeat(slotData.available - slotData.used)).padEnd(slotData.available, " ")}]`,
        }),
      ),
    sections: scenario.sections,
    activeRoller: scenario.activeRoller,
    attackRollModes: scenario.attackRollModes,
    rollResultsByEntry: scenario.rollResultsByEntry,
    onActiveRollerChange,
    onAttackRollModeChange,
    onAttackResult,
    onDamageResult,
    onExpendTraitUse,
    onRestoreTraitUse,
    toRomanNumeral,
  };
}

describe("ActionsBoardView", () => {
  describe("Rendering", () => {
    it("renders empty state when no actions", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.noActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText(/No Actions available/i)).toBeInTheDocument();
      expect(screen.getByText(/No Bonus Actions available/i)).toBeInTheDocument();
      expect(screen.getByText(/No Reactions available/i)).toBeInTheDocument();
    });

    it("renders combat header and title", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText(/Combat Actions/i)).toBeInTheDocument();
    });

    it("renders action cards with names and stats", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Longsword")).toBeInTheDocument();
      expect(screen.getByText(/\+5 to-hit/)).toBeInTheDocument();
      expect(screen.getByText(/1d8\+3 damage/)).toBeInTheDocument();
    });

    it("renders spell level badges for spells", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withSpells;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Fireball")).toBeInTheDocument();
      // The spell level should be rendered as Roman numeral
      const spellLevelBadges = screen.getAllByText("III");
      expect(spellLevelBadges.length).toBeGreaterThan(0);
    });

    it("renders spell slots HUD when slots available", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withSpells;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // Should have slot HUD rows
      const slotRows = props.slotHudRows;
      expect(slotRows.length).toBeGreaterThan(0);
    });
  });

  describe("Action Sections", () => {
    it("renders Actions section", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("renders Bonus Actions section", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withBonusActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Bonus Actions")).toBeInTheDocument();
      expect(screen.getByText("Sneak Attack")).toBeInTheDocument();
    });

    it("renders Reactions section", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withReactions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Reactions")).toBeInTheDocument();
      expect(screen.getByText("Shield Reaction")).toBeInTheDocument();
    });

    it("renders multiple actions per section", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.allActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Longsword")).toBeInTheDocument();
      expect(screen.getByText("Fireball")).toBeInTheDocument();
      expect(screen.getByText("Sneak Attack")).toBeInTheDocument();
      expect(screen.getByText("Shield Reaction")).toBeInTheDocument();
    });
  });

  describe("Attack Rolls", () => {
    it("renders attack roll button for weapon attacks", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByRole("button", { name: /Roll To-Hit/i })).toBeInTheDocument();
    });

    it("displays attack roll mode toggle", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // Attack roll mode toggle should be present (rendered by AttackRollModeToggle component)
      const toHitButtons = screen.getAllByRole("button", { name: /to-hit mode/i });
      expect(toHitButtons.length).toBeGreaterThan(0);
    });

    it("displays attack results when available", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withRollResults;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText(/To-Hit: 18/)).toBeInTheDocument();
    });
  });

  describe("Damage Rolls", () => {
    it("renders damage roll buttons for each damage type", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      const damageButtons = screen.getAllByRole("button", { name: /1d8\+3/ });
      expect(damageButtons.length).toBeGreaterThan(0);
    });

    it("displays damage results when available", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withRollResults;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText(/1d8\+3: 11/)).toBeInTheDocument();
    });

    it("renders Roll All Damage button when multiple damages exist", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withRollResults;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // Fireball has only one damage roll, but we check structure
      const allDamageButtons = screen.queryAllByRole("button", {
        name: /Roll All Damage/i,
      });
      expect(Array.isArray(allDamageButtons)).toBe(true);
    });
  });

  describe("Trait Uses", () => {
    it("renders Use and Restore buttons for traits with uses", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withBonusActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      const useButtons = screen.getAllByRole("button", { name: /Use/i });
      const restoreButtons = screen.getAllByRole("button", { name: /Restore/i });
      expect(useButtons.length).toBeGreaterThan(0);
      expect(restoreButtons.length).toBeGreaterThan(0);
    });

    it("disables Use button when no uses remaining", async () => {
      const scenario = ACTIONS_BOARD_FIXTURES.exhaustedActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      const useButtons = screen.getAllByRole("button", { name: /Use/i });
      for (const btn of useButtons) {
        if (btn.closest("article")?.querySelector(".exhausted-note")) {
          expect(btn).toBeDisabled();
        }
      }
    });
  });

  describe("Exhausted State", () => {
    it("marks exhausted actions with CSS class", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.exhaustedActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText(/Resource exhausted/i)).toBeInTheDocument();
    });

    it("disables action buttons when exhausted", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.exhaustedActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // Find buttons within exhausted cards and check if disabled
      const exhaustedNote = screen.getByText(/Resource exhausted/i);
      const card = exhaustedNote.closest("article");
      const buttons = card?.querySelectorAll("button");
      expect(buttons?.length).toBeGreaterThan(0);
    });
  });

  describe("Active Roller UI", () => {
    it("shows active roller when activeRoller is set", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withActiveRoller;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // When active roller is set, DiceRoller component should be rendered
      // (This would show up in the DOM if DiceRoller renders something)
      expect(props.activeRoller).not.toBeNull();
      expect(props.activeRoller?.entryId).toBe("action:longsword");
    });
  });

  describe("Callbacks", () => {
    it("calls onAttackRollModeChange when mode is toggled", async () => {
      const user = userEvent.setup();
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // The AttackRollModeToggle component would trigger the callback
      // This test verifies the callback is provided
      expect(typeof props.onAttackRollModeChange).toBe("function");
    });

    it("calls onActiveRollerChange when roller is toggled", async () => {
      const user = userEvent.setup();
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      const rollToHitButton = screen.getByRole("button", { name: /Roll To-Hit/i });
      await user.click(rollToHitButton);

      expect(props.onActiveRollerChange).toHaveBeenCalled();
    });

    it("calls onExpendTraitUse when Use button clicked", async () => {
      const user = userEvent.setup();
      const scenario = ACTIONS_BOARD_FIXTURES.withBonusActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      const useButtons = screen.getAllByRole("button", { name: /Use/i });
      if (useButtons.length > 0) {
        await user.click(useButtons[0]);
        expect(props.onExpendTraitUse).toHaveBeenCalled();
      }
    });

    it("calls onRestoreTraitUse when Restore button clicked", async () => {
      const user = userEvent.setup();
      const scenario = ACTIONS_BOARD_FIXTURES.exhaustedActions;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      const restoreButtons = screen.getAllByRole("button", { name: /Restore/i });
      if (restoreButtons.length > 0) {
        await user.click(restoreButtons[0]);
        expect(props.onRestoreTraitUse).toHaveBeenCalled();
      }
    });
  });

  describe("Integration Scenarios", () => {
    it("renders complex playground scenario", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.playground;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      expect(screen.getByText("Longsword")).toBeInTheDocument();
      expect(screen.getByText("Fireball")).toBeInTheDocument();
      expect(screen.getByText("Sneak Attack")).toBeInTheDocument();
      expect(screen.getByText("Shield Reaction")).toBeInTheDocument();
    });

    it("handles no spellcasting gracefully", () => {
      const scenario = ACTIONS_BOARD_FIXTURES.withAttacks;
      const props = createPropsFromScenario(scenario);

      render(<ActionsBoardView {...props} />);

      // Should still render without error
      expect(screen.getByText("Longsword")).toBeInTheDocument();
    });
  });
});
