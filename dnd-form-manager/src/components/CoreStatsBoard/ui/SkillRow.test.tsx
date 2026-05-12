import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillRow } from "./SkillRow";

describe("SkillRow", () => {
  it("renders the skill label and formatted modifier", () => {
    render(<SkillRow label="Perception" modifier={5} isProficient={false} />);
    expect(screen.getByText("Perception")).toBeInTheDocument();
    expect(screen.getByText("+5")).toBeInTheDocument();
  });

  it("renders a negative modifier with minus sign", () => {
    render(<SkillRow label="Deception" modifier={-1} isProficient={false} />);
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("applies active class to prof-dot when proficient", () => {
    const { container } = render(
      <SkillRow label="Stealth" modifier={3} isProficient />,
    );
    expect(container.querySelector(".prof-dot")).toHaveClass("active");
  });

  it("applies expertise class when isExpertise is true", () => {
    const { container } = render(
      <SkillRow label="Stealth" modifier={7} isProficient isExpertise />,
    );
    expect(container.querySelector(".prof-dot")).toHaveClass("expertise");
  });

  it("shows advantage indicator when hasAdvantage is true", () => {
    render(
      <SkillRow label="Athletics" modifier={4} isProficient hasAdvantage />,
    );
    expect(screen.getByText("(A)", { exact: false })).toBeInTheDocument();
  });

  it("shows disadvantage indicator when hasDisadvantage is true", () => {
    render(
      <SkillRow
        label="Stealth"
        modifier={2}
        isProficient={false}
        hasDisadvantage
      />,
    );
    expect(screen.getByText("(D)", { exact: false })).toBeInTheDocument();
  });

  it("applies save-row class when isSave is true", () => {
    const { container } = render(
      <SkillRow label="Saving Throw" modifier={3} isProficient isSave />,
    );
    expect(container.firstChild).toHaveClass("save-row");
  });
});
