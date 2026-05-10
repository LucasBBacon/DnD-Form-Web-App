import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpellRow } from "./SpellRow";

const baseSpell = {
  id: "fireball",
  name: "Fireball",
  level: 3,
  school: "evocation",
  castingTime: "1 action",
  range: "150 feet",
  duration: "Instantaneous",
  concentration: false,
  ritual: false,
  classes: ["wizard"],
  components: { vocal: true, somatic: true, material: false },
  lore: {
    shortDescription: "A sphere of fire explodes.",
    fullText: "A bright streak flashes from your pointing finger...",
  },
  savingThrow: "DEX",
  output: { damage: [{ type: "fire", dice: "8d6" }] },
};

const baseProps = {
  spell: baseSpell,
  eligible: true,
  isExpanded: false,
  onToggle: vi.fn(),
  classNames: ["Wizard"],
  castingStats: { saveDC: 16, attackBonus: 6 },
  innateEntries: [],
  hasDamageOutput: true,
};

describe("SpellRow", () => {
  it("renders spell name and short description when collapsed", () => {
    render(<SpellRow {...baseProps} />);
    expect(screen.getByText("Fireball")).toBeInTheDocument();
    expect(screen.getByText("A sphere of fire explodes.")).toBeInTheDocument();
  });

  it("renders level and school in collapsed view", () => {
    render(<SpellRow {...baseProps} />);
    expect(screen.getByText("Level 3")).toBeInTheDocument();
    expect(screen.getByText("Evocation")).toBeInTheDocument();
  });

  it("shows eligible badge when eligible", () => {
    render(<SpellRow {...baseProps} eligible />);
    expect(screen.getByText("Eligible")).toBeInTheDocument();
  });

  it("shows not eligible badge when not eligible", () => {
    render(<SpellRow {...baseProps} eligible={false} />);
    expect(screen.getByText("Not eligible")).toBeInTheDocument();
  });

  it("renders full details when expanded", () => {
    render(<SpellRow {...baseProps} isExpanded />);
    expect(screen.getByText("1 action")).toBeInTheDocument();
    expect(screen.getByText("150 feet")).toBeInTheDocument();
    expect(screen.getByText("Instantaneous")).toBeInTheDocument();
  });

  it("calls onToggle when button is clicked", async () => {
    const onToggle = vi.fn();
    render(<SpellRow {...baseProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("renders casting stats when provided and expanded", () => {
    render(<SpellRow {...baseProps} isExpanded castingStats={{ saveDC: 16, attackBonus: 6 }} />);
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("does not render casting stats section when castingStats is null", () => {
    render(<SpellRow {...baseProps} isExpanded castingStats={null} />);
    expect(screen.queryByText("Save DC:")).not.toBeInTheDocument();
  });

  it("renders innate sources when provided", () => {
    render(
      <SpellRow
        {...baseProps}
        isExpanded
        innateEntries={[
          {
            spellId: "fireball",
            sourceTraitName: "Dragon Ancestry",
            spellSaveDC: 15,
            spellAttackBonus: 5,
          },
        ]}
      />,
    );
    expect(screen.getByText("Innate Source:")).toBeInTheDocument();
    expect(screen.getByText("Dragon Ancestry")).toBeInTheDocument();
  });

  it("hides details when isExpanded is false", () => {
    render(<SpellRow {...baseProps} isExpanded={false} />);
    expect(screen.queryByText("1 action")).not.toBeInTheDocument();
  });
});
