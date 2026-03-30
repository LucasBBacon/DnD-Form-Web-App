import { test, expect } from "vitest";
import { rollDice } from "./dice";

test("rolls a d6 in range", () => {
	const result = rollDice({ count: 1, faces: 6 });
	expect(result).toBeGreaterThan(0);
	expect(result).toBeLessThan(7);
});