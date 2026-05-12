import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HitDiceRollPanel } from "./HitDiceRollPanel";

const base = {
  availableDice: 3,
  hitDie: 8 as const,
  conMod: 2,
  isFullyHealed: false,
  onRoll: vi.fn(),
};

describe("HitDiceRollPanel", () => {
  it("shows no dice warning when availableDice is 0", () => {
    render(<HitDiceRollPanel {...base} availableDice={0} />);
    expect(screen.getByText(/no Hit Dice remaining/i)).toBeInTheDocument();
  });

  it("shows fully healed message when isFullyHealed", () => {
    render(<HitDiceRollPanel {...base} isFullyHealed />);
    expect(screen.getByText(/maximum Hit Points/i)).toBeInTheDocument();
  });

  it("renders roll options when dice available and not fully healed", () => {
    render(<HitDiceRollPanel {...base} />);
    expect(screen.getByText("Digital Roll")).toBeInTheDocument();
    expect(screen.getByText("Physical Roll")).toBeInTheDocument();
  });

  it("calls onRoll with clamped value when Apply is clicked", async () => {
    const onRoll = vi.fn();
    render(<HitDiceRollPanel {...base} onRoll={onRoll} />);
    const input = screen.getByPlaceholderText(/Roll a d8/i);
    await userEvent.type(input, "5");
    await userEvent.click(screen.getByText("Apply"));
    // 5 + conMod(2) = 7
    expect(onRoll).toHaveBeenCalledWith(7);
  });

  it("does not call onRoll when input is empty and Apply is clicked", async () => {
    const onRoll = vi.fn();
    render(<HitDiceRollPanel {...base} onRoll={onRoll} />);
    await userEvent.click(screen.getByText("Apply"));
    expect(onRoll).not.toHaveBeenCalled();
  });
});
