/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllCharacterTraits } from "./traitUtils";
import {
  getClassById,
  getFeatsByIds,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";

vi.mock("../data/staticDataApi", () => ({
  getClassById: vi.fn(),
  getFeatsByIds: vi.fn(),
  getRaceById: vi.fn(),
  getSubclassById: vi.fn(),
  getSubraceById: vi.fn(),
  getTraitsByIds: vi.fn(),
}));

const createProgressionEntry = (level: number, features: string[] = []) =>
  ({
    level,
    features,
  }) as any;

const createRace = (traits: string[] = []) =>
  ({
    traits,
  }) as any;

const createSubrace = (traits_added: string[] = []) =>
  ({
    traits_added,
  }) as any;

const createClass = (progression: any[] = []) =>
  ({
    progression,
  }) as any;

const createSubclass = (progression: any[] = []) =>
  ({
    progression,
  }) as any;

describe("getAllCharacterTraits", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getTraitsByIds).mockImplementation((ids: string[]) =>
      ids.map((id) => ({ id, name: `Trait ${id}` })) as any,
    );
    vi.mocked(getFeatsByIds).mockReturnValue([] as any);
  });

  describe("base behavior", () => {
    it("returns an empty trait list when all ids are null", () => {
      const result = getAllCharacterTraits(1, null, null, null, null);

      expect(getRaceById).not.toHaveBeenCalled();
      expect(getSubraceById).not.toHaveBeenCalled();
      expect(getClassById).not.toHaveBeenCalled();
      expect(getSubclassById).not.toHaveBeenCalled();
      expect(getTraitsByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });

    it("returns whatever getTraitsByIds resolves for the collected ids", () => {
      const resolvedTraits = [{ id: "darkvision" }, { id: "fey-ancestry" }];
      vi.mocked(getRaceById).mockReturnValue(
        createRace(["darkvision", "fey-ancestry"]),
      );
      vi.mocked(getTraitsByIds).mockReturnValue(resolvedTraits as any);

      const result = getAllCharacterTraits(1, "elf", null, null, null);

      expect(result).toBe(resolvedTraits);
    });

    it("does not throw when an id is provided but the lookup returns null", () => {
      vi.mocked(getRaceById).mockReturnValue(null);
      vi.mocked(getSubraceById).mockReturnValue(null);
      vi.mocked(getClassById).mockReturnValue(null);
      vi.mocked(getSubclassById).mockReturnValue(null);

      const result = getAllCharacterTraits(
        3,
        "missing-race",
        "missing-subrace",
        "missing-class",
        "missing-subclass",
      );

      expect(getTraitsByIds).toHaveBeenCalledWith([]);
      expect(result).toEqual([]);
    });
  });

  describe("lookup wiring", () => {
    it("passes the provided ids to the data lookup functions", () => {
      vi.mocked(getRaceById).mockReturnValue(createRace(["race-trait"]));
      vi.mocked(getSubraceById).mockReturnValue(createSubrace(["subrace-trait"]));
      vi.mocked(getClassById).mockReturnValue(
        createClass([createProgressionEntry(1, ["class-trait"])]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([createProgressionEntry(1, ["subclass-trait"])]),
      );

      getAllCharacterTraits(1, "elf", "high-elf", "wizard", "evocation");

      expect(getRaceById).toHaveBeenCalledWith("elf");
      expect(getSubraceById).toHaveBeenCalledWith("high-elf");
      expect(getClassById).toHaveBeenCalledWith("wizard");
      expect(getSubclassById).toHaveBeenCalledWith("evocation");
    });

    it("skips lookups for null ids", () => {
      vi.mocked(getClassById).mockReturnValue(
        createClass([createProgressionEntry(1, ["class-trait"])]),
      );

      getAllCharacterTraits(1, null, null, "fighter", null);

      expect(getRaceById).not.toHaveBeenCalled();
      expect(getSubraceById).not.toHaveBeenCalled();
      expect(getClassById).toHaveBeenCalledWith("fighter");
      expect(getSubclassById).not.toHaveBeenCalled();
    });
  });

  describe("non-exact level behavior", () => {
    it("includes racial, subracial, class, and subclass traits up to the current level", () => {
      vi.mocked(getRaceById).mockReturnValue(
        createRace(["darkvision", "keen-senses"]),
      );
      vi.mocked(getSubraceById).mockReturnValue(
        createSubrace(["cantrip", "extra-language"]),
      );
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["spellcasting"]),
          createProgressionEntry(2, ["arcane-recovery"]),
          createProgressionEntry(4, ["asi"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(2, ["sculpt-spells"]),
          createProgressionEntry(5, ["potent-cantrip"]),
        ]),
      );

      const result = getAllCharacterTraits(
        3,
        "elf",
        "high-elf",
        "wizard",
        "evocation",
      );

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "darkvision",
        "keen-senses",
        "cantrip",
        "extra-language",
        "spellcasting",
        "arcane-recovery",
        "sculpt-spells",
      ]);

      expect(result).toEqual([
        { id: "darkvision", name: "Trait darkvision" },
        { id: "keen-senses", name: "Trait keen-senses" },
        { id: "cantrip", name: "Trait cantrip" },
        { id: "extra-language", name: "Trait extra-language" },
        { id: "spellcasting", name: "Trait spellcasting" },
        { id: "arcane-recovery", name: "Trait arcane-recovery" },
        { id: "sculpt-spells", name: "Trait sculpt-spells" },
      ]);
    });

    it("includes racial traits even above level 1 when exactLevel is false", () => {
      vi.mocked(getRaceById).mockReturnValue(createRace(["brave"]));

      getAllCharacterTraits(10, "halfling", null, null, null, false);

      expect(getTraitsByIds).toHaveBeenCalledWith(["brave"]);
    });

    it("excludes class and subclass features above the current level", () => {
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["fighting-style"]),
          createProgressionEntry(3, ["martial-archetype"]),
          createProgressionEntry(5, ["extra-attack"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(3, ["improved-critical"]),
          createProgressionEntry(7, ["remarkable-athlete"]),
        ]),
      );

      getAllCharacterTraits(3, null, null, "fighter", "champion");

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "fighting-style",
        "martial-archetype",
        "improved-critical",
      ]);
    });
  });

  describe("exact level behavior", () => {
    it("includes racial and subracial traits at level 1 when exactLevel is true", () => {
      vi.mocked(getRaceById).mockReturnValue(
        createRace(["darkvision", "fey-ancestry"]),
      );
      vi.mocked(getSubraceById).mockReturnValue(createSubrace(["cantrip"]));
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["spellcasting"]),
          createProgressionEntry(2, ["arcane-recovery"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(1, ["subclass-level-one"]),
          createProgressionEntry(2, ["subclass-level-two"]),
        ]),
      );

      getAllCharacterTraits(1, "elf", "high-elf", "wizard", "some-subclass", true);

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "darkvision",
        "fey-ancestry",
        "cantrip",
        "spellcasting",
        "subclass-level-one",
      ]);
    });

    it("excludes racial and subracial traits above level 1 when exactLevel is true", () => {
      vi.mocked(getRaceById).mockReturnValue(createRace(["darkvision"]));
      vi.mocked(getSubraceById).mockReturnValue(createSubrace(["cantrip"]));
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["spellcasting"]),
          createProgressionEntry(3, ["metamagic"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(2, ["subclass-two"]),
          createProgressionEntry(3, ["subclass-three"]),
        ]),
      );

      getAllCharacterTraits(3, "elf", "high-elf", "sorcerer", "draconic", true);

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "metamagic",
        "subclass-three",
      ]);
    });

    it("includes only class and subclass features exactly at the requested level", () => {
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["rage"]),
          createProgressionEntry(2, ["reckless-attack"]),
          createProgressionEntry(3, ["primal-path"]),
          createProgressionEntry(4, ["asi"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(2, ["danger-sense-bonus"]),
          createProgressionEntry(3, ["frenzy"]),
          createProgressionEntry(6, ["mindless-rage"]),
        ]),
      );

      getAllCharacterTraits(3, null, null, "barbarian", "berserker", true);

      expect(getTraitsByIds).toHaveBeenCalledWith(["primal-path", "frenzy"]);
    });
  });

  describe("deduplication", () => {
    it("deduplicates trait ids gathered from all sources", () => {
      vi.mocked(getRaceById).mockReturnValue(
        createRace(["darkvision", "shared-trait"]),
      );
      vi.mocked(getSubraceById).mockReturnValue(
        createSubrace(["shared-trait", "subrace-only"]),
      );
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["shared-trait", "class-only"]),
          createProgressionEntry(2, ["class-only", "another-class-trait"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(2, ["shared-trait", "subclass-only"]),
        ]),
      );

      getAllCharacterTraits(2, "elf", "high-elf", "wizard", "evocation");

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "darkvision",
        "shared-trait",
        "subrace-only",
        "class-only",
        "another-class-trait",
        "subclass-only",
      ]);
    });

    it("preserves insertion order based on source traversal", () => {
      vi.mocked(getRaceById).mockReturnValue(createRace(["race-a", "race-b"]));
      vi.mocked(getSubraceById).mockReturnValue(
        createSubrace(["subrace-a", "subrace-b"]),
      );
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["class-1a", "class-1b"]),
          createProgressionEntry(2, ["class-2a"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(2, ["subclass-2a", "subclass-2b"]),
        ]),
      );

      getAllCharacterTraits(2, "race", "subrace", "class", "subclass");

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "race-a",
        "race-b",
        "subrace-a",
        "subrace-b",
        "class-1a",
        "class-1b",
        "class-2a",
        "subclass-2a",
        "subclass-2b",
      ]);
    });
  });

  describe("partial source coverage", () => {
    it("works when only racial sources exist", () => {
      vi.mocked(getRaceById).mockReturnValue(createRace(["darkvision"]));
      vi.mocked(getSubraceById).mockReturnValue(createSubrace(["cantrip"]));

      getAllCharacterTraits(1, "elf", "high-elf", null, null);

      expect(getTraitsByIds).toHaveBeenCalledWith(["darkvision", "cantrip"]);
    });

    it("works when only class and subclass sources exist", () => {
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["spellcasting"]),
          createProgressionEntry(2, ["invocations"]),
        ]),
      );
      vi.mocked(getSubclassById).mockReturnValue(
        createSubclass([
          createProgressionEntry(1, ["patron-feature"]),
          createProgressionEntry(6, ["higher-feature"]),
        ]),
      );

      getAllCharacterTraits(2, null, null, "warlock", "fiend");

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "spellcasting",
        "invocations",
        "patron-feature",
      ]);
    });

    it("works when subclass is absent but class progression exists", () => {
      vi.mocked(getClassById).mockReturnValue(
        createClass([
          createProgressionEntry(1, ["sneak-attack"]),
          createProgressionEntry(2, ["cunning-action"]),
        ]),
      );

      getAllCharacterTraits(2, null, null, "rogue", null);

      expect(getTraitsByIds).toHaveBeenCalledWith([
        "sneak-attack",
        "cunning-action",
      ]);
    });
  });

  describe("feat integration", () => {
    it("includes traits granted by feats selected up to the current level", () => {
      vi.mocked(getFeatsByIds).mockReturnValue([
        {
          id: "feat_alert",
          granted_traits: ["trait_feat_alert"],
        },
        {
          id: "feat_mobile",
          granted_traits: ["trait_feat_mobile"],
        },
      ] as any);

      getAllCharacterTraits(
        4,
        null,
        null,
        null,
        null,
        false,
        {
          2: { featId: "feat_alert" },
          4: { featId: "feat_mobile" },
        },
      );

      expect(getFeatsByIds).toHaveBeenCalledWith([
        "feat_alert",
        "feat_mobile",
      ]);
      expect(getTraitsByIds).toHaveBeenCalledWith([
        "trait_feat_alert",
        "trait_feat_mobile",
      ]);
    });

    it("includes only traits granted by feats selected exactly on that level when exactLevel is true", () => {
      vi.mocked(getFeatsByIds).mockReturnValue([
        {
          id: "feat_mobile",
          granted_traits: ["trait_feat_mobile"],
        },
      ] as any);

      getAllCharacterTraits(
        4,
        null,
        null,
        null,
        null,
        true,
        {
          2: { featId: "feat_alert" },
          4: { featId: "feat_mobile" },
        },
      );

      expect(getFeatsByIds).toHaveBeenCalledWith(["feat_mobile"]);
      expect(getTraitsByIds).toHaveBeenCalledWith(["trait_feat_mobile"]);
    });
  });
});