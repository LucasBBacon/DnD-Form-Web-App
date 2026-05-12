import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureCard } from "./FeatureCard";

const baseProps = {
  name: "Darkvision",
  sources: [{ key: "race-elf", kind: "race", label: "Elf" }],
  description: "You can see in dim light within 60 feet.",
};

describe("FeatureCard", () => {
  it("renders the feature name", () => {
    render(<FeatureCard {...baseProps} />);
    expect(screen.getByText("Darkvision")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<FeatureCard {...baseProps} />);
    expect(
      screen.getByText("You can see in dim light within 60 feet."),
    ).toBeInTheDocument();
  });

  it("renders each source badge label", () => {
    render(<FeatureCard {...baseProps} />);
    expect(screen.getByText("Elf")).toBeInTheDocument();
  });

  it("applies the kind class to each source badge", () => {
    const { container } = render(<FeatureCard {...baseProps} />);
    expect(
      container.querySelector(".feature-source-badge--race"),
    ).toBeInTheDocument();
  });

  it("renders multiple source badges", () => {
    render(
      <FeatureCard
        {...baseProps}
        sources={[
          { key: "s1", kind: "class", label: "Fighter 5" },
          { key: "s2", kind: "feat", label: "War Caster" },
        ]}
      />,
    );
    expect(screen.getByText("Fighter 5")).toBeInTheDocument();
    expect(screen.getByText("War Caster")).toBeInTheDocument();
  });
});
