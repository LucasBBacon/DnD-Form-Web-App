import { describe, expect, it } from "vitest";
import { formatCpAsCoinage, formatCpAsMaxCoinValue } from "./currencyUtils";

describe("currencyUtils", () => {
  it("formats exact gold-piece values compactly", () => {
    expect(formatCpAsCoinage(1500)).toBe("15 GP");
  });

  it("formats mixed values as gp/sp/cp by default", () => {
    expect(formatCpAsCoinage(115)).toBe("1 GP 1 SP 5 CP");
  });

  it("supports electrum and platinum when enabled", () => {
    expect(
      formatCpAsCoinage(2155, {
        allowElectrum: true,
        allowPlatinum: true,
      }),
    ).toBe("2 PP 1 GP 1 EP 5 CP");
  });

  it("returns 0 CP for non-positive values", () => {
    expect(formatCpAsCoinage(0)).toBe("0 CP");
    expect(formatCpAsCoinage(-5)).toBe("0 CP");
  });

  it("formats high values as decimal gold pieces", () => {
    expect(formatCpAsMaxCoinValue(1575)).toBe("15.75 Gold pieces");
    expect(formatCpAsMaxCoinValue(1500)).toBe("15 Gold pieces");
  });

  it("formats mid values as decimal silver pieces", () => {
    expect(formatCpAsMaxCoinValue(83)).toBe("8.3 Silver pieces");
    expect(formatCpAsMaxCoinValue(10)).toBe("1 Silver piece");
  });

  it("formats low values as copper pieces", () => {
    expect(formatCpAsMaxCoinValue(9)).toBe("9 Copper pieces");
    expect(formatCpAsMaxCoinValue(1)).toBe("1 Copper piece");
  });

  it("treats non-positive values as zero copper pieces", () => {
    expect(formatCpAsMaxCoinValue(0)).toBe("0 Copper pieces");
    expect(formatCpAsMaxCoinValue(-20)).toBe("0 Copper pieces");
  });
});
