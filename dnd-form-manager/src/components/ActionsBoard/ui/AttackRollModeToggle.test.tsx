import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttackRollModeToggle } from "./AttackRollModeToggle";

describe("AttackRollModeToggle", () => {
  it("renders all three mode options", () => {
    render(
      <AttackRollModeToggle entryId="atk1" mode="normal" onChange={() => {}} />,
    );
    expect(screen.getByLabelText("Normal")).toBeInTheDocument();
    expect(screen.getByLabelText("Advantage")).toBeInTheDocument();
    expect(screen.getByLabelText("Disadvantage")).toBeInTheDocument();
  });

  it("marks the current mode radio as checked", () => {
    render(
      <AttackRollModeToggle
        entryId="atk1"
        mode="advantage"
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText("Advantage")).toBeChecked();
    expect(screen.getByLabelText("Normal")).not.toBeChecked();
  });

  it("calls onChange with the selected mode", async () => {
    const onChange = vi.fn();
    render(
      <AttackRollModeToggle entryId="atk1" mode="normal" onChange={onChange} />,
    );
    await userEvent.click(screen.getByLabelText("Disadvantage"));
    expect(onChange).toHaveBeenCalledWith("disadvantage");
  });
});
