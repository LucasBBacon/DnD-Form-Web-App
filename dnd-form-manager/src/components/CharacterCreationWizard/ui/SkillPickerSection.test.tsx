import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SkillPickerSection } from "./SkillPickerSection";
import type { SkillProficiencyRequirement } from "../../../types/creationRequirement";

describe("SkillPickerSection", () => {
  const mockRequirement: SkillProficiencyRequirement = {
    id: "test-skill-req",
    type: "skill_proficiency",
    wizardStage: "race",
    required: 2,
    label: "Choose 2 skills",
    pool: ["animal_handling", "insight", "medicine", "perception", "survival"],
    isBlocking: true,
    isResolved: false,
    sourceId: "test-feature",
    sourceName: "Test Feature",
    current: []
  };

  it("renders the requirement label", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={[]}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByText(/Choose 2 skills/, { exact: false }),
    ).toBeInTheDocument();
  });

  it("displays remaining count when no skills are selected", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={[]}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByText("Choose 2 skills (2 more needed)"),
    ).toBeInTheDocument();
  });

  it("updates remaining count as skills are selected", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={["animal_handling"]}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByText("Choose 2 skills (1 more needed)"),
    ).toBeInTheDocument();
  });

  it("shows checkmark when all skills are selected", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={["animal_handling", "insight"]}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText("Choose 2 skills ✓")).toBeInTheDocument();
  });

  it("renders all skill chips", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={[]}
        onToggle={() => {}}
      />,
    );

    expect(screen.getByText("Animal Handling")).toBeInTheDocument();
    expect(screen.getByText("Insight")).toBeInTheDocument();
    expect(screen.getByText("Medicine")).toBeInTheDocument();
    expect(screen.getByText("Perception")).toBeInTheDocument();
    expect(screen.getByText("Survival")).toBeInTheDocument();
  });

  it("marks selected skills with the selected class", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={["animal_handling", "insight"]}
        onToggle={() => {}}
      />,
    );

    const animalHandlingChip = screen
      .getByText("Animal Handling")
      .closest(".skill-chip");
    const insightChip = screen.getByText("Insight").closest(".skill-chip");
    const medicineChip = screen.getByText("Medicine").closest(".skill-chip");

    expect(animalHandlingChip).toHaveClass("selected");
    expect(insightChip).toHaveClass("selected");
    expect(medicineChip).not.toHaveClass("selected");
  });

  it("calls onToggle when a skill chip is clicked", async () => {
    const mockToggle = vi.fn();
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={[]}
        onToggle={mockToggle}
      />,
    );

    await userEvent.click(screen.getByText("Animal Handling"));
    expect(mockToggle).toHaveBeenCalledWith("animal_handling");
  });

  it("disables skill chips when required count is reached", () => {
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={["animal_handling", "insight"]}
        onToggle={() => {}}
      />,
    );

    const medicineChip = screen.getByText("Medicine").closest(".skill-chip");
    const perceptionChip = screen
      .getByText("Perception")
      .closest(".skill-chip");

    expect(medicineChip).toHaveClass("disabled");
    expect(perceptionChip).toHaveClass("disabled");
  });

  it("does not call onToggle when clicking a disabled skill chip", async () => {
    const mockToggle = vi.fn();
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={["animal_handling", "insight"]}
        onToggle={mockToggle}
      />,
    );

    await userEvent.click(screen.getByText("Medicine"));
    expect(mockToggle).not.toHaveBeenCalled();
  });

  it("allows toggling selected skills even when at the limit", async () => {
    const mockToggle = vi.fn();
    render(
      <SkillPickerSection
        requirement={mockRequirement}
        currentSelections={["animal_handling", "insight"]}
        onToggle={mockToggle}
      />,
    );

    await userEvent.click(screen.getByText("Animal Handling"));
    expect(mockToggle).toHaveBeenCalledWith("animal_handling");
  });

  it("handles requirements with different required counts", () => {
    const req3Skills: SkillProficiencyRequirement = {
      ...mockRequirement,
      required: 3,
      label: "Choose 3 skills",
    };

    render(
      <SkillPickerSection
        requirement={req3Skills}
        currentSelections={["animal_handling"]}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByText("Choose 3 skills (2 more needed)"),
    ).toBeInTheDocument();
  });
});
