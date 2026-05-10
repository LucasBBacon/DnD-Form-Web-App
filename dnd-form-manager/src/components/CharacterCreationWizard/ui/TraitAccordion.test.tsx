import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TraitAccordion } from "./TraitAccordion";

const traits = [
  {
    name: "Darkvision",
    shortDescription: "See in dim light within 60 feet.",
    fullDescription: "Full darkvision description.",
    source: "base" as const,
  },
  {
    name: "Fey Ancestry",
    shortDescription: "Advantage on charm saves.",
    fullDescription: "Full fey ancestry description.",
    source: "base" as const,
  },
];

describe("TraitAccordion", () => {
  it("renders all trait names", () => {
    render(<TraitAccordion traits={traits} expandedIndex={null} onToggle={() => {}} />);
    expect(screen.getByText("Darkvision")).toBeInTheDocument();
    expect(screen.getByText("Fey Ancestry")).toBeInTheDocument();
  });

  it("shows short descriptions when collapsed", () => {
    render(<TraitAccordion traits={traits} expandedIndex={null} onToggle={() => {}} />);
    expect(screen.getByText("See in dim light within 60 feet.")).toBeInTheDocument();
  });

  it("shows full description for the expanded trait", () => {
    render(<TraitAccordion traits={traits} expandedIndex={0} onToggle={() => {}} />);
    expect(screen.getByText("Full darkvision description.")).toBeInTheDocument();
  });

  it("hides short description for the expanded trait", () => {
    render(<TraitAccordion traits={traits} expandedIndex={0} onToggle={() => {}} />);
    expect(screen.queryByText("See in dim light within 60 feet.")).not.toBeInTheDocument();
  });

  it("calls onToggle with the index when a trait is clicked", async () => {
    const onToggle = vi.fn();
    render(<TraitAccordion traits={traits} expandedIndex={null} onToggle={onToggle} />);
    await userEvent.click(screen.getByText("Fey Ancestry"));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it("applies open class to the expanded trait", () => {
    const { container } = render(
      <TraitAccordion traits={traits} expandedIndex={1} onToggle={() => {}} />,
    );
    const items = container.querySelectorAll(".trait-accordion");
    expect(items[1]).toHaveClass("open");
    expect(items[0]).not.toHaveClass("open");
  });
});
