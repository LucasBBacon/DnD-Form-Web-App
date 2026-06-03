import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AbilityCard } from "./AbilityCard";

vi.mock("../../ui/DiceRoller/DiceRoller", () => ({
  DiceRoller: ({
    onRollComplete,
    rollLabel,
  }: {
    onRollComplete?: (rolls: number[], summary: { total: number }) => void;
    rollLabel?: string;
  }) => (
    <button
      type="button"
      onClick={() => onRollComplete?.([5], { total: 5 })}
    >
      {rollLabel ?? "Roll"}
    </button>
  ),
}));

const ability = {
  key: "str",
  abilityName: "Strength",
  score: 16,
  modifier: 3,
  save: { modifier: 5, isProficient: true },
  skills: [
    {
      key: "athletics",
      label: "Athletics",
      modifier: 5,
      isProficient: true,
      isExpertise: false,
      hasAdvantage: false,
      hasDisadvantage: false,
      tooltip: "",
    },
  ],
};

describe("AbilityCard", () => {
  it("renders ability title and score badge", () => {
    render(
      <AbilityCard
        ability={ability}
        onSkillRoll={vi.fn()}
        onSaveRoll={vi.fn()}
        onAbilityCheckRoll={vi.fn()}
      />,
    );

    expect(screen.getByText("Strength")).toBeInTheDocument();
    expect(screen.getByText("Score 16")).toBeInTheDocument();
  });

  it("renders saving throw and skill rows", () => {
    render(
      <AbilityCard
        ability={ability}
        onSkillRoll={vi.fn()}
        onSaveRoll={vi.fn()}
        onAbilityCheckRoll={vi.fn()}
      />,
    );

    expect(screen.getByText("Saving Throw")).toBeInTheDocument();
    expect(screen.getByText("Athletics")).toBeInTheDocument();
  });

  it("invokes roll callbacks when dice buttons are used", () => {
    const onSkillRoll = vi.fn();
    const onSaveRoll = vi.fn();
    const onAbilityCheckRoll = vi.fn();

    render(
      <AbilityCard
        ability={ability}
        onSkillRoll={onSkillRoll}
        onSaveRoll={onSaveRoll}
        onAbilityCheckRoll={onAbilityCheckRoll}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+3" }));
    const plusFiveButtons = screen.getAllByRole("button", { name: "+5" });
    fireEvent.click(plusFiveButtons[0]);
    fireEvent.click(plusFiveButtons[plusFiveButtons.length - 1]);

    expect(onAbilityCheckRoll).toHaveBeenCalled();
    expect(onSaveRoll).toHaveBeenCalled();
    expect(onSkillRoll).toHaveBeenCalled();
  });
});
