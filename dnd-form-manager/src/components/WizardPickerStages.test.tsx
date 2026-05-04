// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { WizardEquipmentSelectionStage } from "./WizardEquipmentSelectionStage";
import { WizardSpellSelectionStage } from "./WizardSpellSelectionStage";
import { WizardAbilityScoreStage } from "./WizardAbilityScoreStage";
import {
  BASELINE_CHARACTER_STATE,
  useCharacterStore,
} from "../store/useCharacterStore";

// ---------------------------------------------------------------------------
// Equipment Stage Tests
// ---------------------------------------------------------------------------

describe("WizardEquipmentSelectionStage", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE });
  });

  it("shows placeholder when no class is selected", () => {
    render(<WizardEquipmentSelectionStage />);
    expect(screen.getByText("Select a class first.")).toBeInTheDocument();
  });

  it("renders given equipment items for a class", () => {
    act(() => {
      useCharacterStore.getState().setClass("class_barbarian");
    });
    render(<WizardEquipmentSelectionStage />);
    // Barbarian has given items; at minimum the stage header renders
    expect(screen.getByText("Starting Equipment")).toBeInTheDocument();
  });

  it("renders choice groups for a class with equipment choices", () => {
    act(() => {
      useCharacterStore.getState().setClass("class_barbarian");
    });
    render(<WizardEquipmentSelectionStage />);
    // Barbarian has 2 choice groups
    expect(screen.getByText("Your Choices")).toBeInTheDocument();
    expect(screen.getByText(/Choice 1/)).toBeInTheDocument();
  });

  it("marks an option as selected when clicked", async () => {
    act(() => {
      useCharacterStore.getState().setClass("class_barbarian");
    });
    render(<WizardEquipmentSelectionStage />);

    // Find the first bundle card and click it
    const bundleCards = document.querySelectorAll(".picker-bundle-card");
    expect(bundleCards.length).toBeGreaterThan(0);

    await userEvent.click(bundleCards[0] as HTMLElement);

    // The first card should now be selected
    expect(bundleCards[0]).toHaveClass("selected");
    // The store should reflect the selection
    expect(
      useCharacterStore.getState().startingEquipmentSelections[0],
    ).toBe(0);
  });

  it("resets equipment selections when class changes", () => {
    act(() => {
      useCharacterStore.getState().setClass("class_barbarian");
      useCharacterStore.getState().setStartingEquipmentSelection(0, 1);
    });
    expect(
      useCharacterStore.getState().startingEquipmentSelections[0],
    ).toBe(1);

    act(() => {
      useCharacterStore.getState().setClass("class_fighter");
    });
    // After class change, selections should be cleared
    expect(
      useCharacterStore.getState().startingEquipmentSelections,
    ).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Spell Stage Tests
// ---------------------------------------------------------------------------

describe("WizardSpellSelectionStage", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE });
  });

  it("shows placeholder when no class is selected", () => {
    render(<WizardSpellSelectionStage />);
    expect(
      screen.getByText("Select a class first to see available spells."),
    ).toBeInTheDocument();
  });

  it("shows non-spellcaster message for Barbarian", () => {
    act(() => {
      useCharacterStore.getState().setClass("class_barbarian");
      useCharacterStore.getState().setLevel(1);
    });
    render(<WizardSpellSelectionStage />);
    expect(
      screen.getByText("Your class does not cast spells."),
    ).toBeInTheDocument();
  });

  it("shows cantrip section for Sorcerer", () => {
    act(() => {
      useCharacterStore.getState().setClass("class_sorcerer");
      useCharacterStore.getState().setLevel(1);
    });
    render(<WizardSpellSelectionStage />);
    expect(screen.getByText("Cantrips")).toBeInTheDocument();
  });

  it("learns a cantrip when clicked", async () => {
    act(() => {
      useCharacterStore.getState().setClass("class_sorcerer");
      useCharacterStore.getState().setLevel(1);
    });
    render(<WizardSpellSelectionStage />);

    const cantripCards = document
      .querySelector(".picker-grid")
      ?.querySelectorAll(".picker-card:not(.disabled)");
    expect(cantripCards).toBeDefined();
    expect((cantripCards?.length ?? 0)).toBeGreaterThan(0);

    if (cantripCards && cantripCards.length > 0) {
      await userEvent.click(cantripCards[0] as HTMLElement);
      expect(useCharacterStore.getState().spellsKnown).toHaveLength(1);
    }
  });

  it("unlearns a cantrip when clicked again", async () => {
    act(() => {
      useCharacterStore.getState().setClass("class_sorcerer");
      useCharacterStore.getState().setLevel(1);
    });
    render(<WizardSpellSelectionStage />);

    const cantripCards = document
      .querySelector(".picker-grid")
      ?.querySelectorAll(".picker-card:not(.disabled)");

    if (cantripCards && cantripCards.length > 0) {
      // Learn
      await userEvent.click(cantripCards[0] as HTMLElement);
      expect(useCharacterStore.getState().spellsKnown).toHaveLength(1);
      // Unlearn
      await userEvent.click(cantripCards[0] as HTMLElement);
      expect(useCharacterStore.getState().spellsKnown).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Ability Score Stage Tests
// ---------------------------------------------------------------------------

describe("WizardAbilityScoreStage", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE });
  });

  it("starts with standard array method selected", () => {
    render(<WizardAbilityScoreStage onContinue={vi.fn()} />);
    expect(screen.getByText("Ability Scores")).toBeInTheDocument();
    expect(
      screen.getByText("Standard Array (15, 14, 13, 12, 10, 8)"),
    ).toBeInTheDocument();
  });

  it("can complete with valid point buy", async () => {
    const user = userEvent.setup();
    render(<WizardAbilityScoreStage onContinue={vi.fn()} />);

    await user.click(screen.getByText("Point Buy (27 points)"));

    act(() => {
      useCharacterStore.getState().setBaseAbilityScores({
        str: 15,
        dex: 15,
        con: 15,
        int: 8,
        wis: 8,
        cha: 8,
      });
    });

    await user.click(screen.getByText("Confirm Ability Scores"));

    expect(useCharacterStore.getState().abilityAssignmentCompleted).toBe(true);
  });

  it("requires override for invalid point buy", async () => {
    const user = userEvent.setup();
    render(<WizardAbilityScoreStage onContinue={vi.fn()} />);

    await user.click(screen.getByText("Point Buy (27 points)"));

    act(() => {
      useCharacterStore.getState().setBaseAbilityScores({
        str: 18,
        dex: 15,
        con: 15,
        int: 8,
        wis: 8,
        cha: 8,
      });
    });

    await user.click(screen.getByText("Confirm Ability Scores"));
    expect(useCharacterStore.getState().abilityAssignmentCompleted).toBe(false);

    const override = screen.getByLabelText(
      "Allow house-rule override and continue anyway",
    );
    await user.click(override);
    await user.click(screen.getByText("Confirm Ability Scores"));

    expect(useCharacterStore.getState().abilityAssignmentCompleted).toBe(true);
  });
});
