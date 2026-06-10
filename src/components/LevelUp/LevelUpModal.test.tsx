/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BASELINE_CHARACTER_STATE, useCharacterStore } from "../../store/useCharacterStore";
import { LevelUpModal } from "./LevelUpModal";
import { buildLevelUpPlan } from "../../utils/levelUpPlanner";

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

const buildLevelUpPlanMock = vi.mocked(buildLevelUpPlan);

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

  it("hides close controls while blocking", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LevelUpModal targetLevel={1} isBlocking onClose={onClose} />);

    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();

    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("allows closing when not blocking", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LevelUpModal targetLevel={1} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).not.toBeDisabled();

    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("LevelUpModal step tracker", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      ...BASELINE_CHARACTER_STATE,
      classId: "class_fighter",
      classTracks: [{ classId: "class_fighter", subclassId: null, level: 1 }],
      level: 1,
    } as any);
  });

  it("renders tracker labels in planner step order", () => {
    buildLevelUpPlanMock.mockReturnValueOnce({
      orderedSteps: [
        "class_pick",
        "subclass_pick",
        "hp_gain",
        "spell_choice",
        "feature_choice",
        "review",
      ],
      requirements: {
        requiresAsiOrFeat: false,
        requiresSubclass: true,
        requiresProficiencySelection: false,
        requiresSkillSelection: false,
        newCantripsToLearn: 0,
        newSpellsToLearn: 1,
      },
      pendingProficiencyChoices: [],
      pendingFeatureChoices: [],
      isComplete: false,
      completionErrors: [],
    });

    render(<LevelUpModal targetLevel={2} onClose={vi.fn()} />);

    const trackerLabels = Array.from(
      document.querySelectorAll(".step-tracker .step-label"),
    ).map((el) => el.textContent?.trim());

    expect(trackerLabels).toEqual([
      "Class",
      "Subclass",
      "Hit Points",
      "Spells",
      "Features",
      "Review",
    ]);
  });

  it("updates completed, active, and locked tracker states as user advances", async () => {
    const user = userEvent.setup();
    render(<LevelUpModal targetLevel={2} onClose={vi.fn()} />);

    const getTrackerItems = (): HTMLElement[] =>
      Array.from(document.querySelectorAll(".step-tracker .step-item"));

    let items = getTrackerItems();
    expect(items[0].classList.contains("is-active")).toBe(true);
    expect(items[1].classList.contains("is-locked")).toBe(true);

    await user.click(screen.getByRole("button", { name: /next/i }));

    items = getTrackerItems();
    expect(items[0].classList.contains("is-completed")).toBe(true);
    expect(items[1].classList.contains("is-active")).toBe(true);
  });
});