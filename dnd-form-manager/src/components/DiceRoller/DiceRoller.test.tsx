import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiceRoller } from "./DiceRoller";

describe("DiceRoller", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("completes a roll and reports summary", async () => {
    const onRollComplete = vi.fn();

    render(
      <DiceRoller
        sides={6}
        count={2}
        random={() => 0}
        animationMs={120}
        onRollComplete={onRollComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Roll 2d6" }));
    vi.advanceTimersByTime(150);

    expect(onRollComplete).toHaveBeenCalledTimes(1);
    expect(onRollComplete).toHaveBeenCalledWith(
      [1, 1],
      {
        sides: 6,
        count: 2,
        total: 2,
      },
    );
  });

  it("respects disabled state", async () => {
    const onRollComplete = vi.fn();

    render(
      <DiceRoller
        sides={8}
        count={1}
        disabled
        onRollComplete={onRollComplete}
      />,
    );

    const roller = screen.getByRole("button", { name: "Roll 1d8" });
    expect(roller).toBeDisabled();

    fireEvent.click(roller);
    vi.advanceTimersByTime(1200);

    expect(onRollComplete).not.toHaveBeenCalled();
  });
});
