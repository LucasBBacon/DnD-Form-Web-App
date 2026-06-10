/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOwnedFeatsWithSources,
  getSelectedFeatIds,
  formatFeatPrerequisites,
  isFeatEligible,
  resolveGrantedTraitIdsForSelectedFeats,
} from "./featUtils";
import {
  getClassById,
  getFeatById,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";

vi.mock("../data/staticDataApi", () => ({
  getClassById: vi.fn(),
  getFeatById: vi.fn(),
  getRaceById: vi.fn(),
  getSubclassById: vi.fn(),
  getSubraceById: vi.fn(),
  getTraitsByIds: vi.fn(),
}));

const createContext = () => ({
  level: 4,
  raceId: "race_human",
  subraceId: null,
  classId: "class_fighter",
  subclassId: null,
  totalScores: {
    str: 14,
    dex: 12,
    con: 13,
    int: 10,
    wis: 10,
    cha: 8,
  },
  choicesByLevel: {},
});

describe("featUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClassById).mockReturnValue(null);
    vi.mocked(getSubclassById).mockReturnValue(null);
    vi.mocked(getRaceById).mockReturnValue(null);
    vi.mocked(getSubraceById).mockReturnValue(null);
    vi.mocked(getTraitsByIds).mockReturnValue([] as any);
  });

  describe("getSelectedFeatIds", () => {
    it("collects unique feat ids up to the current level", () => {
      const result = getSelectedFeatIds(4, {
        2: { featId: "feat_alert" },
        4: { featId: "feat_mobile" },
        6: { featId: "feat_skilled" },
      });

      expect(result).toEqual(["feat_alert", "feat_mobile"]);
    });

    it("can limit collection to the exact level", () => {
      const result = getSelectedFeatIds(
        4,
        {
          2: { featId: "feat_alert" },
          4: { featId: "feat_mobile" },
        },
        true,
      );

      expect(result).toEqual(["feat_mobile"]);
    });

    it("includes feats from normalized acquisition entries", () => {
      const result = getSelectedFeatIds(
        4,
        {
          2: { featId: "feat_alert" },
        },
        [
          { featId: "feat_mobile", source: "level_up", sourceLevel: 4 },
          { featId: "feat_gifted_mind", source: "origin", sourceLevel: 1 },
        ],
      );

      expect(result).toEqual([
        "feat_alert",
        "feat_mobile",
        "feat_gifted_mind",
      ]);
    });
  });

  describe("isFeatEligible", () => {
    it("rejects non-repeatable feats that were already selected", () => {
      const result = isFeatEligible(
        {
          id: "feat_alert",
          name: "Alert",
          category: "general",
          grantedTraits: ["trait_feat_alert"],
          lore: { shortDescription: "" },
        },
        {
          ...createContext(),
          choicesByLevel: {
            4: { featId: "feat_alert" },
          },
        },
      );

      expect(result).toBe(false);
    });

    it("enforces minimum level, ability, and class requirements", () => {
      const result = isFeatEligible(
        {
          id: "feat_battle_hardened",
          name: "Battle Hardened",
          category: "general",
          grantedTraits: ["trait_feat_battle_hardened"],
          lore: { shortDescription: "" },
          prerequisites: {
            minimumLevel: 4,
            abilityMinimums: { str: 13 },
            requiredClassIds: ["class_fighter"],
          },
        },
        createContext(),
      );

      expect(result).toBe(true);
    });

    it("rejects feats whose prerequisites are not met", () => {
      const result = isFeatEligible(
        {
          id: "feat_spellbound",
          name: "Spellbound",
          category: "general",
          grantedTraits: ["trait_feat_spellbound"],
          lore: { shortDescription: "" },
          prerequisites: {
            requiresSpellcasting: true,
            requiredClassIds: ["class_wizard"],
          },
        },
        createContext(),
      );

      expect(result).toBe(false);
    });

    it("treats trait-granted spellcasting as meeting spellcasting prerequisites", () => {
      vi.mocked(getRaceById).mockReturnValue({
        traits: ["trait_racial_magic"],
      } as any);
      vi.mocked(getTraitsByIds).mockReturnValue([
        {
          id: "trait_racial_magic",
          effects: [{ type: "spell_grant", target: "spell_light" }],
        },
      ] as any);

      const result = isFeatEligible(
        {
          id: "feat_spellbound",
          name: "Spellbound",
          category: "general",
          grantedTraits: ["trait_feat_spellbound"],
          lore: { shortDescription: "" },
          prerequisites: {
            requiresSpellcasting: true,
          },
        },
        {
          ...createContext(),
          raceId: "race_high_elf",
        },
      );

      expect(result).toBe(true);
    });

    it("flips eligibility when ability minimums are no longer met", () => {
      const feat = {
        id: "feat_fleet_footed",
        name: "Fleet Footed",
        category: "origin" as const,
        grantedTraits: ["trait_feat_fleet_footed"],
        lore: { shortDescription: "" },
        prerequisites: {
          abilityMinimums: { dex: 12 },
        },
      };

      const eligibleResult = isFeatEligible(feat, createContext());
      const ineligibleResult = isFeatEligible(feat, {
        ...createContext(),
        totalScores: {
          ...createContext().totalScores,
          dex: 10,
        },
      });

      expect(eligibleResult).toBe(true);
      expect(ineligibleResult).toBe(false);
    });
  });

  describe("formatFeatPrerequisites", () => {
    it("formats mixed prerequisite requirements into one label", () => {
      vi.mocked(getFeatById).mockImplementation((featId) => {
        if (featId === "feat_alert") {
          return {
            id: "feat_alert",
            name: "Alert",
            grantedTraits: [],
          } as any;
        }

        return null;
      });

      vi.mocked(getClassById).mockReturnValue({ name: "Fighter" } as any);
      vi.mocked(getSubclassById).mockReturnValue({ name: "Champion" } as any);
      vi.mocked(getRaceById).mockReturnValue({ name: "Human" } as any);
      vi.mocked(getSubraceById).mockReturnValue({ name: "Variant Human" } as any);

      const result = formatFeatPrerequisites({
        id: "feat_test",
        name: "Test Feat",
        category: "general",
        grantedTraits: [],
        lore: { shortDescription: "" },
        prerequisites: {
          minimumLevel: 4,
          abilityMinimums: { str: 13, dex: 12 },
          requiredFeatIds: ["feat_alert"],
          requiredClassIds: ["class_fighter"],
          requiredSubclassIds: ["subclass_fighter_champion"],
          requiredRaceIds: ["race_human"],
          requiredSubraceIds: ["subrace_variant_human"],
          requiresSpellcasting: true,
        },
      });

      expect(result).toBe(
        "Prerequisite: level 4, Strength 13, Dexterity 12, feat Alert, class Fighter, subclass Champion, race Human, subrace Variant Human and spellcasting",
      );
    });

    it("falls back to readable ids when prerequisite lookups fail", () => {
      vi.mocked(getFeatById).mockReturnValue(null);
      vi.mocked(getClassById).mockReturnValue(null);
      vi.mocked(getSubclassById).mockReturnValue(null);
      vi.mocked(getRaceById).mockReturnValue(null);
      vi.mocked(getSubraceById).mockReturnValue(null);

      const result = formatFeatPrerequisites({
        id: "feat_test",
        name: "Test Feat",
        category: "general",
        grantedTraits: [],
        lore: { shortDescription: "" },
        prerequisites: {
          requiredFeatIds: ["feat_hidden_talent"],
          requiredClassIds: ["class_arcane_trickster"],
        },
      });

      expect(result).toBe(
        "Prerequisite: feat Feat Hidden Talent and class Class Arcane Trickster",
      );
    });
  });

  describe("resolveGrantedTraitIdsForSelectedFeats", () => {
    it("maps selected feats to their granted traits", () => {
      vi.mocked(getFeatById)
        .mockReturnValueOnce({
          id: "feat_alert",
          grantedTraits: ["trait_feat_alert"],
        } as any)
        .mockReturnValueOnce({
          id: "feat_mobile",
          grantedTraits: ["trait_feat_mobile", "trait_shared"],
        } as any);

      const result = resolveGrantedTraitIdsForSelectedFeats(4, {
        2: { featId: "feat_alert" },
        4: { featId: "feat_mobile" },
      });

      expect(result).toEqual([
        "trait_feat_alert",
        "trait_feat_mobile",
        "trait_shared",
      ]);
    });

    it("resolves traits for origin-source acquisition entries", () => {
      vi.mocked(getFeatById).mockReturnValue({
        id: "feat_gifted_mind",
        grantedTraits: ["trait_feat_gifted_mind"],
      } as any);

      const result = resolveGrantedTraitIdsForSelectedFeats(
        1,
        {},
        [{ featId: "feat_gifted_mind", source: "origin", sourceLevel: 1 }],
      );

      expect(result).toEqual(["trait_feat_gifted_mind"]);
    });
  });

  describe("getOwnedFeatsWithSources", () => {
    it("preserves level-up and origin provenance for owned feats", () => {
      vi.mocked(getFeatById)
        .mockImplementation((featId) => {
          const featMap: Record<string, any> = {
            feat_alert: {
              id: "feat_alert",
              name: "Alert",
              grantedTraits: ["trait_feat_alert"],
            },
            feat_origin_gift: {
              id: "feat_origin_gift",
              name: "Origin Gift",
              grantedTraits: ["trait_origin_gift"],
            },
          };

          return featMap[String(featId)] ?? null;
        });

      const result = getOwnedFeatsWithSources(
        4,
        {
          4: { featId: "feat_alert" },
        },
        [
          {
            featId: "feat_origin_gift",
            source: "origin",
            sourceLevel: 1,
          },
        ],
      );

      expect(result).toEqual([
        {
          feat: {
            id: "feat_alert",
            name: "Alert",
            grantedTraits: ["trait_feat_alert"],
          },
          source: "level_up",
          sourceLevel: 4,
        },
        {
          feat: {
            id: "feat_origin_gift",
            name: "Origin Gift",
            grantedTraits: ["trait_origin_gift"],
          },
          source: "origin",
          sourceLevel: 1,
        },
      ]);
    });
  });
});