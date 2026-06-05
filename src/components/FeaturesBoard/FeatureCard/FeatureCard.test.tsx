import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FeatureCard } from "./FeatureCard";

const baseProps = {
  traitId: "trait_darkvision",
  name: "Darkvision",
  sources: [{ key: "race-elf", kind: "race", label: "Elf" }],
  lore: {
    shortDescription: "You can see in dim light within 60 feet.",
    fullText:
      "You can see in dim light within 60 feet as if it were bright light.",
  },
};

describe("FeatureCard", () => {
  it("renders feature name and source tag", () => {
    render(<FeatureCard {...baseProps} />);

    expect(screen.getByText("Darkvision")).toBeInTheDocument();
    expect(screen.getByText("Elf")).toBeInTheDocument();
  });

  it("renders short description while collapsed", () => {
    render(<FeatureCard {...baseProps} />);

    expect(
      screen.getByText("You can see in dim light within 60 feet."),
    ).toBeInTheDocument();
  });

  it("expands to show detailed lore on click", () => {
    render(<FeatureCard {...baseProps} />);

    fireEvent.click(screen.getByText("Darkvision"));

    expect(
      screen.getByText(
        "You can see in dim light within 60 feet as if it were bright light.",
      ),
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
