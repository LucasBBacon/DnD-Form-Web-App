/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CharacterCreationWizard } from "./CharacterCreationWizard";
import { useCharacterStore } from "../../store/useCharacterStore";

vi.mock("./RaceSelectionStep", () => ({
  RaceSelectionStep: ({ onNext }: { onNext: () => void }) => (
    <button onClick={onNext} type="button">
      Continue Race
    </button>
  ),
}));

vi.mock("./ClassSelectionStep", () => ({
  ClassSelectionStep: ({ onNext }: { onNext: () => void }) => (
    <button onClick={onNext} type="button">
      Continue Class
    </button>
  ),
}));

vi.mock("./AbilityScoreStep", () => ({
  AbilityScoreStep: ({ onFinish }: { onFinish: () => void }) => (
    <button onClick={onFinish} type="button">
      Continue Abilities
    </button>
  ),
}));

describe("CharacterCreationWizard origin step", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      isSetupComplete: false,
      raceId: null,
      subraceId: null,
      classId: null,
      subclassId: null,
      choicesByLevel: {},
      acquiredFeats: [],
      baseAbilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      chosenRacialBonuses: {},
    } as any);
  });

  it("blocks finishing when an eligible origin feat exists but none is selected", async () => {
    const user = userEvent.setup();
    render(<CharacterCreationWizard />);

    await user.click(screen.getByRole("button", { name: "Continue Race" }));
    await user.click(screen.getByRole("button", { name: "Continue Class" }));
    await user.click(
      screen.getByRole("button", { name: "Continue Abilities" }),
    );

    const finishButton = screen.getByRole("button", {
      name: "Finish and Generate Sheet",
    });

    expect(screen.getByText("Choose an Origin Feat")).toBeInTheDocument();
    expect(finishButton).toBeDisabled();
    expect(useCharacterStore.getState().isSetupComplete).toBe(false);
  });

  it("enables finishing after selecting an origin feat and completes setup", async () => {
    const user = userEvent.setup();
    render(<CharacterCreationWizard />);

    await user.click(screen.getByRole("button", { name: "Continue Race" }));
    await user.click(screen.getByRole("button", { name: "Continue Class" }));
    await user.click(
      screen.getByRole("button", { name: "Continue Abilities" }),
    );

    const finishButton = screen.getByRole("button", {
      name: "Finish and Generate Sheet",
    });
    expect(finishButton).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /Gifted Mind/i }));
    expect(finishButton).toBeEnabled();

    await user.click(finishButton);

    expect(useCharacterStore.getState().isSetupComplete).toBe(true);
    expect(
      useCharacterStore
        .getState()
        .acquiredFeats.some(
          (entry) =>
            entry.source === "origin" && entry.featId === "feat_gifted_mind",
        ),
    ).toBe(true);
  });
});