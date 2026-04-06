/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpellSlotsTracker } from "./SpellSlotsTracker";
import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";

vi.mock("../hooks/useSpellcasting");
vi.mock("../store/useCharacterStore");

describe("SpellSlotsTracker", () => {
  const expendSpellSlot = vi.fn();
  const expendPactSlot = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      expendSpellSlot,
      expendPactSlot,
    } as any);
  });

  it("renders both shared and pact sections together when both pools exist", () => {
    vi.mocked(useSpellcasting).mockReturnValue({
      isSpellcaster: true,
      canCastSpells: true,
      casting: {
        ability: "cha",
        preparationType: "pact",
        saveDC: 13,
        attackBonus: 5,
      },
      pools: {
        known: { selected: [], max: 0 },
        prepared: { selected: [], max: 0 },
        cantrips: { max: 2 },
        innate: [],
      },
      slots: {
        shared: {
          1: { total: 2, expended: 1 },
        },
        pact: {
          level: 2,
          total: 2,
          expended: 1,
        },
      },
      diagnostics: {
        selections: {
          invalidKnownSpellIds: [],
          invalidPreparedSpellIds: [],
          knownSpellOverflow: 0,
          preparedSpellOverflow: 0,
        },
        classBreakdown: [],
      },
    } as any);

    render(<SpellSlotsTracker />);

    expect(screen.getByText("Shared Spell Slots")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Pact Slots" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Refreshes on a Long Rest.")).toBeInTheDocument();
    expect(screen.getByText("Refreshes on a Short Rest.")).toBeInTheDocument();
  });

  it("dispatches the correct actions for shared and pact slot buttons", async () => {
    const user = userEvent.setup();

    vi.mocked(useSpellcasting).mockReturnValue({
      isSpellcaster: true,
      canCastSpells: true,
      casting: {
        ability: "cha",
        preparationType: "pact",
        saveDC: 13,
        attackBonus: 5,
      },
      pools: {
        known: { selected: [], max: 0 },
        prepared: { selected: [], max: 0 },
        cantrips: { max: 2 },
        innate: [],
      },
      slots: {
        shared: {
          1: { total: 2, expended: 0 },
        },
        pact: {
          level: 2,
          total: 2,
          expended: 0,
        },
      },
      diagnostics: {
        selections: {
          invalidKnownSpellIds: [],
          invalidPreparedSpellIds: [],
          knownSpellOverflow: 0,
          preparedSpellOverflow: 0,
        },
        classBreakdown: [],
      },
    } as any);

    render(<SpellSlotsTracker />);

    await user.click(screen.getByLabelText("Shared slot level 1 1"));
    await user.click(screen.getByLabelText("Pact slot 1"));

    expect(expendSpellSlot).toHaveBeenCalledWith(1);
    expect(expendPactSlot).toHaveBeenCalledTimes(1);
  });

  it("shows fallback message when spellcaster has no slots", () => {
    vi.mocked(useSpellcasting).mockReturnValue({
      isSpellcaster: true,
      canCastSpells: true,
      casting: {
        ability: "cha",
        preparationType: "known",
        saveDC: 13,
        attackBonus: 5,
      },
      pools: {
        known: { selected: [], max: 0 },
        prepared: { selected: [], max: 0 },
        cantrips: { max: 0 },
        innate: [],
      },
      slots: {
        shared: {},
        pact: null,
      },
      diagnostics: {
        selections: {
          invalidKnownSpellIds: [],
          invalidPreparedSpellIds: [],
          knownSpellOverflow: 0,
          preparedSpellOverflow: 0,
        },
        classBreakdown: [],
      },
    } as any);

    render(<SpellSlotsTracker />);

    expect(screen.getByText("No spell slots available.")).toBeInTheDocument();
  });
});
