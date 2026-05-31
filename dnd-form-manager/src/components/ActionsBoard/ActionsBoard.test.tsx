import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActionsBoard } from "./ActionsBoard";
import { useCombatActions } from "../../hooks/useCombatActions";
import { useCharacterStore } from "../../store/useCharacterStore";

vi.mock("../../hooks/useCombatActions");
vi.mock("../../store/useCharacterStore");
vi.mock("../DiceRoller/DiceRoller", () => ({
  DiceRoller: ({
    sides = 20,
    count = 1,
    onRollComplete,
    rollLabel,
  }: {
    sides?: number;
    count?: number;
    onRollComplete?: (rolls: number[], summary: { total: number }) => void;
    rollLabel?: string;
  }) => (
    <button
      type="button"
      onClick={() =>
        onRollComplete?.(
          sides === 20 && count === 2
            ? [4, 17]
            : Array.from({ length: count }, () => 5),
          {
            total: sides === 20 && count === 2 ? 21 : count * 5,
          },
        )
      }
    >
      {rollLabel ?? `Mock d${sides}`}
    </button>
  ),
}));

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
        id: "atk:longsword:0",
        name: "Longsword",
        section: "action",
        source: "attack",
        subtitle: "Weapon Attack",
        quickStats: ["ATK +5", "1d8 + 3 slashing", "Melee"],
        description: "A trusty blade.",
        isExhausted: false,
        attackRoll: {
          id: "attack-roll:longsword:0",
          count: 1,
          sides: 20,
          modifier: 5,
          label: "To-Hit",
        },
        damageRolls: [
          {
            id: "attack-damage:longsword:0:0",
            count: 1,
            sides: 8,
            modifier: 3,
            label: "Damage (slashing)",
          },
          {
            id: "attack-damage:longsword:0:1",
            count: 1,
            sides: 6,
            modifier: 0,
            label: "Damage (fire)",
          },
        ],
      },
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
  let removeInventoryItemMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    removeInventoryItemMock = vi.fn();

    vi.mocked(useCombatActions).mockReturnValue(buildCombatActions() as never);
    vi.mocked(useCharacterStore).mockReturnValue({
      expendTraitActionUse: vi.fn(),
      restoreTraitActionUse: vi.fn(),
      removeInventoryItem: removeInventoryItemMock,
    } as never);
  });

  it("renders action-economy section headers and slot HUD", () => {
    render(<ActionsBoard />);

    expect(
      screen.getByRole("heading", { name: "Actions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bonus Actions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Reactions" }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Lvl 1:/i)).toBeInTheDocument();
    expect(screen.getByText(/\[o \]/i)).toBeInTheDocument();
  });

  it("renders spell level badge and exhausted trait state", () => {
    const { container } = render(<ActionsBoard />);

    expect(screen.getByText("I")).toBeInTheDocument();
    expect(screen.getByText(/Resource exhausted\./i)).toBeInTheDocument();

    const exhaustedCard = container.querySelector(
      ".combat-action-card.is-exhausted",
    );
    expect(exhaustedCard).not.toBeNull();
  });

  it("rolls to-hit and damage with inline result summaries", () => {
    render(<ActionsBoard />);

    fireEvent.click(screen.getByRole("button", { name: "Roll To-Hit" }));
    const toHitRollButtons = screen.getAllByRole("button", {
      name: "Roll To-Hit",
    });
    fireEvent.click(toHitRollButtons[toHitRollButtons.length - 1]);

    expect(screen.getByText(/To-Hit: 10 \(d20 5 \+ 5\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Damage (slashing)" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Roll Damage (slashing)" }),
    );

    expect(
      screen.getByText(/Damage \(slashing\): 8 \(5 \+ 3\)/i),
    ).toBeInTheDocument();
  });

  it("supports advantage and disadvantage to-hit modes", () => {
    render(<ActionsBoard />);

    fireEvent.click(screen.getByRole("radio", { name: "Advantage" }));
    fireEvent.click(screen.getByRole("button", { name: "Roll To-Hit" }));
    {
      const buttons = screen.getAllByRole("button", { name: "Roll To-Hit" });
      fireEvent.click(buttons[buttons.length - 1]);
    }

    expect(
      screen.getByText(
        /To-Hit: 22 \(d20 4\/17 -> keep 17 \(advantage\) \+ 5\)/i,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Disadvantage" }));
    fireEvent.click(screen.getByRole("button", { name: "Roll To-Hit" }));
    {
      const buttons = screen.getAllByRole("button", { name: "Roll To-Hit" });
      fireEvent.click(buttons[buttons.length - 1]);
    }

    expect(
      screen.getByText(
        /To-Hit: 9 \(d20 4\/17 -> keep 4 \(disadvantage\) \+ 5\)/i,
      ),
    ).toBeInTheDocument();
  });

  it("handles multi-damage roll-all workflow with independent result labels", () => {
    render(<ActionsBoard />);

    fireEvent.click(screen.getByRole("button", { name: "Roll All Damage" }));

    fireEvent.click(
      screen.getByRole("button", { name: "Roll Damage (slashing)" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Roll Damage (fire)" }),
    );

    expect(
      screen.getByText(/Damage \(slashing\): 8 \(5 \+ 3\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Damage \(fire\): 5 \(5\)/i)).toBeInTheDocument();
  });

  it("consumes a thrown weapon on damage roll", () => {
    vi.mocked(useCombatActions).mockReturnValue({
      ...buildCombatActions(),
      sections: {
        action: [
          {
            id: "atk:javelin:thrown",
            name: "Javelin [Thrown]",
            section: "action",
            source: "attack",
            subtitle: "Weapon Attack",
            quickStats: ["ATK +4", "1d6 + 2 piercing", "Range 30/120"],
            description: "Thrown javelin.",
            isExhausted: false,
            isThrown: true,
            throwableItemId: "weapon_javelin",
            throwableCount: 2,
            attackRoll: {
              id: "attack-roll:javelin:thrown",
              count: 1,
              sides: 20,
              modifier: 4,
              label: "To-Hit",
            },
            damageRolls: [
              {
                id: "attack-damage:javelin:thrown",
                count: 1,
                sides: 6,
                modifier: 2,
                label: "Damage (piercing)",
              },
            ],
          },
        ],
        bonus_action: [],
        reaction: [],
      },
    } as never);

    render(<ActionsBoard />);

    fireEvent.click(screen.getByRole("button", { name: "Damage (piercing)" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Roll Damage (piercing)" }),
    );

    expect(removeInventoryItemMock).toHaveBeenCalledWith("weapon_javelin", 1);
  });
});
