import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActionsBoard } from "./ActionsBoard";
import { useCombatActions } from "../hooks/useCombatActions";
import { useCharacterStore } from "../store/useCharacterStore";

vi.mock("../hooks/useCombatActions");
vi.mock("../store/useCharacterStore");

const buildCombatActions = () => ({
  spellcasting: {
    slots: {
      shared: {
        1: { total: 2, expended: 1 },
        2: { total: 1, expended: 1 },
      },
      pact: null,
    },
  },
  sections: {
    action: [
      {
        id: "spell:spell_magic_missile",
        name: "Magic Missile",
        section: "action",
        source: "spell",
        subtitle: "Level 1 Spell",
        quickStats: ["120 feet", "Instantaneous"],
        description: "Force darts strike automatically.",
        isExhausted: false,
        spellLevel: 1,
      },
      {
        id: "trait:action_breath_weapon_cold_cone",
        name: "Cold Breath",
        section: "action",
        source: "trait",
        subtitle: "Trait Action",
        quickStats: ["Self", "2d6 cold"],
        description: "Exhale destructive cold energy.",
        isExhausted: true,
        uses: {
          total: 1,
          remaining: 0,
        },
      },
    ],
    bonus_action: [],
    reaction: [],
  },
  toRomanNumeral: (level: number) => (level === 1 ? "I" : "C"),
});

describe("ActionsBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCombatActions).mockReturnValue(buildCombatActions() as never);
    vi.mocked(useCharacterStore).mockReturnValue({
      expendTraitActionUse: vi.fn(),
      restoreTraitActionUse: vi.fn(),
    } as never);
  });

  it("renders action-economy section headers and slot HUD", () => {
    render(<ActionsBoard />);

    expect(screen.getByRole("heading", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bonus Actions" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reactions" })).toBeInTheDocument();

    expect(screen.getByText(/Lvl 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/\[o \]/i)).toBeInTheDocument();
  });

  it("renders spell level badge and exhausted trait state", () => {
    const { container } = render(<ActionsBoard />);

    expect(screen.getByText("I")).toBeInTheDocument();
    expect(screen.getByText(/Resource exhausted\./i)).toBeInTheDocument();

    const exhaustedCard = container.querySelector(".combat-action-card.is-exhausted");
    expect(exhaustedCard).not.toBeNull();
  });
});
