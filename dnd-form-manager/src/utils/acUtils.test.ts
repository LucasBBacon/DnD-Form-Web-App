import { describe, expect, it } from "vitest";
import { calculateArmorClass, type EquippedArmorItem } from "./acUtils";

const makeArmor = (
  armorType: "light" | "medium" | "heavy",
  baseAc: number,
): EquippedArmorItem =>
  ({
    type: "armor",
    armorProperties: {
      acApplication: "set",
      armorType,
      baseAc,
      dexModifier:
        armorType === "medium"
          ? { mode: "capped", cap: 2 }
          : armorType === "heavy"
            ? { mode: "none" }
            : { mode: "full" },
      stealthDisadvantage: false,
    },
  }) as EquippedArmorItem;

const makeShield = (baseAc: number): EquippedArmorItem =>
  ({
    type: "armor",
    armorProperties: {
      acApplication: "bonus",
      armorType: "shield",
      baseAc,
      dexModifier: { mode: "none" },
      stealthDisadvantage: false,
    },
  }) as EquippedArmorItem;

describe("calculateArmorClass", () => {
  describe("unarmored calculations", () => {
    it("uses base 10 + full Dex modifier when unarmored", () => {
      expect(calculateArmorClass(3, null, null)).toBe(13);
    });

    it("applies negative Dex modifier when unarmored", () => {
      expect(calculateArmorClass(-2, null, null)).toBe(8);
    });

    it("adds unarmored defense modifier when provided", () => {
      expect(calculateArmorClass(3, null, null, 2)).toBe(15); // 10 + 3 + 2
    });

    it("does not change AC when unarmored defense is 0", () => {
      expect(calculateArmorClass(3, null, null, 0)).toBe(13);
    });

    it("adds shield bonus while unarmored", () => {
      expect(calculateArmorClass(2, null, makeShield(2))).toBe(14); // 10 + 2 + 2
    });

    it("adds flat bonuses while unarmored", () => {
      expect(calculateArmorClass(2, null, null, undefined, 1)).toBe(13);
    });

    it("supports negative flat bonuses while unarmored", () => {
      expect(calculateArmorClass(2, null, null, undefined, -1)).toBe(11);
    });

    it("stacks unarmored defense, shield, and flat bonuses", () => {
      expect(calculateArmorClass(2, null, makeShield(2), 3, 1)).toBe(18); // 10 + 2 + 3 + 2 + 1
    });
  });

  describe("light armor", () => {
    const lightArmor = makeArmor("light", 11);

    it("uses armor base AC + full Dex modifier", () => {
      expect(calculateArmorClass(4, lightArmor, null)).toBe(15);
    });

    it("applies negative Dex modifier with light armor", () => {
      expect(calculateArmorClass(-1, lightArmor, null)).toBe(10);
    });

    it("adds shield and flat bonuses with light armor", () => {
      expect(calculateArmorClass(3, lightArmor, makeShield(2), undefined, 1)).toBe(17); // 11 + 3 + 2 + 1
    });
  });

  describe("medium armor", () => {
    const mediumArmor = makeArmor("medium", 14);

    it("caps positive Dex modifier at +2", () => {
      expect(calculateArmorClass(5, mediumArmor, null)).toBe(16); // 14 + 2
    });

    it("does not cap Dex modifier when <= +2", () => {
      expect(calculateArmorClass(1, mediumArmor, null)).toBe(15);
    });

    it("applies negative Dex modifier fully (5e rule behavior)", () => {
      expect(calculateArmorClass(-2, mediumArmor, null)).toBe(12); // 14 - 2
    });

    it("adds shield and flat bonuses with medium armor", () => {
      expect(calculateArmorClass(4, mediumArmor, makeShield(2), undefined, 2)).toBe(20); // 14 + 2 + 2 + 2
    });
  });

  describe("heavy armor", () => {
    const heavyArmor = makeArmor("heavy", 16);

    it("ignores positive Dex modifier", () => {
      expect(calculateArmorClass(4, heavyArmor, null)).toBe(16);
    });

    it("ignores negative Dex modifier", () => {
      expect(calculateArmorClass(-3, heavyArmor, null)).toBe(16);
    });

    it("adds shield and flat bonuses with heavy armor", () => {
      expect(calculateArmorClass(5, heavyArmor, makeShield(2), undefined, 1)).toBe(19); // 16 + 0 + 2 + 1
    });

    it("supports negative flat bonuses with heavy armor", () => {
      expect(calculateArmorClass(2, heavyArmor, null, undefined, -2)).toBe(14);
    });
  });

  describe("cross-check scenarios", () => {
    it("does not use unarmored defense while wearing armor", () => {
      const lightArmor = makeArmor("light", 12);
      expect(calculateArmorClass(3, lightArmor, null, 4)).toBe(15); // not 19
    });

    it("works for high-level stacked defensive setup", () => {
      const mediumArmor = makeArmor("medium", 15);
      expect(calculateArmorClass(4, mediumArmor, makeShield(2), 3, 2)).toBe(21); // 15 + 2 (cap) + 2 shield + 2 flat
    });

    it("uses shield base AC for AC bonuses", () => {
      const lightArmor = makeArmor("light", 11);
      expect(calculateArmorClass(3, lightArmor, makeShield(3))).toBe(17); // 11 + 3 + 3
    });

    it("supports custom capped dex values", () => {
      const mediumArmor = makeArmor("medium", 14);
      mediumArmor.armorProperties.dexModifier = { mode: "capped", cap: 1 };
      expect(calculateArmorClass(4, mediumArmor, null)).toBe(15); // 14 + 1
    });
  });
});
