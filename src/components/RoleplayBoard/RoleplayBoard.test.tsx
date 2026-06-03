// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleplayBoard } from "./RoleplayBoard";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getAllCharacterTraitsWithSources } from "../../utils/traitUtils";

vi.mock("../../store/useCharacterStore");
vi.mock("../../utils/traitUtils");

describe("RoleplayBoard", () => {
  const setStoreMock = (store: Record<string, unknown>) => {
    vi.mocked(useCharacterStore).mockImplementation(
      ((selector?: (state: Record<string, unknown>) => unknown) =>
        typeof selector === "function" ? selector(store) : store) as never,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    setStoreMock({
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
    });
  });

  it("derives traits using current character selections", () => {
    vi.mocked(getAllCharacterTraitsWithSources).mockReturnValue([
      {
        trait: {
          id: "trait_action_surge",
          name: "Action Surge",
          lore: {
            shortDescription: "Push yourself beyond your normal limits.",
          },
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

    expect(getAllCharacterTraitsWithSources).toHaveBeenCalledWith(
      3,
      "race_elf",
      "subrace_high_elf",
      "class_fighter",
      "subclass_champion",
      false,
      {},
      [],
      [],
    );
  });

  it("switches between Persona and Chronicle tabs", async () => {
    const user = userEvent.setup();

    vi.mocked(getAllCharacterTraitsWithSources).mockReturnValue([] as never);

    render(<RoleplayBoard />);

    expect(screen.getByLabelText("Backstory")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /persona/i }));
    expect(screen.getByLabelText("Personality Traits")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /chronicle/i }));
    expect(screen.getByLabelText("Backstory")).toBeInTheDocument();
  });
});
