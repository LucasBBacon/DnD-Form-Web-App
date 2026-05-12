import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpellFilterBar } from "./SpellFilterBar";

const classLabelMap = new Map([
  ["wizard", "Wizard"],
  ["cleric", "Cleric"],
]);

const base = {
  selectedLevel: "all",
  selectedSchool: "all",
  selectedClassId: "all",
  availabilityFilter: "all" as const,
  levelOptions: [0, 1, 2, 3],
  schoolOptions: ["evocation", "illusion"],
  classOptions: ["wizard", "cleric"],
  classLabelMap,
  onLevelChange: vi.fn(),
  onSchoolChange: vi.fn(),
  onClassChange: vi.fn(),
  onAvailabilityChange: vi.fn(),
};

describe("SpellFilterBar", () => {
  it("renders all four filter labels", () => {
    render(<SpellFilterBar {...base} />);
    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("School")).toBeInTheDocument();
    expect(screen.getByText("Class")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
  });

  it("calls onLevelChange when level select changes", async () => {
    const onLevelChange = vi.fn();
    render(<SpellFilterBar {...base} onLevelChange={onLevelChange} />);
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by level"),
      "1",
    );
    expect(onLevelChange).toHaveBeenCalledWith("1");
  });

  it("calls onSchoolChange when school select changes", async () => {
    const onSchoolChange = vi.fn();
    render(<SpellFilterBar {...base} onSchoolChange={onSchoolChange} />);
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by school"),
      "evocation",
    );
    expect(onSchoolChange).toHaveBeenCalledWith("evocation");
  });

  it("calls onClassChange when class select changes", async () => {
    const onClassChange = vi.fn();
    render(<SpellFilterBar {...base} onClassChange={onClassChange} />);
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by class"),
      "wizard",
    );
    expect(onClassChange).toHaveBeenCalledWith("wizard");
  });

  it("calls onAvailabilityChange when availability select changes", async () => {
    const onAvailabilityChange = vi.fn();
    render(
      <SpellFilterBar {...base} onAvailabilityChange={onAvailabilityChange} />,
    );
    await userEvent.selectOptions(
      screen.getByLabelText("Filter by availability"),
      "eligible",
    );
    expect(onAvailabilityChange).toHaveBeenCalledWith("eligible");
  });

  it("renders class labels from the classLabelMap", () => {
    render(<SpellFilterBar {...base} />);
    expect(screen.getByRole("option", { name: "Wizard" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Cleric" })).toBeInTheDocument();
  });
});
