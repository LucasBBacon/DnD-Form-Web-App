import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeaponPropertyBadges } from "./WeaponPropertyBadges";
import type { WeaponPropertyCatalogEntry } from "../../../types/item";

describe("WeaponPropertyBadges", () => {
  const mockProperties: WeaponPropertyCatalogEntry[] = [
    {
      id: "prop:finesse",
      name: "Finesse",
      lore: {
        shortDescription: "Can use DEX or STR modifier",
        fullText: "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls.",
      },
    },
    {
      id: "prop:versatile",
      name: "Versatile",
      lore: {
        shortDescription: "1d8 one-handed or 1d10 two-handed",
        fullText: "This weapon can be used with one or two hands.",
      },
    },
  ];

  it("returns null when properties array is empty", () => {
    const { container } = render(<WeaponPropertyBadges properties={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all property badges", () => {
    render(<WeaponPropertyBadges properties={mockProperties} />);
    expect(screen.getByText("Finesse")).toBeInTheDocument();
    expect(screen.getByText("Versatile")).toBeInTheDocument();
  });

  it("renders single property when only one provided", () => {
    render(<WeaponPropertyBadges properties={[mockProperties[0]]} />);
    expect(screen.getByText("Finesse")).toBeInTheDocument();
    expect(screen.queryByText("Versatile")).not.toBeInTheDocument();
  });

  it("displays full text as title attribute", () => {
    render(<WeaponPropertyBadges properties={[mockProperties[0]]} />);
    const badge = screen.getByText("Finesse");
    expect(badge).toHaveAttribute(
      "title",
      "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls.",
    );
  });

  it("has correct aria-label with name and short description", () => {
    render(<WeaponPropertyBadges properties={[mockProperties[0]]} />);
    const badge = screen.getByText("Finesse");
    expect(badge).toHaveAttribute(
      "aria-label",
      "Finesse: Can use DEX or STR modifier",
    );
  });

  it("renders each badge with correct CSS class", () => {
    const { container } = render(
      <WeaponPropertyBadges properties={mockProperties} />,
    );
    const badges = container.querySelectorAll(".weapon-property-badge");
    expect(badges).toHaveLength(2);
    badges.forEach((badge) => {
      expect(badge).toHaveClass("weapon-property-badge");
    });
  });

  it("wraps all badges in container div", () => {
    const { container } = render(
      <WeaponPropertyBadges properties={mockProperties} />,
    );
    expect(container.querySelector(".weapon-property-badges")).toBeInTheDocument();
  });
});
