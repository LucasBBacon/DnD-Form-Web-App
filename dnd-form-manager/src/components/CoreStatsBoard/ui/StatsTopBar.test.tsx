import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsTopBar } from "./StatsTopBar";

const passives = { perception: 16, investigation: 12, insight: 13 };

describe("StatsTopBar", () => {
  it("renders the proficiency bonus with + sign", () => {
    render(<StatsTopBar proficiencyBonus={3} passives={passives} />);
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("renders negative proficiency bonus correctly", () => {
    render(<StatsTopBar proficiencyBonus={-1} passives={passives} />);
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("renders passive perception value", () => {
    render(<StatsTopBar proficiencyBonus={3} passives={passives} />);
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("renders passive investigation value", () => {
    render(<StatsTopBar proficiencyBonus={3} passives={passives} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders passive insight value", () => {
    render(<StatsTopBar proficiencyBonus={3} passives={passives} />);
    expect(screen.getByText("13")).toBeInTheDocument();
  });
});
