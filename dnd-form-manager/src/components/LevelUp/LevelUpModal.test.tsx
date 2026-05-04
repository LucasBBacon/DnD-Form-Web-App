/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BASELINE_CHARACTER_STATE, useCharacterStore } from "../../store/useCharacterStore";
import { LevelUpModal } from "./LevelUpModal";

vi.mock("../../utils/levelUpPlanner", () => ({
  buildLevelUpPlan: vi.fn(() => ({
    orderedSteps: ["class_pick", "review"],
    requirements: {
      requiresAsiOrFeat: false,
      requiresSubclass: false,
      requiresProficiencySelection: false,
      requiresSkillSelection: false,
      newCantripsToLearn: 0,
      newSpellsToLearn: 0,
    },
    pendingProficiencyChoices: [],
    pendingFeatureChoices: [],
    isComplete: false,
    completionErrors: [],
  })),
}));

vi.mock("../../data/staticDataApi", () => ({
  getClassById: vi.fn(() => null),
  getSubclassById: vi.fn(() => null),
}));

vi.mock("./steps/ClassPickStep", () => ({
  ClassPickStep: () => <div>Class Pick Step Stub</div>,
}));

vi.mock("./steps/SubclassPickStep", () => ({
  SubclassPickStep: () => <div>Subclass Pick Step Stub</div>,
}));

vi.mock("./steps/HpGainStep", () => ({
  HpGainStep: () => <div>Hp Gain Step Stub</div>,
}));

vi.mock("./steps/ProficiencyChoiceStep", () => ({
  ProficiencyChoiceStep: () => <div>Proficiency Choice Step Stub</div>,
}));

vi.mock("./steps/AsiOrFeatStep", () => ({
  AsiOrFeatStep: () => <div>ASI Or Feat Step Stub</div>,
}));

vi.mock("./steps/SpellChoiceStep", () => ({
  SpellChoiceStep: () => <div>Spell Choice Step Stub</div>,
}));

vi.mock("./steps/FeatureChoiceStep", () => ({
  FeatureChoiceStep: () => <div>Feature Choice Step Stub</div>,
}));

vi.mock("./steps/ReviewStep", () => ({
  ReviewStep: () => <div>Review Step Stub</div>,
}));

describe("LevelUpModal blocking UX", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      ...BASELINE_CHARACTER_STATE,
      classId: "class_fighter",
      classTracks: [{ classId: "class_fighter", subclassId: null, level: 1 }],
      level: 1,
    } as any);
  });

  it("shows the blocking banner and disables close while blocking", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LevelUpModal targetLevel={1} isBlocking onClose={onClose} />);

    expect(
      screen.getByText(
        "This level-up must be completed before returning to the character sheet.",
      ),
    ).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toBeDisabled();

    await user.click(closeButton);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("allows closing when not blocking", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LevelUpModal targetLevel={1} onClose={onClose} />);

    expect(
      screen.queryByText(
        "This level-up must be completed before returning to the character sheet.",
      ),
    ).not.toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).not.toBeDisabled();

    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});