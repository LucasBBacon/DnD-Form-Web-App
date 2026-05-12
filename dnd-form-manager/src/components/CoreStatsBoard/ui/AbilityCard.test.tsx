import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AbilityCard } from "./AbilityCard";

const baseProps = {
  abilityName: "Strength",
  score: 16,
  modifier: 3,
  save: { modifier: 5, isProficient: true },
  skills: [
    {
      key: "athletics",
      label: "Athletics",
      modifier: 5,
      isProficient: true,
      isExpertise: false,
      hasAdvantage: false,
      hasDisadvantage: false,
      tooltip: "",
    },
  ],
};

describe("AbilityCard", () => {
  it("renders the ability name uppercased", () => {
    render(<AbilityCard {...baseProps} />);
    expect(screen.getByText("STRENGTH")).toBeInTheDocument();
  });

  it("renders the score and modifier", () => {
    render(<AbilityCard {...baseProps} />);
    expect(screen.getByText("16")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("renders the Saving Throw row", () => {
    render(<AbilityCard {...baseProps} />);
    expect(screen.getByText("Saving Throw")).toBeInTheDocument();
  });

  it("renders each skill row", () => {
    render(<AbilityCard {...baseProps} />);
    expect(screen.getByText("Athletics")).toBeInTheDocument();
  });

  it("renders 'No associated skills' when skills is empty", () => {
    render(<AbilityCard {...baseProps} skills={[]} />);
    expect(screen.getByText("No associated skills")).toBeInTheDocument();
  });
});
