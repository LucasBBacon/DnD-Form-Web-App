/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SavingThrowsBlock } from "./SavingThrowsBlock";
import { useSkills } from "../../hooks/useSkills";

vi.mock("../../hooks/useSkills");

describe("SkillAndSavesBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSkills).mockReturnValue({
      calculatedSaves: {
        str: { total: 5, isProficient: true },
        dex: { total: 2, isProficient: false },
        con: { total: 3, isProficient: true },
        int: { total: -1, isProficient: false },
        wis: { total: 1, isProficient: false },
        cha: { total: 4, isProficient: true },
      },
      calculatedSkills: {},
      passives: {
        perception: 10,
        investigation: 10,
        insight: 10,
      },
      proficiencyBonus: 3,
    } as any);
  });

  it("renders saves in Strength to Charisma order with title case labels", () => {
    render(<SavingThrowsBlock />);

    const expectedOrder = [
      "Strength",
      "Dexterity",
      "Constitution",
      "Intelligence",
      "Wisdom",
      "Charisma",
    ];

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(expectedOrder.length);

    rows.forEach((row, index) => {
      expect(within(row).getByText(expectedOrder[index])).toBeInTheDocument();
    });
  });

  it("renders save row content in indicator, value, label order", () => {
    const { container } = render(<SavingThrowsBlock />);

    const firstRow = container.querySelector(".save-row");
    expect(firstRow).not.toBeNull();

    const children = Array.from(firstRow!.children);
    expect(children[0]).toHaveClass("save-indicator");
    expect(children[1]).toHaveClass("save-value-wrap");
    expect(children[2]).toHaveClass("save-name");
    expect(within(children[1] as HTMLElement).getByText("+5")).toHaveClass(
      "save-value",
    );
    expect(children[2]).toHaveTextContent("Strength");
  });

  it("applies filled indicator class only for proficient saving throws", () => {
    const { container } = render(<SavingThrowsBlock />);

    const indicators = container.querySelectorAll(".save-indicator");
    expect(indicators).toHaveLength(6);

    expect(indicators[0]).toHaveClass("filled");
    expect(indicators[1]).not.toHaveClass("filled");
    expect(indicators[2]).toHaveClass("filled");
  });

  it("shows centered footer label for saving throws", () => {
    render(<SavingThrowsBlock />);

    expect(screen.getByText("SAVING THROWS")).toBeInTheDocument();
  });

  it("does not prefix a plus sign for zero modifiers", () => {
    vi.mocked(useSkills).mockReturnValue({
      calculatedSaves: {
        str: { total: 0, isProficient: false },
        dex: { total: 2, isProficient: false },
        con: { total: 3, isProficient: true },
        int: { total: -1, isProficient: false },
        wis: { total: 1, isProficient: false },
        cha: { total: 4, isProficient: true },
      },
      calculatedSkills: {},
      passives: {
        perception: 10,
        investigation: 10,
        insight: 10,
      },
      proficiencyBonus: 3,
    } as any);

    render(<SavingThrowsBlock />);

    const firstRow = screen.getAllByRole("listitem")[0];
    expect(within(firstRow).getByText("0")).toBeInTheDocument();
    expect(within(firstRow).queryByText("+0")).not.toBeInTheDocument();
  });
});
