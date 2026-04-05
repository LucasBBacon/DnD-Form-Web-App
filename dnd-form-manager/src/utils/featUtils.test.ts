/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSelectedFeatIds,
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
  });

  describe("isFeatEligible", () => {
    it("rejects non-repeatable feats that were already selected", () => {
      const result = isFeatEligible(
        {
          id: "feat_alert",
          name: "Alert",
          category: "general",
          granted_traits: ["trait_feat_alert"],
          lore: { short_description: "" },
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
          granted_traits: ["trait_feat_battle_hardened"],
          lore: { short_description: "" },
          prerequisites: {
            minimum_level: 4,
            ability_minimums: { str: 13 },
            required_class_ids: ["class_fighter"],
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
          granted_traits: ["trait_feat_spellbound"],
          lore: { short_description: "" },
          prerequisites: {
            requires_spellcasting: true,
            required_class_ids: ["class_wizard"],
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
          granted_traits: ["trait_feat_spellbound"],
          lore: { short_description: "" },
          prerequisites: {
            requires_spellcasting: true,
          },
        },
        {
          ...createContext(),
          raceId: "race_high_elf",
        },
      );

      expect(result).toBe(true);
    });
  });

  describe("resolveGrantedTraitIdsForSelectedFeats", () => {
    it("maps selected feats to their granted traits", () => {
      vi.mocked(getFeatById)
        .mockReturnValueOnce({
          id: "feat_alert",
          granted_traits: ["trait_feat_alert"],
        } as any)
        .mockReturnValueOnce({
          id: "feat_mobile",
          granted_traits: ["trait_feat_mobile", "trait_shared"],
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
  });
});