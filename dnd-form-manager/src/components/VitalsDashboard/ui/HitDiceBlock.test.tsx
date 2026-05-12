import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HitDiceBlock } from "./HitDiceBlock";

describe("HitDiceBlock", () => {
  it("renders available and total dice", () => {
    render(
      <HitDiceBlock
        available={3}
        total={5}
        onShortRest={() => {}}
        onLongRest={() => {}}
      />,
    );
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("renders Short Rest and Long Rest buttons", () => {
    render(
      <HitDiceBlock
        available={3}
        total={5}
        onShortRest={() => {}}
        onLongRest={() => {}}
      />,
    );
    expect(screen.getByText("Short Rest")).toBeInTheDocument();
    expect(screen.getByText("Long Rest")).toBeInTheDocument();
  });

  it("calls onShortRest when Short Rest is clicked", async () => {
    const onShortRest = vi.fn();
    render(
      <HitDiceBlock
        available={3}
        total={5}
        onShortRest={onShortRest}
        onLongRest={() => {}}
      />,
    );
    await userEvent.click(screen.getByText("Short Rest"));
    expect(onShortRest).toHaveBeenCalled();
  });

  it("calls onLongRest when Long Rest is clicked", async () => {
    const onLongRest = vi.fn();
    render(
      <HitDiceBlock
        available={3}
        total={5}
        onShortRest={() => {}}
        onLongRest={onLongRest}
      />,
    );
    await userEvent.click(screen.getByText("Long Rest"));
    expect(onLongRest).toHaveBeenCalled();
  });
});
