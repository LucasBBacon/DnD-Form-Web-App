// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleplayBoard } from "./RoleplayBoard";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllCharacterTraitsWithSources } from "../utils/traitUtils";
import { useSpellcasting } from "../hooks/useSpellcasting";

vi.mock("../store/useCharacterStore");
vi.mock("../utils/traitUtils");
vi.mock("../hooks/useSpellcasting");
vi.mock("./SpellBookView", () => ({
  SpellBookView: () => <div data-testid="spellbook-view">Spellbook View</div>,
}));

describe("RoleplayBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSpellcasting).mockReturnValue({
      isSpellcaster: true,
      canCastSpells: true,
      casting: {
        ability: "int",
        preparationType: "prepared",
        saveDC: 15,
        attackBonus: 7,
      },
      pools: {
        known: { selected: [], max: 0 },
        prepared: { selected: [], max: 0 },
        cantrips: { max: 0 },
        bonusPrepared: [],
        allExpandedSpellIds: [],
        freeSchoolDesignated: [],
        freeSchoolSlots: 0,
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
          freeSchoolOverflow: 0,
        },
        classBreakdown: [],
      },
    } as never);

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 3,
      raceId: "race_elf",
      subraceId: "subrace_high_elf",
      classId: "class_fighter",
      subclassId: "subclass_champion",
      choicesByLevel: {},
      acquiredFeats: [],
      classTracks: [],
      updateRoleplayField: vi.fn(),
      personalityTraits: "",
      ideals: "",
      bonds: "",
      flaws: "",
      age: "",
      height: "",
      weight: "",
      eyes: "",
      skin: "",
      hair: "",
      appearance: "",
      backstory: "",
      alliesAndOrganizations: "",
    } as never);
  });

  it("renders formatted source labels for sourced traits", () => {
    vi.mocked(getAllCharacterTraitsWithSources).mockReturnValue([
      {
        trait: {
          id: "trait_action_surge",
          name: "Action Surge",
          lore: { shortDescription: "Push yourself beyond your normal limits." },
        },
        sources: [
          {
            kind: "class",
            label: "Fighter level 2",
            sourceId: "class_fighter",
            sourceName: "Fighter",
            level: 2,
          },
        ],
      },
      {
        trait: {
          id: "trait_darkvision",
          name: "Darkvision",
          lore: { shortDescription: "You can see in dim light." },
        },
        sources: [
          {
            kind: "race",
            label: "Elf",
            sourceId: "race_elf",
            sourceName: "Elf",
          },
          {
            kind: "feat",
            label: "Feat: Shadow Touched",
            sourceId: "feat_shadow_touched",
            sourceName: "Shadow Touched",
          },
        ],
      },
    ] as never);

    render(<RoleplayBoard />);

    expect(screen.getByText("Fighter level 2")).toBeInTheDocument();
    expect(screen.getByText("Action Surge")).toBeInTheDocument();
    expect(screen.getByText("Darkvision")).toBeInTheDocument();

    const sourceGroups = screen.getAllByLabelText("Feature sources");
    const darkvisionSources = sourceGroups[1];

    expect(within(darkvisionSources).getByText("Elf")).toBeInTheDocument();
    expect(
      within(darkvisionSources).getByText("Feat: Shadow Touched"),
    ).toBeInTheDocument();
  });

  it("opens Spellbook tab from roleplay tabs", async () => {
    const user = userEvent.setup();

    vi.mocked(getAllCharacterTraitsWithSources).mockReturnValue([] as never);

    render(<RoleplayBoard />);

    await user.click(screen.getByRole("button", { name: /spellbook/i }));

    expect(screen.getByTestId("spellbook-view")).toBeInTheDocument();
  });
});