import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActionsBoardContainer } from "./ActionsBoardContainer";
import { useCombatActions } from "../../hooks/useCombatActions";
import { useCharacterStore } from "../../store/useCharacterStore";

vi.mock("../../hooks/useCombatActions");
vi.mock("../../store/useCharacterStore");
vi.mock("../ui/DiceRoller/DiceRoller", () => ({
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
          Array.from({ length: count }, () => 5),
          {
            total: count * 5,
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
    isSpellcaster: true,
    slots: {
      shared: {
        1: { total: 2, expended: 1 },
      },
      pact: null,
    },
    spellMetadata: {
      byId: {
        spell_magic_missile: {
          spellId: "spell_magic_missile",
          baseSpellLevel: 1,
          availableCastLevels: [1],
          selectedCastLevel: 1,
          canCast: true,
          canUseSharedSlot: true,
          canUsePactSlot: false,
          resolvedDamageEntries: [],
          resolvedHealingEntries: [],
        },
      },
      activeSpellIds: ["spell_magic_missile"],
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
            id: "attack-damage:longsword:0",
            count: 1,
            sides: 8,
            modifier: 3,
            label: "Damage (slashing)",
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
        isExhausted: false,
        uses: {
          total: 1,
          remaining: 1,
        },
      },
    ],
    bonus_action: [],
    reaction: [],
  },
  toRomanNumeral: (level: number) => (level === 1 ? "I" : "C"),
});

describe("ActionsBoardContainer", () => {
  const setStoreMock = (store: Record<string, unknown>) => {
    vi.mocked(useCharacterStore).mockImplementation(((
      selector?: (state: Record<string, unknown>) => unknown,
    ) => (typeof selector === "function" ? selector(store) : store)) as never);
  };

  let removeInventoryItemMock: ReturnType<typeof vi.fn>;
  let expendSpellSlotMock: ReturnType<typeof vi.fn>;
  let expendPactSlotMock: ReturnType<typeof vi.fn>;
  let expendTraitActionUseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    removeInventoryItemMock = vi.fn();
    expendSpellSlotMock = vi.fn();
    expendPactSlotMock = vi.fn();
    expendTraitActionUseMock = vi.fn();

    vi.mocked(useCombatActions).mockReturnValue(buildCombatActions() as never);
    setStoreMock({
      removeInventoryItem: removeInventoryItemMock,
      expendSpellSlot: expendSpellSlotMock,
      expendPactSlot: expendPactSlotMock,
      expendTraitActionUse: expendTraitActionUseMock,
    });
  });

  it("renders board title, spell slot HUD, and action section", () => {
    render(<ActionsBoardContainer />);

    expect(screen.getByText("Book of War")).toBeInTheDocument();
    expect(screen.getByText("Spell Slots")).toBeInTheDocument();
    expect(screen.getByText("Level I")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("expends trait use via container callback mapping", () => {
    render(<ActionsBoardContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Use" }));

    expect(expendTraitActionUseMock).toHaveBeenCalledWith(
      "action_breath_weapon_cold_cone",
    );
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

    render(<ActionsBoardContainer />);

    fireEvent.click(screen.getByRole("button", { name: "Damage (piercing)" }));

    expect(removeInventoryItemMock).toHaveBeenCalledWith("weapon_javelin", 1);
  });
});
