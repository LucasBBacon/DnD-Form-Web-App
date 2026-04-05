/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpellbookBlock } from "./SpellbookBlock";
import { useSpellcasting } from "../hooks/useSpellcasting";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllSpells, getSpellByID } from "../data/staticDataApi";

vi.mock("../hooks/useSpellcasting");
vi.mock("../store/useCharacterStore");
vi.mock("../data/staticDataApi");

describe("SpellbookBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      classId: "class_wizard",
      learnSpell: vi.fn(),
      prepareSpell: vi.fn(),
      unprepareSpell: vi.fn(),
    } as any);

    vi.mocked(getAllSpells).mockReturnValue([
      { id: "spell_magic_missile", level: 1, name: "Magic Missile", classes: ["class_wizard"] },
      { id: "spell_healing_word", level: 1, name: "Healing Word", classes: ["class_cleric"] },
      { id: "spell_dissonant_whispers", level: 1, name: "Dissonant Whispers", classes: ["class_bard"] },
    ] as any);

    vi.mocked(getSpellByID).mockImplementation((spellId) => {
      const map: Record<string, any> = {
        spell_magic_missile: {
          id: "spell_magic_missile",
          level: 1,
          name: "Magic Missile",
          school: "evocation",
          castingTime: "1 action",
          range: "120 feet",
          duration: "instantaneous",
          concentration: false,
          lore: { shortDescription: "Force darts." },
        },
        spell_healing_word: {
          id: "spell_healing_word",
          level: 1,
          name: "Healing Word",
          school: "evocation",
          castingTime: "1 bonus action",
          range: "60 feet",
          duration: "instantaneous",
          concentration: false,
          lore: { shortDescription: "Healing utterance." },
        },
      };

      return map[String(spellId)] || null;
    });
  });

  it("renders diagnostics for invalid selections and overflow", () => {
    vi.mocked(useSpellcasting).mockReturnValue({
      isSpellcaster: true,
      preparationType: "prepared",
      spellSaveDC: 14,
      spellAttackBonus: 6,
      maxSpellsKnown: 0,
      maxPreparedSpells: 2,
      classSpellcastingSummaries: [
        {
          classId: "class_wizard",
          classLevel: 4,
          preparationType: "prepared",
          spellcastingAbility: "int",
          maxCantrips: 3,
          maxSpellsKnown: 0,
          maxPreparedSpells: 2,
        },
      ],
      spellSelectionDiagnostics: {
        invalidKnownSpellIds: ["spell_healing_word"],
        invalidPreparedSpellIds: ["spell_healing_word"],
        knownSpellOverflow: 1,
        preparedSpellOverflow: 1,
      },
      spellsKnown: ["spell_magic_missile", "spell_healing_word"],
      spellsPrepared: ["spell_magic_missile", "spell_healing_word"],
      innateSpells: [],
      canCastSpells: true,
    } as any);

    render(<SpellbookBlock />);

    expect(screen.getByText("Spell Selection Warnings")).toBeInTheDocument();
    expect(screen.getByText("Known spells exceed limit by 1.")).toBeInTheDocument();
    expect(screen.getByText("Prepared spells exceed limit by 1.")).toBeInTheDocument();
    expect(screen.getByText("Invalid known spells:")).toBeInTheDocument();
    expect(screen.getByText("Invalid prepared spells:")).toBeInTheDocument();
    expect(screen.getAllByText("Healing Word").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Prepared Capacity: 2/2")).toBeInTheDocument();
  });

  it("filters add-spell options using all multiclass casting class ids", () => {
    vi.mocked(useSpellcasting).mockReturnValue({
      isSpellcaster: true,
      preparationType: "known",
      spellSaveDC: 14,
      spellAttackBonus: 6,
      maxSpellsKnown: 5,
      maxPreparedSpells: 0,
      classSpellcastingSummaries: [
        {
          classId: "class_wizard",
          classLevel: 3,
          preparationType: "prepared",
          spellcastingAbility: "int",
          maxCantrips: 3,
          maxSpellsKnown: 0,
          maxPreparedSpells: 6,
        },
        {
          classId: "class_cleric",
          classLevel: 2,
          preparationType: "prepared",
          spellcastingAbility: "wis",
          maxCantrips: 3,
          maxSpellsKnown: 0,
          maxPreparedSpells: 5,
        },
      ],
      spellSelectionDiagnostics: {
        invalidKnownSpellIds: [],
        invalidPreparedSpellIds: [],
        knownSpellOverflow: 0,
        preparedSpellOverflow: 0,
      },
      spellsKnown: [],
      spellsPrepared: [],
      innateSpells: [],
      canCastSpells: true,
    } as any);

    render(<SpellbookBlock />);

    expect(screen.getByRole("option", { name: "Lvl 1: Magic Missile" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Lvl 1: Healing Word" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Lvl 1: Dissonant Whispers" }),
    ).not.toBeInTheDocument();
  });
});
