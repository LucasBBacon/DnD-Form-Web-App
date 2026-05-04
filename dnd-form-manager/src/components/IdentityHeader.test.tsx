/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IdentityHeader } from "./IdentityHeader";
import { BASELINE_CHARACTER_STATE, useCharacterStore } from "../store/useCharacterStore";

describe("IdentityHeader level-up launch", () => {
  beforeEach(() => {
    useCharacterStore.setState({
      ...BASELINE_CHARACTER_STATE,
      isSetupComplete: true,
      classId: "class_fighter",
      classTracks: [{ classId: "class_fighter", subclassId: null, level: 1 }],
      level: 1,
      choicesByLevel: { 1: { hpGained: 10 } },
      levelUpModalState: {
        isOpen: false,
        targetLevel: null,
        isBlocking: false,
      },
    } as any);
  });

  it("opens the shared level-up modal from the class and level field when a target exists", async () => {
    const user = userEvent.setup();

    useCharacterStore.setState({
      levelUpMode: "milestone_anytime",
    } as any);

    render(<IdentityHeader />);

    await user.click(screen.getByText("CLASS & LEVEL"));

    expect(useCharacterStore.getState().levelUpModalState).toEqual({
      isOpen: true,
      targetLevel: 2,
      isBlocking: false,
    });
  });

  it("does not open the shared level-up modal from the header when no target is available", async () => {
    const user = userEvent.setup();

    useCharacterStore.setState({
      levelUpMode: "xp_gated",
      xp: 0,
    } as any);

    render(<IdentityHeader />);

    await user.click(screen.getByText("CLASS & LEVEL"));

    expect(useCharacterStore.getState().levelUpModalState).toEqual({
      isOpen: false,
      targetLevel: null,
      isBlocking: false,
    });
  });

  it("updates level-up mode from the header selector", async () => {
    const user = userEvent.setup();

    render(<IdentityHeader />);

    const modeSelect = screen.getByLabelText("Level Up Mode");
    await user.selectOptions(modeSelect, "milestone_anytime");

    expect(useCharacterStore.getState().levelUpMode).toBe("milestone_anytime");
  });
});