import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AbilityScoresBlock } from "./AbilityScoresBlock";

describe("AbilityScoresBlock", () => {
  it("renders all six abilities in 5e top-to-bottom order", () => {
    render(
      <AbilityScoresBlock
        scores={{ str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 }}
        modifiers={{ str: 2, dex: 2, con: 1, int: 1, wis: 0, cha: -1 }}
      />,
    );

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);

    const orderedNames = cards.map((card) =>
      within(card).getByText(/^(strength|dexterity|constitution|intelligence|wisdom|charisma)$/i)
        .textContent?.toLowerCase(),
    );

    expect(orderedNames).toEqual([
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ]);
  });

  it("formats modifiers with plus and minus signs, and no sign for zero", () => {
    render(
      <AbilityScoresBlock
        scores={{ str: 20, dex: 8, con: 10, int: 10, wis: 10, cha: 10 }}
        modifiers={{ str: 5, dex: -1, con: 0, int: 0, wis: 0, cha: 0 }}
      />,
    );

    expect(screen.getByText("+5")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
  });
});
