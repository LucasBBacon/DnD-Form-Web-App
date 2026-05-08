// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShortRestModal } from "./ShortRestModal";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { getClassById } from "../data/staticDataApi";

vi.mock("../store/useCharacterStore");
vi.mock("../hooks/useCharacterStats");
vi.mock("../data/staticDataApi");
vi.mock("./DiceRoller/DiceRoller", () => ({
  DiceRoller: ({
    onRollComplete,
    disabled,
  }: {
    onRollComplete: (rolls: number[]) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onRollComplete([4])}
    >
      Mock Dice Roll
    </button>
  ),
}));

describe("ShortRestModal", () => {
  const onClose = vi.fn();
  const heal = vi.fn();
  const expendHitDie = vi.fn();
  const takeShortRest = vi.fn();
  const takeLongRest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getClassById).mockReturnValue({
      id: "class_fighter",
      hitDie: 10,
    } as never);

    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        modifiers: {
          con: 2,
        },
      },
      combat: {
        hp: {
          current: 14,
          max: 32,
        },
      },
    } as never);

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 5,
      classId: "class_fighter",
      expendedHitDice: 2,
      expendHitDie,
      heal,
      takeShortRest,
      takeLongRest,
    } as never);
  });

  it("applies manual short-rest heal and spends a hit die", async () => {
    const user = userEvent.setup();

    render(<ShortRestModal restType="short" onClose={onClose} />);

    const input = screen.getByPlaceholderText("Roll a d10...");
    await user.type(input, "7");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(heal).toHaveBeenCalledWith(9);
    expect(expendHitDie).toHaveBeenCalledTimes(1);
  });

  it("finishes short rest by invoking short-rest action and closing", async () => {
    const user = userEvent.setup();

    render(<ShortRestModal restType="short" onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Finish Short Rest" }));

    expect(takeShortRest).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("confirms long rest by invoking long-rest action and closing", async () => {
    const user = userEvent.setup();

    render(<ShortRestModal restType="long" onClose={onClose} />);

    expect(
      screen.getByText(/can only benefit from one long rest per 24 hours/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm Long Rest" }));

    expect(takeLongRest).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
