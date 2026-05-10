import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { WizardStepNav } from "./WizardStepNav";

describe("WizardStepNav", () => {
  const steps = [
    { id: "race", label: "1. Race" },
    { id: "class", label: "2. Class" },
    { id: "spells", label: "3. Spells" },
  ];

  it("renders all step buttons", () => {
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={0}
        onStepClick={() => {}}
        isStepDisabled={() => false}
      />
    );

    expect(screen.getByRole("button", { name: "1. Race" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "2. Class" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "3. Spells" })
    ).toBeInTheDocument();
  });

  it("marks the current step as active", () => {
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={1}
        onStepClick={() => {}}
        isStepDisabled={() => false}
      />
    );

    const classBtn = screen.getByRole("button", { name: "2. Class" });
    expect(classBtn).toHaveClass("active");
  });

  it("marks the first step as inactive when not current", () => {
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={1}
        onStepClick={() => {}}
        isStepDisabled={() => false}
      />
    );

    const raceBtn = screen.getByRole("button", { name: "1. Race" });
    expect(raceBtn).not.toHaveClass("active");
  });

  it("calls onStepClick with the correct index when a button is clicked", async () => {
    const mockClick = vi.fn();
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={0}
        onStepClick={mockClick}
        isStepDisabled={() => false}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "2. Class" }));
    expect(mockClick).toHaveBeenCalledWith(1);
  });

  it("disables buttons when isStepDisabled returns true", () => {
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={0}
        onStepClick={() => {}}
        isStepDisabled={(index) => index > 0}
      />
    );

    const raceBtn = screen.getByRole("button", { name: "1. Race" });
    const classBtn = screen.getByRole("button", { name: "2. Class" });
    const spellsBtn = screen.getByRole("button", { name: "3. Spells" });

    expect(raceBtn).not.toBeDisabled();
    expect(classBtn).toBeDisabled();
    expect(spellsBtn).toBeDisabled();
  });

  it("adds disabled class to disabled buttons", () => {
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={0}
        onStepClick={() => {}}
        isStepDisabled={(index) => index > 0}
      />
    );

    const classBtn = screen.getByRole("button", { name: "2. Class" });
    expect(classBtn).toHaveClass("disabled");
  });

  it("prevents calling onStepClick when a disabled button is clicked", async () => {
    const mockClick = vi.fn();
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={0}
        onStepClick={mockClick}
        isStepDisabled={(index) => index > 0}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "2. Class" }));
    expect(mockClick).not.toHaveBeenCalled();
  });

  it("handles multiple clicks on different steps", async () => {
    const mockClick = vi.fn();
    render(
      <WizardStepNav
        steps={steps}
        currentStepIndex={0}
        onStepClick={mockClick}
        isStepDisabled={() => false}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "1. Race" }));
    await userEvent.click(screen.getByRole("button", { name: "2. Class" }));
    await userEvent.click(screen.getByRole("button", { name: "3. Spells" }));

    expect(mockClick).toHaveBeenCalledWith(0);
    expect(mockClick).toHaveBeenCalledWith(1);
    expect(mockClick).toHaveBeenCalledWith(2);
    expect(mockClick).toHaveBeenCalledTimes(3);
  });
});
