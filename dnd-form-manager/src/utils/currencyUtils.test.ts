import { describe, expect, it } from "vitest";
import { formatCpAsCoinage } from "./currencyUtils";

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
});
