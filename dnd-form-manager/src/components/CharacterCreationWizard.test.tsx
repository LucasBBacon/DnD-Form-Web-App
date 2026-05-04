// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { CharacterCreationWizard } from "./CharacterCreationWizard";
import {
  BASELINE_CHARACTER_STATE,
  useCharacterStore,
} from "../store/useCharacterStore";
import { getAllClasses, getAllRaces } from "../data/staticDataApi";

const ABILITY_LABELS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

describe("CharacterCreationWizard live draft", () => {
  beforeEach(() => {
    useCharacterStore.setState({ ...BASELINE_CHARACTER_STATE });
  });

  it("renders all six base ability scores in the live draft", () => {
    render(<CharacterCreationWizard />);

    for (const abilityLabel of ABILITY_LABELS) {
      expect(screen.getByText(abilityLabel)).toBeInTheDocument();
    }

    expect(screen.getAllByText("10")).toHaveLength(6);
    expect(screen.getAllByText("+0")).toHaveLength(6);
  });

  it("updates race, class, proficiency, and ability data when store changes", () => {
    const race = getAllRaces()[0];
    const classData = getAllClasses()[0];

    render(<CharacterCreationWizard />);

    act(() => {
      useCharacterStore.getState().setRace(race.id);
      useCharacterStore.getState().setClass(classData.id);
      useCharacterStore.getState().setLevel(9);
      useCharacterStore.getState().setBaseAbilityScore("str", 16);
    });

    const draftPanel = document.querySelector<HTMLElement>(".wizard-sidebar-right");
    expect(draftPanel).not.toBeNull();

    if (!draftPanel) {
      return;
    }

    expect(within(draftPanel).getByText(new RegExp(race.name, "i"))).toBeInTheDocument();
    expect(within(draftPanel).getByText(new RegExp(classData.name, "i"))).toBeInTheDocument();
    const proficiencyRow = Array.from(
      draftPanel.querySelectorAll<HTMLElement>(".draft-row"),
    ).find((row) => within(row).queryByText("Prof. Bonus:"));
    expect(proficiencyRow).toBeDefined();

    if (proficiencyRow) {
      expect(within(proficiencyRow).getByText("+4")).toBeInTheDocument();
    }

    const strLabel = screen.getByText("STR");
    const strCard = strLabel.closest(".draft-stat-box");
    expect(strCard).not.toBeNull();

    if (strCard) {
      const scoreElement = strCard.querySelector<HTMLElement>(".draft-stat-val");
      const modifierElement = strCard.querySelector<HTMLElement>(".draft-stat-mod");

      expect(scoreElement).not.toBeNull();
      expect(modifierElement).not.toBeNull();

      if (scoreElement && modifierElement) {
        const displayedScore = Number(scoreElement.textContent ?? "0");
        const expectedModifier = Math.floor((displayedScore - 10) / 2);
        const expectedModifierText =
          expectedModifier >= 0 ? `+${expectedModifier}` : `${expectedModifier}`;

        expect(displayedScore).toBeGreaterThanOrEqual(16);
        expect(modifierElement.textContent).toBe(expectedModifierText);
      }
    }

    const progressRows = Array.from(
      document.querySelectorAll<HTMLElement>(".draft-progress-row"),
    );
    const raceProgressRow = progressRows.find((row) =>
      within(row).queryByText("Race"),
    );
    const classProgressRow = progressRows.find((row) =>
      within(row).queryByText("Class"),
    );

    expect(raceProgressRow).toBeDefined();
    expect(classProgressRow).toBeDefined();

    if (raceProgressRow) {
      expect(within(raceProgressRow).getByText("Complete")).toBeInTheDocument();
    }

    if (classProgressRow) {
      expect(within(classProgressRow).getByText("Complete")).toBeInTheDocument();
    }
  });

  it("does not require subclass before class subclass choiceLevel", () => {
    render(<CharacterCreationWizard />);

    act(() => {
      useCharacterStore.getState().setClass("class_bard");
      useCharacterStore.getState().setSubclass(null);
      useCharacterStore.getState().setLevel(1);
    });

    const progressRows = Array.from(
      document.querySelectorAll<HTMLElement>(".draft-progress-row"),
    );
    const subclassProgressRow = progressRows.find((row) =>
      within(row).queryByText("Subclass"),
    );

    expect(subclassProgressRow).toBeDefined();

    if (subclassProgressRow) {
      expect(within(subclassProgressRow).getByText("Complete")).toBeInTheDocument();
    }
  });

  it("keeps abilities continue disabled until ability scores are confirmed", async () => {
    const user = userEvent.setup();
    render(<CharacterCreationWizard />);

    act(() => {
      useCharacterStore.getState().setRace("race_human");
      useCharacterStore.getState().setClass("class_fighter");
      useCharacterStore.getState().setAbilityAssignmentMethod("standard_array");
      useCharacterStore.getState().setBaseAbilityScores({
        str: 15,
        dex: 14,
        con: 13,
        int: 12,
        wis: 10,
        cha: 8,
      });
      // Bypass other stage blockers so we can navigate directly to abilities.
      useCharacterStore.getState().setRacialSkills(["athletics"]);
      useCharacterStore.getState().updateLevelChoice(1, { skillChoices: ["acrobatics", "history"] });
      useCharacterStore.getState().setStartingEquipmentSelection(0, 0);
      useCharacterStore.getState().setStartingEquipmentSelection(1, 0);
    });

    const abilitiesStepButton = screen.getByRole("button", { name: "4. Abilities" });
    await user.click(abilitiesStepButton);

    const continueButton = screen.getByRole("button", { name: "Continue →" });
    expect(continueButton).toBeDisabled();
  });

  it("unlocks abilities continue after confirming a valid assignment", async () => {
    const user = userEvent.setup();
    render(<CharacterCreationWizard />);

    act(() => {
      useCharacterStore.getState().setRace("race_human");
      useCharacterStore.getState().setClass("class_fighter");
      useCharacterStore.getState().setAbilityAssignmentMethod("standard_array");
      useCharacterStore.getState().setBaseAbilityScores({
        str: 15,
        dex: 14,
        con: 13,
        int: 12,
        wis: 10,
        cha: 8,
      });
      useCharacterStore.getState().setRacialSkills(["athletics"]);
      useCharacterStore.getState().updateLevelChoice(1, { skillChoices: ["acrobatics", "history"] });
      useCharacterStore.getState().setStartingEquipmentSelection(0, 0);
      useCharacterStore.getState().setStartingEquipmentSelection(1, 0);
    });

    const abilitiesStepButton = screen.getByRole("button", { name: "4. Abilities" });
    await user.click(abilitiesStepButton);

    const confirmButton = screen.getByRole("button", { name: "Confirm Ability Scores" });
    const continueButton = screen.getByRole("button", { name: "Continue →" });

    expect(continueButton).toBeDisabled();
    await user.click(confirmButton);
    expect(useCharacterStore.getState().abilityAssignmentCompleted).toBe(true);
    expect(continueButton).toBeEnabled();

    await user.click(continueButton);

    expect(screen.getByText("Background selection — work in progress!")).toBeInTheDocument();
  });
});
